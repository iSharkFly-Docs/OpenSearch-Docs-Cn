---
title: 异步搜索
---

# 异步搜索

搜索大量数据可能需要很长时间，尤其是在跨温节点（warm node）或多个远程集群进行搜索时。

OpenSearch 中的异步搜索（Asynchronous Search）允许你发送在后台运行的搜索请求。你可以监控这些搜索的进度，并在部分结果可用时获取它们。搜索完成后，你可以保存结果，以便稍后查看。

## REST API
<Badge type="tip" text="Introduced 1.0" />

要执行异步搜索，请向 `_plugins/_asynchronous_search` 发送请求，并在请求体中包含查询：

```json
POST _plugins/_asynchronous_search
```

你可以指定以下选项。

选项 | 描述 | 默认值 | 必需
:--- | :--- |:--- |:--- |
`wait_for_completion_timeout` |  你计划等待结果的时间。在这段时间内得到的结果都可以像普通搜索一样查看。剩余结果可以根据 ID 轮询获取。最大值为 300 秒。 | 1 秒 | 否
`keep_on_completion` |  搜索完成后是否将结果保存在集群中。你可以稍后查看已保存的结果。 | `false` | 否
`keep_alive` |  结果在集群中保存的时长。例如，`2d` 表示结果在集群中保存 48 小时。超过该时长或搜索被取消后，已保存的搜索结果会被删除。注意，该时长包含查询执行时间。如果查询运行超过该时长，进程会自动取消该查询。 | 12 小时 | 否

#### 示例请求

```json
POST _plugins/_asynchronous_search/?pretty&size=10&wait_for_completion_timeout=1ms&keep_on_completion=true&request_cache=false
{
  "aggs": {
    "city": {
      "terms": {
        "field": "city",
        "size": 10
      }
    }
  }
}
```

#### 示例响应

```json
{
  "*id*": "FklfVlU4eFdIUTh1Q1hyM3ZnT19fUVEUd29KLWZYUUI3TzRpdU5wMjRYOHgAAAAAAAAABg==",
  "state": "RUNNING",
  "start_time_in_millis": 1599833301297,
  "expiration_time_in_millis": 1600265301297,
  "response": {
    "took": 15,
    "timed_out": false,
    "terminated_early": false,
    "num_reduce_phases": 4,
    "_shards": {
      "total": 21,
      "successful": 4,
      "skipped": 0,
      "failed": 0
    },
    "hits": {
      "total": {
        "value": 807,
        "relation": "eq"
      },
      "max_score": null,
      "hits": []
    },
    "aggregations": {
      "city": {
        "doc_count_error_upper_bound": 16,
        "sum_other_doc_count": 403,
        "buckets": [
          {
            "key": "downsville",
            "doc_count": 1
          },
        ....
        ....
        ....
          {
            "key": "blairstown",
            "doc_count": 1
          }
        ]
      }
    }
  }
}
```

#### 响应参数

选项 | 描述
:--- | :---
`id` | 异步搜索的 ID。使用该 ID 可以监控搜索进度、获取部分结果和/或删除结果。如果异步搜索在超时时间内完成，响应中不包含该 ID，因为结果不会存储在集群中。
`state` | 表示搜索仍在运行还是已经完成，以及结果是否持久化在集群中。可能的状态有 `RUNNING`、`SUCCEEDED`、`FAILED`、`PERSISTING`、`PERSIST_SUCCEEDED`、`PERSIST_FAILED`、`CLOSED` 和 `STORE_RESIDENT`。
`start_time_in_millis` | 开始时间，单位为毫秒。
`expiration_time_in_millis` | 过期时间，单位为毫秒。
`took` | 搜索运行的总时间。
`response` | 实际的搜索响应。
`num_reduce_phases` | 协调节点汇总一批批分片响应结果的次数（默认为 5）。如果该数字比上次获取结果时有所增加，说明搜索响应中会包含更多结果。
`total` | 运行该搜索的分片总数。
`successful` | 协调节点成功接收的分片响应数。
`aggregations` | 到目前为止各分片已完成的部分聚合结果。

