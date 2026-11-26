---
title: Boosting
---

# Boosting 查询

如果搜索单词 "pitcher"，结果可能与棒球投手有关，也可能与盛装液体的水罐有关。如果是在棒球语境下搜索，可以使用 `must_not` 子句完全排除包含 "glass" 或 "water" 等单词的结果。但如果想保留这些结果、只是降低它们的相关性，则可以使用 `boosting` 查询（Query）。 

`boosting` 查询返回匹配 `positive` 查询的文档（Document）。在这些文档中，同时匹配 `negative` 查询的文档会获得较低的相关性评分（Relevance Score）（其相关性评分会乘以负向权重提升（boost）系数）。

## 示例

假设有一个索引（Index），并按如下方式索引了两个文档：

```json
PUT testindex/_doc/1
{
  "article_name": "The greatest pitcher in baseball history"
}
```

```json
PUT testindex/_doc/2
{
  "article_name": "The making of a glass pitcher"
}
```

使用以下 match 查询搜索包含单词 "pitcher" 的文档：

```json
GET testindex/_search
{
  "query": {
    "match": {
      "article_name": "pitcher"
    }
  }
}
```

返回的两个文档具有相同的相关性评分：

```json
{
  "took": 5,
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
    "max_score": 0.18232156,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0.18232156,
        "_source": {
          "article_name": "The greatest pitcher in baseball history"
        }
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 0.18232156,
        "_source": {
          "article_name": "The making of a glass pitcher"
        }
      }
    ]
  }
}
```

现在使用以下 `boosting` 查询搜索包含单词 "pitcher" 的文档，但降低包含 "glass"、"crystal" 或 "water" 等单词的文档的排名：

```json
GET testindex/_search
{
  "query": {
    "boosting": {
      "positive": {
        "match": {
          "article_name": "pitcher"
        }
      },
      "negative": {
        "match": {
          "article_name": "glass crystal water"
        }
      },
      "negative_boost": 0.1
    }
  }
}
```

两个文档仍然都会返回，但包含单词 "glass" 的文档的相关性评分比上一种情况低 10 倍：

```json
{
  "took": 13,
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
    "max_score": 0.18232156,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0.18232156,
        "_source": {
          "article_name": "The greatest pitcher in baseball history"
        }
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 0.018232157,
        "_source": {
          "article_name": "The making of a glass pitcher"
        }
      }
    ]
  }
}
```

## 参数

下表列出了 `boosting` 查询支持的所有顶级参数。

参数 | 描述
:--- | :---
`positive` | 文档要在结果中返回所必须匹配的查询。必需。
`negative` | 如果结果中的某个文档匹配该查询，则将其原始相关性评分（由 `positive` 查询产生）乘以 `negative_boost` 参数，以降低其相关性评分。必需。
`negative_boost` | 一个介于 0 和 1.0 之间的浮点系数，原始相关性评分会乘以该系数，以降低匹配 `negative` 查询的文档的相关性。必需。
