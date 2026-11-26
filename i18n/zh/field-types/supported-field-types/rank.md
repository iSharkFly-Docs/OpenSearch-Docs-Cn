---
title: 排名字段类型
---

# 排名字段类型

下表列出了 OpenSearch 支持的所有排名（rank）字段类型。

字段数据类型 | 描述
:--- | :---  
[`rank_feature`](#rank-feature) | 提高或降低文档的相关性评分（Relevance Score）。 
[`rank_features`](#rank-features) | 提高或降低文档的相关性评分。在特征列表稀疏时使用。 

::: info 注意
rank feature 和 rank features 字段只能通过 [rank feature 查询](#rank-feature-query)进行查询，不支持聚合或排序。
:::

## Rank feature

rank feature 字段类型使用一个正的 [float](/field-types/supported-field-types/numeric) 值，在 `rank_feature` 查询中提高或降低文档的相关性评分。默认情况下，该值会提高相关性评分。如需降低相关性评分，请将可选参数 `positive_score_impact` 设置为 false。

### 示例

创建一个包含 rank feature 字段的映射（Mapping）：

```json
PUT chessplayers
{
  "mappings": {
    "properties": {
      "name" : {
        "type" : "text"
      },
      "rating": {
        "type": "rank_feature" 
      },
      "age": {
        "type": "rank_feature",
        "positive_score_impact": false 
      }
    }
  }
}
```

索引三个文档，其中包含一个提高评分的 rank_feature 字段（`rating`）和一个降低评分的 rank_feature 字段（`age`）：

```json
PUT testindex1/_doc/1
{
  "name" : "John Doe",
  "rating" : 2554,
  "age" : 75
}
```

```json
PUT testindex1/_doc/2
{
  "name" : "Kwaku Mensah",
  "rating" : 2067,
  "age": 10
}
```

```json
PUT testindex1/_doc/3
{
  "name" : "Nikki Wolf",
  "rating" : 1864,
  "age" : 22
}
```

## Rank feature 查询

使用 rank feature 查询，可以按等级分、按年龄或同时按等级分和年龄对棋手进行排名。如果按等级分排名，等级分越高的棋手相关性评分越高；如果按年龄排名，越年轻的棋手相关性评分越高。

使用 rank feature 查询，根据年龄和等级分搜索棋手：

```json
GET chessplayers/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "rank_feature": {
            "field": "rating"
          }
        },
        {
          "rank_feature": {
            "field": "age"
          }
        }
      ]
    }
  }
}
```

同时按年龄和等级分排名时，越年轻、等级越高的棋手得分越高：

```json
{
  "took" : 2,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 3,
      "relation" : "eq"
    },
    "max_score" : 1.2093145,
    "hits" : [
      {
        "_index" : "chessplayers",
        "_type" : "_doc",
        "_id" : "2",
        "_score" : 1.2093145,
        "_source" : {
          "name" : "Kwaku Mensah",
          "rating" : 1967,
          "age" : 10
        }
      },
      {
        "_index" : "chessplayers",
        "_type" : "_doc",
        "_id" : "3",
        "_score" : 1.0150313,
        "_source" : {
          "name" : "Nikki Wolf",
          "rating" : 1864,
          "age" : 22
        }
      },
      {
        "_index" : "chessplayers",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 0.8098284,
        "_source" : {
          "name" : "John Doe",
          "rating" : 2554,
          "age" : 75
        }
      }
    ]
  }
}
```

## Rank features

rank features 字段类型与 rank feature 字段类型类似，但更适合稀疏的特征列表。rank features 字段可以索引数值特征向量，这些向量之后会在 `rank_feature` 查询中用于提高或降低文档的相关性评分。 

### 示例 {#example-1}

创建一个包含 rank features 字段的映射：

```json
PUT testindex1
{
  "mappings": {
    "properties": {
      "correlations": {
        "type": "rank_features" 
      }
    }
  }
}
```

要索引包含 rank features 字段的文档，请使用键为字符串、值为正浮点数的哈希映射（hashmap）：

```json
PUT testindex1/_doc/1
{
  "correlations": { 
    "young kids" : 1,
    "older kids" : 15,
    "teens" : 25.9
  }
}
```

```json
PUT testindex1/_doc/2
{
  "correlations": {
    "teens": 10,
    "adults": 95.7
  }
}
```

使用 rank feature 查询来查询文档：

```json
GET testindex1/_search
{
  "query": {
    "rank_feature": {
      "field": "correlations.teens"
    }
  }
}
```

响应按相关性评分排序：

```json
{
  "took" : 123,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 0.6258503,
    "hits" : [
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 0.6258503,
        "_source" : {
          "correlations" : {
            "young kids" : 1,
            "older kids" : 15,
            "teens" : 25.9
          }
        }
      },
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "2",
        "_score" : 0.39263803,
        "_source" : {
          "correlations" : {
            "teens" : 10,
            "adults" : 95.7
          }
        }
      }
    ]
  }
}
```

::: info 注意
rank feature 和 rank features 字段使用最高的 9 个有效位来表示精度，因此会产生约 0.4% 的相对误差。值以 2<sup>−8</sup> = 0.00390625 的相对精度存储。
:::
