---
title: 最大值
---

# 最大值聚合

`max` 指标是一种单值指标聚合（Metric Aggregation），返回字段的最大值。

以下示例计算 `taxful_total_price` 字段的最大值：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "max_taxful_total_price": {
      "max": {
        "field": "taxful_total_price"
      }
    }
  }
}
```

#### 示例响应

```json
{
  "took": 17,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 4675,
      "relation": "eq"
    },
    "max_score": null,
    "hits": []
  },
  "aggregations": {
    "max_taxful_total_price": {
      "value": 2250
    }
  }
}
```
