---
title: 邻接矩阵
---

# 邻接矩阵聚合

`adjacency_matrix` 聚合（Aggregation）允许你定义过滤器表达式，并返回一个由相交过滤器构成的矩阵，矩阵中每个非空单元格都代表一个桶（Bucket）。借助它，你可以了解有多少文档（Document）落在任意过滤器组合之中。

使用 `adjacency_matrix` 聚合，可以通过将数据可视化为图来发现各个概念之间的关系。

例如，要在电子商务示例数据集中分析不同制造商之间的关系：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "interactions": {
      "adjacency_matrix": {
        "filters": {
          "grpA": {
            "match": {
              "manufacturer.keyword": "Low Tide Media"
            }
          },
          "grpB": {
            "match": {
              "manufacturer.keyword": "Elitelligence"
            }
          },
          "grpC": {
            "match": {
              "manufacturer.keyword": "Oceanavigations"
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
 {
   ...
   "aggregations" : {
     "interactions" : {
       "buckets" : [
         {
           "key" : "grpA",
           "doc_count" : 1553
         },
         {
           "key" : "grpA&grpB",
           "doc_count" : 590
         },
         {
           "key" : "grpA&grpC",
           "doc_count" : 329
         },
         {
           "key" : "grpB",
           "doc_count" : 1370
         },
         {
           "key" : "grpB&grpC",
           "doc_count" : 299
         },
         {
           "key" : "grpC",
           "doc_count" : 1218
         }
       ]
     }
   }
 }
```

 我们来仔细看看这个结果：

 ```json
 {
    "key" : "grpA&grpB",
    "doc_count" : 590
 }
 ```

- `grpA`：由 Low Tide Media 制造的产品。
- `grpB`：由 Elitelligence 制造的产品。
- `590`：由这两家共同制造的产品数量。

你可以使用 OpenSearch Dashboards 以网络图的形式呈现这些数据。
