---
title: 词项
---

# 词项聚合

`terms` 聚合（Aggregation）会为字段的每个唯一词项动态创建一个桶（Bucket）。

以下示例使用 `terms` 聚合统计 Web 日志数据中每个响应代码对应的文档（Document）数量：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "response_codes": {
      "terms": {
        "field": "response.keyword",
        "size": 10
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "response_codes" : {
    "doc_count_error_upper_bound" : 0,
    "sum_other_doc_count" : 0,
    "buckets" : [
      {
        "key" : "200",
        "doc_count" : 12832
      },
      {
        "key" : "404",
        "doc_count" : 801
      },
      {
        "key" : "503",
        "doc_count" : 441
      }
    ]
  }
 }
}
```

值通过键 `key` 返回。
`doc_count` 指定每个桶中的文档数。默认情况下，桶按 `doc-count` 降序排列。

## size 和 shard_size 参数

`terms` 聚合返回的桶数由 `size` 参数控制，默认值为 10。

此外，负责聚合的协调节点会向每个分片（Shard）请求其排名靠前的唯一词项。每个分片返回的桶数由 `shard_size` 参数控制。该参数不同于 `size` 参数，其作用是提高桶文档计数的准确性。

例如，假设 `size` 和 `shard_size` 参数的值都为 3。`terms` 聚合会向每个分片请求其排名前三的唯一词项，协调节点再对这些结果进行聚合以计算最终结果。如果某个分片包含一个未进入前三的对象，那么它就不会出现在响应中。不过，为该请求增大 `shard_size` 值可以让每个分片返回更多的唯一词项，从而提高协调节点收到所有相关结果的可能性。

默认情况下，`shard_size` 参数设置为 `size * 1.5 + 10`。

使用并发段搜索时，`shard_size` 参数也会应用于每个段切片。

`shard_size` 参数用于在 `terms` 聚合的性能与文档计数准确性之间进行权衡。较高的 `shard_size` 值可以确保更高的文档计数准确性，但会占用更多内存和计算资源。较低的 `shard_size` 值性能更好，但文档计数的准确性较低。

## 文档计数误差

响应中还包含两个键：`doc_count_error_upper_bound` 和 `sum_other_doc_count`。

`terms` 聚合返回排名靠前的唯一词项。因此，如果数据中包含许多唯一词项，其中一些可能不会出现在结果中。`sum_other_doc_count` 字段表示被排除在响应之外的文档总数。在本例中，该数值为 0，因为所有唯一值都出现在了响应中。

`doc_count_error_upper_bound` 字段表示被排除在最终结果之外的唯一值可能具有的最大计数。可以使用该字段来估算计数的误差范围。

`doc_count_error_upper_bound` 值和准确性的概念仅适用于使用默认排序顺序（即按文档数降序）的聚合。这是因为当你按文档数降序排序时，任何未返回的词项所包含的文档数都必然小于或等于已返回的词项。基于这一点，就可以计算出 `doc_count_error_upper_bound`。

如果将 `show_term_doc_count_error` 参数设置为 `true`，则 `terms` 聚合除了显示总体值之外，还会显示为每个唯一桶计算的 `doc_count_error_upper_bound`。

## `min_doc_count` 和 `shard_min_doc_count` 参数 {#the-mindoccount-and-shardmindoccount-parameters}

你可以使用 `min_doc_count` 参数过滤掉结果数少于 `min_doc_count` 的唯一词项。`min_doc_count` 阈值只有在合并了从所有分片检索到的结果之后才会应用。每个分片并不知道给定词项的全局文档计数。如果全局最频繁的前 `shard_size` 个词项与某个分片本地的高频词项之间存在显著差异，那么在使用 `min_doc_count` 参数时可能会得到意外的结果。

另外，`shard_min_doc_count` 参数用于过滤掉分片返回给协调节点、但结果数少于 `shard_min_doc_count` 的唯一词项。

使用并发段搜索时，`shard_min_doc_count` 参数不会应用于每个段切片。有关更多信息，请参阅[相关 GitHub issue](https://github.com/opensearch-project/OpenSearch/issues/11847)。

## 收集模式

有两种可用的收集模式：`depth_first` 和 `breadth_first`。`depth_first` 收集模式以深度优先的方式展开聚合树的所有分支，并且只在展开完成之后才进行剪枝。

然而，在使用嵌套的 `terms` 聚合时，返回的桶数基数会与每一层嵌套中字段的基数相乘，因此随着聚合的嵌套，桶数很容易出现组合爆炸。

你可以使用 `breadth_first` 收集模式来解决这个问题。在这种模式下，聚合树的第一层会在展开到下一层之前先进行剪枝，这可能会大幅减少需要计算的桶数。

此外，执行 `breadth_first` 收集会带来一定的内存开销，该开销与匹配文档的数量呈线性关系。这是因为 `breadth_first` 收集的工作方式是缓存并重放来自父级的、经过剪枝的桶集合。

## 处理预聚合数据

虽然 `doc_count` 字段表示聚合到某个桶中的单个文档数量，但 `doc_count` 本身无法正确地累加存储了预聚合数据的文档。为了处理预聚合数据并准确计算桶中的文档数，你可以使用 `_doc_count` 字段，在单个汇总字段中添加文档数量。当文档包含 `_doc_count` 字段时，所有桶聚合（Bucket Aggregation）都会识别其值，并累加到桶的 `doc_count` 中。使用 `_doc_count` 字段时请注意以下事项：

* 该字段不支持嵌套数组，只能使用正整数。
* 如果文档不包含 `_doc_count` 字段，聚合会将该文档计为 1。

::: tip 提示
那些依赖准确文档计数的 OpenSearch 功能体现了使用 `_doc_count` 字段的重要性。要了解如何使用该字段来支持其他搜索工具，请参阅[索引汇总（Index rollups）](https://opensearch.org/docs/latest/im-plugin/index-rollups/index/)。这是索引管理（Index Management，IM）插件中的一项 OpenSearch 功能，它会将包含预聚合数据的文档存储在汇总索引中。
:::

#### 示例请求

```json
PUT /my_index/_doc/1
{
  "response_code": 404,
  "date":"2022-08-05",
  "_doc_count": 20
}

PUT /my_index/_doc/2
{
  "response_code": 404,
  "date":"2022-08-06",
  "_doc_count": 10
}

PUT /my_index/_doc/3
{
  "response_code": 200,
  "date":"2022-08-06",
  "_doc_count": 300
}

GET /my_index/_search
{
  "size": 0,
  "aggs": {
    "response_codes": {
      "terms": {
        "field" : "response_code"
      }
    }
  }
}
```

#### 示例响应 {#example-response-1}

```json
{
  "took" : 20,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 3,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "aggregations" : {
    "response_codes" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : 200,
          "doc_count" : 300
        },
        {
          "key" : 404,
          "doc_count" : 30
        }
      ]
    }
  }
}
```
