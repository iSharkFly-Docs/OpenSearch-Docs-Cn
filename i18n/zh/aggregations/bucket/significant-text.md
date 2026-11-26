---
title: 显著文本
---

# 显著文本聚合

`significant_text` 聚合（Aggregation）与 `significant_terms` 聚合类似，但它用于原始文本字段。
显著文本使用统计分析来衡量前景集与背景集之间流行程度的变化。例如，当你查找股票代码 TSLA 时，它可能会提示 Tesla。

`significant_text` 聚合会即时重新分析源文本，过滤掉重复段落、样板式页眉和页脚等噪声数据，否则这些数据可能会使结果产生偏差。

重新分析高基数数据集可能是一项非常消耗 CPU 的操作。我们建议在 sampler 聚合中使用 `significant_text` 聚合，将分析限制在少量最匹配的文档（Document）中，例如 200 个。

你可以设置以下参数：

- `min_doc_count` - 返回匹配的热门命中（Hit）数超过所配置数量的结果。我们不建议将 `min_doc_count` 设置为 1，因为这往往会返回拼写错误的词项。找到某个词项的多个实例，有助于确认其显著性并非一次性偶然的结果。默认值 3 用于提供最低限度的证据权重。
- `shard_size` - 设置较高的值可以提高稳定性（和准确性），但会牺牲计算性能。
- `shard_min_doc_count` - 如果你的文本包含许多你不关心的低频词（例如拼写错误），可以设置 `shard_min_doc_count` 参数，在分片（Shard）级别过滤掉那些即使合并了本地显著文本频率后，也基本可以确定达不到所需 `min_doc_count` 的候选词项。默认值为 1，在你显式设置之前不会产生任何影响。我们建议将此值设置得远低于 `min_doc_count` 的值。

假设你已经将莎士比亚全集索引到 OpenSearch 集群中。你可以在 `text_entry` 字段中查找与单词 "breathe" 相关的显著文本：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": "breathe"
    }
  },
  "aggregations": {
    "my_sample": {
      "sampler": {
        "shard_size": 100
      },
      "aggregations": {
        "keywords": {
          "significant_text": {
            "field": "text_entry",
            "min_doc_count": 4
          }
        }
      }
    }
  }
}
```

#### 示例响应

```json
"aggregations" : {
  "my_sample" : {
    "doc_count" : 59,
    "keywords" : {
      "doc_count" : 59,
      "bg_count" : 111396,
      "buckets" : [
        {
          "key" : "breathe",
          "doc_count" : 59,
          "score" : 1887.0677966101694,
          "bg_count" : 59
        },
        {
          "key" : "air",
          "doc_count" : 4,
          "score" : 2.641295376716233,
          "bg_count" : 189
        },
        {
          "key" : "dead",
          "doc_count" : 4,
          "score" : 0.9665839666414213,
          "bg_count" : 495
        },
        {
          "key" : "life",
          "doc_count" : 5,
          "score" : 0.9090787433467572,
          "bg_count" : 805
        }
      ]
    }
  }
 }
}
```

与 `breathe` 最相关的显著文本是 `air`、`dead` 和 `life`。

`significant_text` 聚合有以下限制：

- 不支持子聚合，因为子聚合的内存开销很高。作为一种变通方法，你可以添加一个后续查询（Query），在其中使用带有 include 子句的 `terms` 聚合和子聚合。
- 不支持嵌套对象，因为它处理的是文档的 JSON 源数据。
- 由于文档计数是通过对每个分片返回的样本求和得到的，因此可能存在一些（通常很小的）误差。你可以使用 `shard_size` 参数来微调准确性与性能之间的权衡。默认情况下，`shard_size` 设置为 -1，以自动估算分片数和 `size` 参数。

背景词项频率统计信息的默认来源是整个索引（Index）。你可以使用背景过滤器缩小这一范围，使分析更有针对性：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": "breathe"
    }
  },
  "aggregations": {
    "my_sample": {
      "sampler": {
        "shard_size": 100
      },
      "aggregations": {
        "keywords": {
          "significant_text": {
            "field": "text_entry",
            "background_filter": {
              "term": {
                "speaker": "JOHN OF GAUNT"
              }
            }
          }
        }
      }
    }
  }
}
```
