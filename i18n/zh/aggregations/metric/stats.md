---
title: 统计
---

# 统计聚合

`stats` 指标是一种多值指标聚合（Metric Aggregation），在一次聚合查询中返回 `min`、`max`、`sum`、`avg` 和 `value_count` 等所有基本指标。

以下示例返回 `taxful_total_price` 字段的基本统计信息：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "stats_taxful_total_price": {
      "stats": {
        "field": "taxful_total_price"
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "stats_taxful_total_price" : {
    "count" : 4675,
    "min" : 6.98828125,
    "max" : 2250.0,
    "avg" : 75.05542864304813,
    "sum" : 350884.12890625
  }
 }
}
```
