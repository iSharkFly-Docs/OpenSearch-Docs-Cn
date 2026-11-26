---
title: 时间点
---

# 时间点

时间点（Point in Time，PIT）可以让你针对一个固定在某一时刻的数据集运行不同的查询（Query）。 

通常情况下，如果对一个索引（Index）多次运行同一查询，由于文档（Document）在不断地被索引、更新和删除，同一查询可能会返回不同的结果。如果需要针对相同的数据运行查询，可以通过创建 PIT 来保留该数据的状态。PIT 功能的主要用途是与 `search_after` 功能结合使用，对搜索结果进行深度分页（pagination）。

## 对搜索结果分页

除了 PIT 功能之外，OpenSearch 中还有三种[对搜索结果分页](/search-plugins/searching-data/paginate)的方法：使用 Scroll API、在搜索中指定 `from` 和 `size` 参数，以及使用 `search_after` 功能。但这三种方法都有局限性：

- Scroll API 的搜索结果会冻结在请求发出的那一刻，但它们与特定的查询绑定。此外，scroll 在搜索中只能向前移动，因此如果某一页的请求失败，后续请求会跳过该页并返回下一页。
- 如果在搜索中指定 `from` 和 `size` 参数，搜索结果不会冻结在某个时间点，因此可能会因为文档的索引或删除而不一致。不建议将 `from` 和 `size` 功能用于深度分页，因为每次请求一页都需要处理所有结果，再从中筛选出所请求的页。
- `search_after` 的搜索结果不会冻结在某个时间点，因此可能会因为并发的文档索引或删除而不一致。

PIT 功能没有其他分页方法的这些局限，因为 PIT 搜索不与查询绑定，并且支持向前和向后的一致性分页。如果你已经查看了结果的第一页，现在位于第二页，那么返回时看到的仍是相同的第一页。

## PIT 搜索

PIT 搜索具有与常规搜索相同的能力，区别在于 PIT 搜索作用于较旧的数据集，而常规搜索作用于实时数据集。PIT 搜索不与查询绑定，因此可以在同一个冻结于某一时刻的数据集上运行不同的查询。 

