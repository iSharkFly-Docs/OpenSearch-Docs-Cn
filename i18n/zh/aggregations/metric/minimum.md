---
title: 最小值
---

# 最小值聚合

`min` 指标是一种单值指标聚合（Metric Aggregation），返回字段的最小值。

以下示例计算 `taxful_total_price` 字段的最小值：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "min_taxful_total_price": {
      "min": {
        "field": "taxful_total_price"
      }
    }
  }
}
```

#### 示例响应

```json
{
  "took": 13,
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
    "min_taxful_total_price": {
      "value": 6.98828125
    }
  }
}
```
