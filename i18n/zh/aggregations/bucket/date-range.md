---
title: 日期范围
---

# 日期范围聚合

`date_range` 聚合（Aggregation）在概念上与 `range` 聚合相同，区别在于它允许你使用日期数学表达式。
例如，你可以获取最近 10 天的所有文档（Document）。为了让日期更易读，可以通过 `format` 参数指定格式：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "number_of_bytes": {
      "date_range": {
        "field": "@timestamp",
        "format": "MM-yyyy",
        "ranges": [
          {
            "from": "now-10d/d",
            "to": "now"
          }
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
  "number_of_bytes" : {
    "buckets" : [
      {
        "key" : "03-2021-03-2021",
        "from" : 1.6145568E12,
        "from_as_string" : "03-2021",
        "to" : 1.615451329043E12,
        "to_as_string" : "03-2021",
        "doc_count" : 0
      }
    ]
  }
 }
}
```