可以使用[创建 PIT API](/search-plugins/searching-data/point-in-time-api#create-a-pit) 来创建 PIT。为一组索引创建 PIT 时，OpenSearch 会锁定这些索引的一组段（Segment），将其冻结在该时刻。在更底层，该 PIT 所需的任何资源都不会被修改或删除。如果属于某个 PIT 的段被合并，OpenSearch 会在创建 PIT 时由 `keep_alive` 参数指定的时间段内保留这些段的副本。 

创建 PIT 操作会返回一个 PIT ID，你可以用它在冻结的数据集上运行多个查询。即使索引继续摄取数据、修改或删除文档，PIT 引用的仍是自 PIT 创建以来未发生变化的数据。当查询中包含 PIT ID 时，无需在搜索中传入索引，因为搜索会使用该 PIT。使用 PIT ID 的搜索在多次运行时会产生完全相同的结果。

::: info 注意
如果发生集群或节点故障，所有 PIT 数据都会丢失。
:::

## 使用 PIT 和 search_after 进行分页 {#pagination-with-pit-and-searchafter}

使用 PIT ID 运行查询时，可以使用 `search_after` 参数获取下一页结果。这样你就可以控制结果页中文档的顺序。

使用 PIT ID 运行搜索查询：

```json
GET /_search
{
  "size": 10000,
  "query": {
    "match" : {
      "user.id" : "elkbee"
    }
  },
  "pit": {
    "id":  "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA==", 
    "keep_alive": "100m"
  },
  "sort": [ 
    {"@timestamp": {"order": "asc"}}
  ]
}
```

响应包含与查询匹配的前 10,000 个文档。要获取下一组文档，请运行相同的查询，将最后一个文档的排序值作为 `search_after` 参数，并保持相同的 `sort` 和 `pit.id`。可以使用可选的 `keep_alive` 参数延长 PIT 的保留时间：

```json
GET /_search
{
  "size": 10000,
  "query": {
    "match" : {
      "user.id" : "elkbee"
    }
  },
  "pit": {
    "id":  "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA==", 
    "keep_alive": "100m"
  },
  "sort": [ 
    {"@timestamp": {"order": "asc"}}
  ],
  "search_after": [  
    "2021-05-20T05:30:04.832Z"
  ]
}
```

## 搜索切片

将 `search_after` 与 PIT 结合用于分页，可以控制结果的排序。如果不需要结果按特定顺序排列，或者希望能够从某一页跳到不连续的另一页，可以使用搜索切片。搜索切片会将一个 PIT 搜索拆分为多个切片，客户端应用程序可以独立地消费这些切片。

例如，如果某个 PIT 搜索查询有 1,000,000 个结果，而你希望每次返回 50,000 个结果，那么客户端应用程序需要连续调用 20 次才能接收每一批结果。如果使用搜索切片，就可以并行执行这 20 次调用。在多线程客户端应用程序中，可以为每个 PIT 使用 5 个切片。这样，你将得到 5 个各含 10,000 个命中（hit）的切片，可以由客户端中的 5 个不同线程分别消费，而不是由单个线程消费 50,000 个结果。 

要使用搜索切片，必须指定两个参数：
- `slice.id` 是所请求切片的 ID。 
- `slice.max` 是将搜索响应拆分成的切片数量。 

以下 PIT 搜索查询演示了搜索切片：

```json

GET /_search
{
  "slice": {
    "id": 0,  // id 是所请求的切片（页）编号。每次请求只能查询一个切片                    
    "max": 2  // max 是搜索响应将被拆分成的切片（页）总数                  
  },
  "query": {
    "match": {
      "message": "foo"
    }
  },
  "pit": {
    "id": "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA=="
  }
}
```

每次请求只能查询一个切片，因此下一个查询与上一个查询相同，只是 `slice.id` 为 `1`。

## 安全模型

本节介绍在启用 Security 插件（plugin）运行 OpenSearch 时，使用 PIT API 操作所需的权限（permission）。

用户可以通过 `point_in_time_full_access` 角色（role）访问所有 PIT API 操作。如果该角色不能满足你的需求，可以根据使用场景组合各个 PIT 权限。每个操作都对应 REST API 中的一个操作。例如，`indices:data/read/point_in_time/create` 权限允许你创建 PIT。可用的权限如下：

- `indices:data/read/point_in_time/create` &ndash; 创建 API
- `indices:data/read/point_in_time/delete` &ndash; 删除 API
- `indices:data/read/point_in_time/readall` &ndash; 列出所有 PIT API
- `indices:data/read/search` &ndash; 搜索 API
- `indices:monitor/point_in_time/segments` &ndash; PIT 段 API

对于 `all` 类 API 操作（例如列出全部和删除全部），用户需要拥有所有索引（*）的权限。对于搜索、创建 PIT 或删除列表等 API 操作，用户只需拥有单个索引的权限。

PIT ID 在保存时始终包含底层（已解析的）索引。以下各节介绍别名（Alias）和数据流所需的权限。

### 别名权限

对于别名，用户必须拥有索引权限**或**别名权限，才能执行任何 PIT 操作。

### 数据流权限

对于数据流，用户必须同时拥有数据流权限**和**该数据流的后备索引权限，才能执行任何 PIT 操作。例如，用户必须拥有 `data-stream-11` 数据流及其后备索引 `.ds-my-data-stream11-000001` 的权限。

如果用户只有数据流权限，则可以创建 PIT，但在没有后备索引权限的情况下，无法将 PIT ID 用于搜索等其他操作。

## API

下表列出了所有[时间点 API](/search-plugins/searching-data/point-in-time-api) 函数。

函数 | API | 说明
:--- | :--- | :---
[创建 PIT](/search-plugins/searching-data/point-in-time-api#create-a-pit) | `POST /<target_indexes>/_search/point_in_time?keep_alive=1h` | 创建 PIT。
[列出 PIT](/search-plugins/searching-data/point-in-time-api#list-all-pits) | `GET /_search/point_in_time/_all` | 列出所有 PIT。
[删除 PIT](/search-plugins/searching-data/point-in-time-api#delete-pits) | `DELETE /_search/point_in_time`<br> `DELETE /_search/point_in_time/_all` | 删除一个 PIT 或所有 PIT。
[PIT 段](/search-plugins/searching-data/point-in-time-api#pit-segments) | `GET /_cat/pit_segments/_all` | 通过描述 PIT 的 Lucene 段，提供有关该 PIT 磁盘使用情况的信息。

有关相关的集群和节点设置，请参阅 [PIT 设置](/search-plugins/searching-data/point-in-time-api#pit-settings)。
