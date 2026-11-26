---
title: 百分位排名
---

# 百分位排名聚合

百分位排名是指按指定值分组时，小于或等于某个阈值的值所处的百分位。例如，如果某个值大于或等于 80% 的值，则其百分位排名为 80。

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "percentile_rank_taxful_total_price": {
      "percentile_ranks": {
        "field": "taxful_total_price",
        "values": [
          10,
          15
        ]
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "percentile_rank_taxful_total_price" : {
    "values" : {
      "10.0" : 0.055096056411283456,
      "15.0" : 0.0830092961834656
    }
  }
 }
}
```
