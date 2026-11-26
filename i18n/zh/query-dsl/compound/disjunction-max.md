---
title: 析取最大值
---

# 析取最大值查询

析取最大值（`dis_max`）查询（Query）返回匹配一个或多个查询子句的任何文档（Document）。对于匹配多个查询子句的文档，其相关性评分（Relevance Score）取所有匹配查询子句中的最高相关性评分。

当返回文档的相关性评分相同时，可以使用 `tie_breaker` 参数为匹配多个查询子句的文档赋予更高的权重。

## 示例

假设有一个索引（Index），并按如下方式索引了两个文档：

```json
PUT testindex1/_doc/1
{
  "title": " The Top 10 Shakespeare Poems",
  "description": "Top 10 sonnets of England's national poet and the Bard of Avon"
}
```

```json
PUT testindex1/_doc/2
{
  "title": "Sonnets of the 16th Century",
  "body": "The poems written by various 16-th century poets"
}
```

使用 `dis_max` 查询搜索包含 "Shakespeare poems" 这些单词的文档：

```json
GET testindex1/_search
{
  "query": {
    "dis_max": {
      "queries": [
        { "match": { "title": "Shakespeare poems" }},
        { "match": { "body":  "Shakespeare poems" }}
      ]
    }
  }            
}
```

响应中包含这两个文档：

```json
{
  "took": 8,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1.3862942,
    "hits": [
      {
        "_index": "testindex1",
        "_id": "1",
        "_score": 1.3862942,
        "_source": {
          "title": " The Top 10 Shakespeare Poems",
          "description": "Top 10 sonnets of England's national poet and the Bard of Avon"
        }
      },
      {
        "_index": "testindex1",
        "_id": "2",
        "_score": 0.2876821,
        "_source": {
          "title": "Sonnets of the 16th Century",
          "body": "The poems written by various 16-th century poets"
        }
      }
    ]
  }
}
```

## 参数

下表列出了 `dis_max` 查询支持的所有顶级参数。

参数 | 描述
:--- | :---
`queries` | 由一个或多个用于匹配文档的查询子句组成的数组。文档必须至少匹配一个查询子句才能在结果中返回。如果文档匹配多个查询子句，则其相关性评分取所有匹配查询子句中的最高相关性评分。必需。
`tie_breaker` | 一个介于 0 和 1.0 之间的浮点系数，用于为匹配多个查询子句的文档赋予更高的权重。在这种情况下，文档的相关性评分按以下算法计算：取所有匹配查询子句中的最高相关性评分，将其他所有匹配子句的评分乘以 `tie_breaker` 值，然后将这些相关性评分相加并进行归一化。可选。默认值为 0（表示只计算最高评分）。
