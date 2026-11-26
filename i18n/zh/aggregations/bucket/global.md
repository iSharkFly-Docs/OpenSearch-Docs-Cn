---
title: 全局
---

# 全局聚合

`global` 聚合（Aggregation）可以让你跳出过滤器聚合的聚合上下文。即使你添加了用于缩小文档（Document）集合范围的过滤查询，`global` 聚合也会像该过滤查询不存在一样，对所有文档进行聚合。它会忽略 `filter` 聚合，并隐式采用 `match_all` 查询。

以下示例返回索引（Index）中所有文档的 `taxful_total_price` 字段的 `avg` 值：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "query": {
    "range": {
      "taxful_total_price": {
        "lte": 50
      }
    }
  },
  "aggs": {
    "total_avg_amount": {
      "global": {},
      "aggs": {
        "avg_price": {
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
  "total_avg_amount" : {
    "doc_count" : 4675,
    "avg_price" : {
      "value" : 75.05542864304813
    }
  }
 }
}
```

可以看到，`taxful_total_price` 字段的平均值为 75.05，而不是 `filter` 示例中查询匹配时得到的 38.36。
