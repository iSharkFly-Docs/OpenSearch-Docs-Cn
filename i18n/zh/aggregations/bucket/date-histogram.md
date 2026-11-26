---
title: 日期直方图
---

# 日期直方图聚合

`date_histogram` 聚合（Aggregation）使用[日期数学表达式](/field-types/supported-field-types/date#date-math)为时间序列数据生成直方图。

例如，你可以统计网站每个月的访问次数：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "logs_per_month": {
      "date_histogram": {
        "field": "@timestamp",
        "interval": "month"
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "logs_per_month" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595
      }
    ]
  }
}
}
```

响应中包含三个月的日志。如果将这些值绘制成图表，你就可以看到网站请求流量逐月的高峰和低谷。
