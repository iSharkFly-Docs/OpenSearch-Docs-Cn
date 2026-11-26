---
title: 值计数
---

# 值计数聚合

`value_count` 指标是一种单值指标聚合（Metric Aggregation），用于计算聚合所基于的值的数量。

例如，你可以将 `value_count` 指标与 `avg` 指标一起使用，以确定聚合在计算平均值时使用了多少个数值。

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
   "aggs": {
    "number_of_values": {
      "value_count": {
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
    "number_of_values" : {
      "value" : 4675
    }
  }
}
```
