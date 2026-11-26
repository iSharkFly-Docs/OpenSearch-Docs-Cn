---
title: 缺失
---

# 缺失聚合

如果索引（Index）中的某些文档（Document）完全不包含要聚合的字段，或者该字段的值为 NULL，可以使用 `missing` 参数指定这些文档应放入的桶（Bucket）的名称。

以下示例将所有缺失值放入名为 "N/A" 的桶中：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "response_codes": {
      "terms": {
        "field": "response.keyword",
        "size": 10,
        "missing": "N/A"
      }
    }
  }
}
```

由于 `min_doc_count` 参数的默认值为 1，`missing` 参数不会在响应中返回任何桶。将 `min_doc_count` 参数设置为 0，即可在响应中看到 "N/A" 桶：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "response_codes": {
      "terms": {
        "field": "response.keyword",
        "size": 10,
        "missing": "N/A",
        "min_doc_count": 0
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "response_codes" : {
    "doc_count_error_upper_bound" : 0,
    "sum_other_doc_count" : 0,
    "buckets" : [
      {
        "key" : "200",
        "doc_count" : 12832
      },
      {
        "key" : "404",
        "doc_count" : 801
      },
      {
        "key" : "503",
        "doc_count" : 441
      },
      {
        "key" : "N/A",
        "doc_count" : 0
      }
    ]
  }
 }
}
```
