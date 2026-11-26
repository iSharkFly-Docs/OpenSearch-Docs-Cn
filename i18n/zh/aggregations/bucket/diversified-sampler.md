---
title: 多样化采样器
---

# 多样化采样器

`diversified_sampler` 聚合（Aggregation）通过对包含相同 `field` 值的文档（Document）进行去重，减少样本池分布中的偏差。它使用 `max_docs_per_value` 和 `field` 设置来实现这一点，这两个设置限制了在一个分片（Shard）上针对所提供的 `field` 收集的最大文档数。`max_docs_per_value` 设置是一个可选参数，用于确定每个 `field` 值最多返回的文档数，其默认值为 `1`。

与 [`sampler` 聚合](/aggregations/bucket/sampler)类似，你可以使用 `shard_size` 设置来控制在任意一个分片上收集的最大文档数，如下例所示：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "sample": {
      "diversified_": {
        "shard_size": 1000,
        "field": "response.keyword"
      },
      "aggs": {
        "terms": {
          "terms": {
            "field": "agent.keyword"
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
  "sample" : {
    "doc_count" : 3,
    "terms" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1",
          "doc_count" : 2
        },
        {
          "key" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)",
          "doc_count" : 1
        }
      ]
    }
  }

 }
}
```
