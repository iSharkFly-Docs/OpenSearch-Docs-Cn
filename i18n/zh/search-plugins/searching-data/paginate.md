---
title: 分页显示结果
---

## 分页显示结果

在 OpenSearch 中，可以使用以下方法对搜索结果进行分页（pagination）：

1. [`from` 和 `size` 参数](#the-from-and-size-parameters)
1. [滚动搜索](#scroll-search)操作
1. [`search_after` 参数](#the-search_after-parameter)
1. [时间点与 `search_after` 结合使用](#point-in-time-with-search_after)

## `from` 和 `size` 参数

`from` 和 `size` 参数每次返回一页结果。

`from` 参数是开始显示结果的文档序号，`size` 参数是要显示的结果数量。两者结合使用，即可返回搜索结果的一个子集。

例如，如果 `size` 的值为 10，`from` 的值为 0，就会看到前 10 个结果。如果把 `from` 的值改为 10，就会看到接下来的 10 个结果（因为结果从 0 开始编号）。因此，如果要从第 11 个结果开始查看，`from` 必须为 10。

```json
GET shakespeare/_search
{
  "from": 0,
  "size": 10,
  "query": {
    "match": {
      "play_name": "Hamlet"
    }
  }
}
```

使用以下公式，根据页码计算 `from` 参数：

```json
from = size * (page_number - 1)
```

用户每次选择下一页结果时，应用程序都需要使用递增后的 `from` 值重新运行同一个搜索查询。

也可以在搜索 URI 中指定 `from` 和 `size` 参数：

```json
GET shakespeare/_search?from=0&size=10
```

如果只指定了 `size` 参数，`from` 参数默认为 0。

查询结果中很靠后的页面会对性能产生显著影响，因此 OpenSearch 将这种方法限制在 10,000 个结果以内。

`from` 和 `size` 参数是无状态的，因此结果基于最新的可用数据。
这可能导致分页结果不一致。
例如，假设用户停留在结果的第一页，随后翻到第二页。在此期间，一个与用户搜索相关的新文档被索引，并出现在第一页上。这种情况下，第一页的最后一个结果会被挤到第二页，用户就会看到重复的结果（也就是说，第一页和第二页都显示了这个结果）。

如需一致的分页，请使用 `scroll` 操作。`scroll` 操作会在一段时间内保持搜索上下文（search context）处于打开状态，在此期间，任何数据变更都不会影响结果。

## 滚动搜索

`from` 和 `size` 参数可以对搜索结果进行分页，但每次最多只能返回 10,000 个结果。

如果需要请求大于 1 PB 的数据量（例如用于机器学习作业），请改用 `scroll` 操作。`scroll` 操作允许请求数量不限的结果。

要使用滚动操作，请在请求头中添加 `scroll` 参数，并指定一个搜索上下文，告诉 OpenSearch 需要保持滚动多长时间。该搜索上下文的时长需要足以处理一批结果。

要设置每批返回的结果数量，请使用 `size` 参数：

```json
GET shakespeare/_search?scroll=10m
{
  "size": 10000
}
```

OpenSearch 会缓存结果并返回一个滚动 ID，可以使用它分批访问这些结果：

```json
"_scroll_id" : "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAAUWdmpUZDhnRFBUcWFtV21nMmFwUGJEQQ=="
```

将此滚动 ID 传给 `scroll` 操作，即可获取下一批结果：

```json
GET _search/scroll
{
  "scroll": "10m",
  "scroll_id": "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAAUWdmpUZDhnRFBUcWFtV21nMmFwUGJEQQ=="
}
```

只要搜索上下文仍处于打开状态，就可以使用此滚动 ID 以每批 10,000 个的方式获取结果。通常，滚动 ID 在请求之间不会改变，但它*有可能*改变，因此请务必始终使用最新的滚动 ID。如果没有在设置的搜索上下文时间内发送下一个滚动请求，`scroll` 操作将不会返回任何结果。

如果预计会有数十亿个结果，请使用切片滚动（sliced scroll）。切片允许对同一个请求并行执行多个滚动操作。
设置滚动的 ID 和最大切片数：

```json
GET shakespeare/_search?scroll=10m
{
  "slice": {
    "id": 0,
    "max": 10
  },
  "query": {
    "match_all": {}
  }
}
```

使用单个滚动 ID，会收到 10 个结果。
最多可以有 10 个 ID。
将 ID 设为 1，执行同样的命令：

```json
GET shakespeare/_search?scroll=10m
{
  "slice": {
    "id": 1,
    "max": 10
  },
  "query": {
    "match_all": {}
  }
}
```

滚动完成后请关闭搜索上下文，因为它在超时之前会一直占用计算资源：

```json
DELETE _search/scroll/DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAAAcWdmpUZDhnRFBUcWFtV21nMmFwUGJEQQ==
```

#### 示例响应

```json
{
  "succeeded": true,
  "num_freed": 1
}
```

使用以下请求关闭所有打开的滚动上下文：

```json
DELETE _search/scroll/_all
```

`scroll` 操作对应于一个特定的时间戳，不会将该时间戳之后添加的文档视为潜在结果。

由于打开的搜索上下文会消耗大量内存，对于不需要保持搜索上下文打开的频繁用户查询，建议不要使用 `scroll` 操作，而是将 `sort` 参数与 `search_after` 参数结合使用，来滚动用户查询的响应。

## `search_after` 参数 {#the-searchafter-parameter}

`search_after` 参数提供了一个实时游标（cursor），使用上一页的结果来获取下一页的结果。它与 `scroll` 操作类似，目的是并行滚动多个查询。

例如，以下查询按台词编号（speech number）、再按 ID 对剧作 "Hamlet" 中的所有台词进行排序（sort），并检索前三个结果：

```json
GET shakespeare/_search
{
  "size": 3,
  "query": {
    "match": {
      "play_name": "Hamlet"
    }
  },
  "sort": [
    { "speech_number": "asc" },
    { "_id": "asc" } 
  ]
}
```

响应中包含每个文档的 `sort` 值数组：

```json
{
  "took" : 7,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 4244,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "32435",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 32436,
          "play_name" : "Hamlet",
          "speech_number" : 1,
          "line_number" : "1.1.1",
          "speaker" : "BERNARDO",
          "text_entry" : "Whos there?"
        },
        "sort" : [
          1,
          "32435"
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "32634",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 32635,
          "play_name" : "Hamlet",
          "speech_number" : 1,
          "line_number" : "1.2.1",
          "speaker" : "KING CLAUDIUS",
          "text_entry" : "Though yet of Hamlet our dear brothers death"
        },
        "sort" : [
          1,
          "32634"
        ]
      },
      {
        "_index" : "shakespeare",
        "_id" : "32635",
        "_score" : null,
        "_source" : {
          "type" : "line",
          "line_id" : 32636,
          "play_name" : "Hamlet",
          "speech_number" : 1,
          "line_number" : "1.2.2",
          "speaker" : "KING CLAUDIUS",
          "text_entry" : "The memory be green, and that it us befitted"
        },
        "sort" : [
          1,
          "32635"
        ]
      }
    ]
  }
}
```

可以使用最后一个结果的 `sort` 值，通过 `search_after` 参数检索后续结果：

```json
GET shakespeare/_search
{
  "size": 10,
  "query": {
    "match": {
      "play_name": "Hamlet"
    }
  },
  "search_after": [ 1, "32635"],
  "sort": [
    { "speech_number": "asc" },
    { "_id": "asc" } 
  ]
}
```

与 `scroll` 操作不同，`search_after` 参数是无状态的，因此文档顺序可能会因为文档被索引或删除而发生变化。

## 时间点与 `search_after` 结合使用 {#point-in-time-with-searchafter}

时间点（Point in Time，PIT）与 `search_after` 结合使用是 OpenSearch 中首选的分页方法，尤其适用于深度分页。它可以绕开其他所有方法的限制，因为它操作的是冻结在某一时刻的数据集，不绑定到某个查询，并且支持向前和向后的一致分页。要了解更多信息，请参阅[时间点](/search-plugins/searching-data/point-in-time)。
