---
title: 范围
---

# 范围聚合

`range` 聚合（Aggregation）可以让你为每个桶（Bucket）定义范围。

例如，你可以分别统计字节数介于 1000 到 2000、2000 到 3000 以及 3000 到 4000 之间的数量。
在 `range` 参数中，你可以将各个范围定义为数组中的对象。

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "number_of_bytes_distribution": {
      "range": {
        "field": "bytes",
        "ranges": [
          {
            "from": 1000,
            "to": 2000
          },
          {
            "from": 2000,
            "to": 3000
          },
          {
            "from": 3000,
            "to": 4000
          }
        ]
      }
    }
  }
}
```

响应包含 `from` 键的值，但不包含 `to` 键的值：

#### 示例响应

```json
...
"aggregations" : {
  "number_of_bytes_distribution" : {
    "buckets" : [
      {
        "key" : "1000.0-2000.0",
        "from" : 1000.0,
        "to" : 2000.0,
        "doc_count" : 805
      },
      {
        "key" : "2000.0-3000.0",
        "from" : 2000.0,
        "to" : 3000.0,
        "doc_count" : 1369
      },
      {
        "key" : "3000.0-4000.0",
        "from" : 3000.0,
        "to" : 4000.0,
        "doc_count" : 1422
      }
    ]
  }
 }
}
```
