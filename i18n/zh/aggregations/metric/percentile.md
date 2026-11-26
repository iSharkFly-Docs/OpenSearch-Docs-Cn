---
title: 百分位数
---

# 百分位数聚合

百分位数是指小于或等于某个阈值的数据所占的百分比。

`percentile` 指标是一种多值指标聚合（Metric Aggregation），可以帮助你找出数据中的离群值或了解数据的分布情况。

与 `cardinality` 指标一样，`percentile` 指标也是近似值。

以下示例计算 `taxful_total_price` 字段的百分位数：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "percentile_taxful_total_price": {
      "percentiles": {
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
  "percentile_taxful_total_price" : {
    "values" : {
      "1.0" : 21.984375,
      "5.0" : 27.984375,
      "25.0" : 44.96875,
      "50.0" : 64.22061688311689,
      "75.0" : 93.0,
      "95.0" : 156.0,
      "99.0" : 222.0
    }
  }
 }
}
```
