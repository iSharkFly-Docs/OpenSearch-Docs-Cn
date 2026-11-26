---
title: 显著词项
---

# 显著词项聚合

`significant_terms` 聚合（Aggregation）可以让你发现，相对于索引（Index）中的其余数据，经过过滤的子集中出现了哪些不寻常或值得关注的词项。

前景集是你过滤得到的文档（Document）集合，背景集是索引中所有文档的集合。
`significant_terms` 聚合会检查前景集中的所有文档，并与背景集中的文档进行对比，为显著出现的词项计算评分。

在 Web 日志示例数据中，每个文档都有一个包含访问者 `user-agent` 的字段。此示例搜索来自 iOS 操作系统的所有请求。对该前景集执行普通的 `terms` 聚合会返回 Firefox，因为它在这个桶（Bucket）中拥有最多的文档。而 `significant_terms` 聚合则会返回 Internet Explorer（IE），因为与背景集相比，IE 在前景集中出现的频率明显更高。

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "query": {
    "terms": {
      "machine.os.keyword": [
        "ios"
      ]
    }
  },
  "aggs": {
    "significant_response_codes": {
      "significant_terms": {
        "field": "agent.keyword"
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "significant_response_codes" : {
    "doc_count" : 2737,
    "bg_count" : 14074,
    "buckets" : [
      {
        "key" : "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)",
        "doc_count" : 818,
        "score" : 0.01462731514608217,
        "bg_count" : 4010
      },
      {
        "key" : "Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1",
        "doc_count" : 1067,
        "score" : 0.009062566630410223,
        "bg_count" : 5362
      }
    ]
  }
 }
}
```

如果 `significant_terms` 聚合没有返回任何结果，可能是因为你没有使用查询（Query）对结果进行过滤。也可能是前景集中词项的分布与背景集相同，这意味着前景集中没有任何不寻常之处。

背景词项频率统计信息的默认来源是整个索引。你可以使用背景过滤器缩小这一范围，使分析更有针对性