## 获取部分结果
<Badge type="tip" text="Introduced 1.0" />

提交异步搜索请求后，你可以使用异步搜索响应中的 ID 请求部分响应。

```json
GET _plugins/_asynchronous_search/<ID>?pretty
```

#### 示例响应 {#example-response-1}

```json
{
  "id": "Fk9lQk5aWHJIUUltR2xGWnpVcWtFdVEURUN1SWZYUUJBVkFVMEJCTUlZUUoAAAAAAAAAAg==",
  "state": "STORE_RESIDENT",
  "start_time_in_millis": 1599833907465,
  "expiration_time_in_millis": 1600265907465,
  "response": {
    "took": 83,
    "timed_out": false,
    "_shards": {
      "total": 20,
      "successful": 20,
      "skipped": 0,
      "failed": 0
    },
    "hits": {
      "total": {
        "value": 1000,
        "relation": "eq"
      },
      "max_score": 1,
      "hits": [
        {
          "_index": "bank",
          "_id": "1",
          "_score": 1,
          "_source": {
            "email": "amberduke@abc.com",
            "city": "Brogan",
            "state": "IL"
          }
        },
       {....}
      ]
    },
    "aggregations": {
      "city": {
        "doc_count_error_upper_bound": 0,
        "sum_other_doc_count": 997,
        "buckets": [
          {
            "key": "belvoir",
            "doc_count": 2
          },
          {
            "key": "aberdeen",
            "doc_count": 1
          },
          {
            "key": "abiquiu",
            "doc_count": 1
          }
        ]
      }
    }
  }
}
```

响应成功持久化后，响应中会返回 `STORE_RESIDENT` 状态。

你可以结合 `wait_for_completion_timeout` 参数轮询该 ID，在指定的时间内等待接收结果。

对于 `keep_on_completion` 为 `true` 且 `keep_alive` 时间足够长的异步搜索，你可以一直轮询这些 ID，直到搜索完成。如果不想定期轮询每个 ID，可以通过 `keep_alive` 参数将结果保留在集群中，稍后再来查看。

## 删除搜索和结果
<Badge type="tip" text="Introduced 1.0" />

要删除异步搜索：

```
DELETE _plugins/_asynchronous_search/<ID>?pretty
```

- 如果搜索仍在运行，OpenSearch 会取消该搜索。
- 如果搜索已完成，OpenSearch 会删除已保存的结果。

#### 示例响应 {#example-response-2}

```json
{
  "acknowledged": "true"
}
```

## 监控统计信息
<Badge type="tip" text="Introduced 1.0" />

你可以使用 stats API 操作来监控正在运行、已完成和/或已持久化的异步搜索。

```json
GET _plugins/_asynchronous_search/stats
```

#### 示例响应 {#example-response-3}

```json
{
  "_nodes": {
    "total": 8,
    "successful": 8,
    "failed": 0
  },
  "cluster_name": "264071961897:asynchronous-search",
  "nodes": {
    "JKEFl6pdRC-xNkKQauy7Yg": {
      "asynchronous_search_stats": {
        "submitted": 18236,
        "initialized": 112,
        "search_failed": 56,
        "search_completed": 56,
        "rejected": 18124,
        "persist_failed": 0,
        "cancelled": 1,
        "running_current": 399,
        "persisted": 100
      }
    }
  }
}
```

#### 响应参数 {#response-parameters-1}

选项 | 描述
:--- | :---
`submitted` | 已提交的异步搜索请求数。
`initialized` | 已初始化的异步搜索请求数。
`rejected` | 被拒绝的异步搜索请求数。
`search_completed` | 已完成且响应成功的异步搜索请求数。
`search_failed` | 已完成但响应失败的异步搜索请求数。
`persisted` | 最终结果已成功持久化到集群中的异步搜索请求数。
`persist_failed` | 最终结果未能持久化到集群中的异步搜索请求数。
`running_current` | 在给定协调节点上正在运行的异步搜索请求数。
`cancelled` | 在搜索运行期间被取消的异步搜索请求数。
