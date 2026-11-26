---
title: 过滤器
---

# 过滤器聚合

`filter` 聚合（Aggregation）是一个查询子句，与搜索查询（Query）完全相同，例如 `match`、`term` 或 `range`。在创建桶（Bucket）之前，你可以使用 `filter` 聚合将整个文档（Document）集合缩小为一个特定的集合。

下面的示例展示了在过滤器上下文中运行的 `avg` 聚合。`avg` 聚合只对与 `range` 查询匹配的文档进行聚合：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "low_value": {
      "filter": {
        "range": {
          "taxful_total_price": {
            "lte": 50
          }
        }
      },
      "aggs": {
        "avg_amount": {
          "avg": {
            "field": "taxful_total_price"
          }
        }
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "low_value" : {
    "doc_count" : 1633,
    "avg_amount" : {
      "value" : 38.363175998928355
    }
  }
 }
}
```
