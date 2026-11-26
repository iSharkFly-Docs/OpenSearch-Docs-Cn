---
title: 多词项
---

# 多词项聚合

与 `terms` 桶聚合（Bucket Aggregation）类似，你也可以使用 `multi_terms` 聚合来搜索多个词项。当你需要按文档（Document）数量排序，或者需要按复合键上的指标聚合（Metric Aggregation）排序并获取前 `n` 个结果时，多词项聚合非常有用。例如，你可以搜索特定数量的文档（例如 1000 个），以及每个位置上 CPU 使用率超过 90% 的服务器数量。这个多词项查询（Query）会返回排在前面的若干结果。

::: tip 提示
`multi_terms` 聚合确实比 `terms` 聚合消耗更多内存，因此其性能可能较慢。
:::

## 多词项聚合参数

参数 | 描述
:--- | :---
multi_terms | 表示一个多词项聚合，它根据由多个词项指定的条件将文档归入桶（Bucket）中。
size | 指定要返回的桶数。默认值为 10。
order | 表示桶的排序方式。默认情况下，桶按每个桶中的文档数排序。如果多个桶包含相同的文档数，则可以将 `order` 显式设置为按词项值而非文档数排序（例如，将 `order` 设置为 "max-cpu"）。
doc_count | 指定每个桶中要返回的文档数。默认情况下，返回前 10 个词项。

#### 示例请求

```json
GET sample-index100/_search
{
  "size": 0, 
  "aggs": {
    "hot": {
      "multi_terms": {
        "terms": [{
          "field": "region" 
        },{
          "field": "host" 
        }],
        "order": {"max-cpu": "desc"}
      },
      "aggs": {
        "max-cpu": { "max": { "field": "cpu" } }
      }      
    }
  }
}
```

#### 示例响应

```json
{
  "took": 118,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 8,
      "relation": "eq"
    },
    "max_score": null,
    "hits": []
  },
  "aggregations": {
    "multi-terms": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": [
            "dub",
            "h1"
          ],
          "key_as_string": "dub|h1",
          "doc_count": 2,
          "max-cpu": {
            "value": 90.0
          }
        },
        {
          "key": [
            "dub",
            "h2"
          ],
          "key_as_string": "dub|h2",
          "doc_count": 2,
          "max-cpu": {
            "value": 70.0
          }
        },
        {
          "key": [
            "iad",
            "h2"
          ],
          "key_as_string": "iad|h2",
          "doc_count": 2,
          "max-cpu": {
            "value": 50.0
          }
        },
        {
          "key": [
            "iad",
            "h1"
          ],
          "key_as_string": "iad|h1",
          "doc_count": 2,
          "max-cpu": {
            "value": 15.0
          }
        }
      ]
    }
  }
}
```
