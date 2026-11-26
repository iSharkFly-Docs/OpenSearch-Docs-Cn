---
title: 采样器
---

# 采样器聚合

如果你要聚合非常多的文档（Document），可以使用 `sampler` 聚合（Aggregation）将范围缩小到一小部分文档样本，从而加快响应速度。`sampler` 聚合按评分最高的文档来选择样本。

结果是近似的，但能够较好地反映真实数据的分布。`sampler` 聚合可以显著提升查询（Query）性能，但估算出的响应并不完全可靠。

基本语法如下：

```json
“aggs”: {
  "SAMPLE": {
    "sampler": {
      "shard_size": 100
    },
    "aggs": {...}
  }
}
```

## 分片大小属性

`shard_size` 属性告诉 OpenSearch 从每个分片（Shard）中（最多）收集多少个文档。

以下示例将每个分片上收集的文档数限制为 1,000，然后通过 `terms` 聚合对这些文档进行分桶：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "sample": {
      "sampler": {
        "shard_size": 1000
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
    "doc_count" : 1000,
    "terms" : {
      "doc_count_error_upper_bound" : 0,
      "sum_other_doc_count" : 0,
      "buckets" : [
        {
          "key" : "Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1",
          "doc_count" : 368
        },
        {
          "key" : "Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.50 Safari/534.24",
          "doc_count" : 329
        },
        {
          "key" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)",
          "doc_count" : 303
        }
      ]
    }
  }
 }
}
```
