---
title: 直方图
---

# 直方图聚合

`histogram` 聚合（Aggregation）根据指定的间隔将文档（Document）分入桶（Bucket）中。

借助 `histogram` 聚合，你可以非常轻松地可视化给定文档范围内值的分布情况。当然，OpenSearch 并不会直接返回一张图表，那是 OpenSearch Dashboards 的工作。但它会返回 JSON 响应，你可以利用该响应自行构建图表。

以下示例按 10,000 的间隔对 `number_of_bytes` 字段进行分桶：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "number_of_bytes": {
      "histogram": {
        "field": "bytes",
        "interval": 10000
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
        "key" : 0.0,
        "doc_count" : 13372
      },
      {
        "key" : 10000.0,
        "doc_count" : 702
      }
    ]
  }
 }
}
```
