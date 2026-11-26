---
title: 多过滤器
---

# 多过滤器聚合

`filters` 聚合（Aggregation）与 `filter` 聚合相同，区别在于它允许你使用多个过滤器聚合。
`filter` 聚合只产生一个桶（Bucket），而 `filters` 聚合会返回多个桶，每个已定义的过滤器对应一个桶。

要为不匹配任何过滤器查询的所有文档（Document）创建一个桶，请将 `other_bucket` 属性设置为 `true`：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "200_os": {
      "filters": {
        "other_bucket": true,
        "filters": [
          {
            "term": {
              "response.keyword": "200"
            }
          },
          {
            "term": {
              "machine.os.keyword": "osx"
            }
          }
        ]
      },
      "aggs": {
        "avg_amount": {
          "avg": {
            "field": "bytes"
          }
        }
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "200_os" : {
    "buckets" : [
      {
        "doc_count" : 12832,
        "avg_amount" : {
          "value" : 5897.852711970075
        }
      },
      {
        "doc_count" : 2825,
        "avg_amount" : {
          "value" : 5620.347256637168
        }
      },
      {
        "doc_count" : 1017,
        "avg_amount" : {
          "value" : 3247.0963618485744
        }
      }
    ]
  }
 }
}
```
