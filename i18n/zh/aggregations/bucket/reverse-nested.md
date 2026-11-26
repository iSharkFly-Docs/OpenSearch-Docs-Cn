---
title: 反向嵌套
---

# 反向嵌套聚合

你可以将嵌套文档（Document）中的值聚合到其父文档，这种聚合（Aggregation）称为 `reverse_nested`。
在按嵌套对象中的字段分组之后，你可以使用 `reverse_nested` 对父文档中的字段进行聚合。`reverse_nested` 聚合会“回连”根页面，并获取每种变体的 `load_time`。

`reverse_nested` 聚合是嵌套聚合中的子聚合。它只接受一个名为 `path` 的选项。该选项定义了 OpenSearch 在文档层级中向上回溯多少级来计算聚合。

```json
GET logs/_search
{
  "query": {
    "match": { "response": "200" }
  },
  "aggs": {
    "pages": {
      "nested": {
        "path": "pages"
      },
      "aggs": {
        "top_pages_per_load_time": {
          "terms": {
            "field": "pages.load_time"
          },
          "aggs": {
            "comment_to_logs": {
              "reverse_nested": {},
              "aggs": {
                "min_load_time": {
                  "min": {
                    "field": "pages.load_time"
                  }
                }
              }
            }
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
  "pages" : {
    "doc_count" : 2,
    "top_pages_per_load_time" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : 200.0,
          "doc_count" : 1,
          "comment_to_logs" : {
            "doc_count" : 1,
            "min_load_time" : {
              "value" : null
            }
          }
        },
        {
          "key" : 500.0,
          "doc_count" : 1,
          "comment_to_logs" : {
            "doc_count" : 1,
            "min_load_time" : {
              "value" : null
            }
          }
        }
      ]
    }
  }
 }
}
```

响应显示，logs 索引（Index）中有一个页面的 `load_time` 为 200，另一个页面的 `load_time` 为 500。
