---
title: 求和
---

# 求和聚合

`sum` 指标是一种单值指标聚合（Metric Aggregation），返回字段值的总和。

以下示例计算 `taxful_total_price` 字段的总和：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "sum_taxful_total_price": {
      "sum": {
        "field": "taxful_total_price"
      }
    }
  }
}
```

#### 示例响应

```json
{
  "took": 16,
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
    "sum_taxful_total_price": {
      "value": 350884.12890625
    }
  }
}
```
