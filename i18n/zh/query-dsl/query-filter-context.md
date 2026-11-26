---
title: 查询上下文与过滤上下文
---

# 查询上下文与过滤上下文

查询（Query）由查询子句组成，查询子句可以在[*过滤上下文（Filter Context）*](#filter-context)或[*查询上下文（Query Context）*](#query-context)中运行。过滤上下文中的查询子句提出的问题是「文档*是否*与查询子句匹配？」，并返回匹配的文档。查询上下文中的查询子句提出的问题是「文档与查询子句的匹配*程度如何*？」，它会返回匹配的文档，并以[*相关性评分（Relevance Score）*](#relevance-score)的形式给出每个文档的相关性。

## 相关性评分

*相关性评分*衡量文档与查询的匹配程度。它是一个正浮点数，OpenSearch 会将其记录在每个文档的 `_score` 元数据字段中：

```json
"hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "32437",
        "_score" : 18.781435,
        "_source" : {
          "type" : "line",
          "line_id" : 32438,
          "play_name" : "Hamlet",
          "speech_number" : 3,
          "line_number" : "1.1.3",
          "speaker" : "BERNARDO",
          "text_entry" : "Long live the king!"
        }
      },
...
```

评分越高，表示文档的相关性越高。虽然不同的查询类型计算相关性评分的方式不同，但所有查询类型都会考虑查询子句是在过滤上下文中运行还是在查询上下文中运行。 

::: tip 提示
将希望影响相关性评分的查询子句放在查询上下文中，其他所有查询子句都放在过滤上下文中。
:::

## 过滤上下文

过滤上下文中的查询子句提出的问题是「文档*是否*与查询子句匹配？」，答案只有是或否。例如，如果你有一个包含学生数据的索引（Index），可以使用过滤上下文回答关于某个学生的以下问题：

- 该学生的 `honors` 状态是否设置为 `true`？
- 该学生的 `graduation_year` 是否在 2020–2022 范围内？

在过滤上下文中，OpenSearch 返回匹配的文档，而不计算相关性评分。因此，对于具有精确值的字段，应使用过滤上下文。 

要在过滤上下文中运行查询子句，请将其传给 `filter` 参数。例如，以下 Boolean 查询搜索在 2020–2022 年间以优异成绩毕业的学生：

```json
GET students/_search
{
  "query": { 
    "bool": { 
      "filter": [ 
        { "term":  { "honors": true }},
        { "range": { "graduation_year": { "gte": 2020, "lte": 2022 }}}
      ]
    }
  }
}
```

为了提高性能，OpenSearch 会缓存常用的过滤器。

## 查询上下文

查询上下文中的查询子句提出的问题是「文档与查询子句的匹配*程度如何*？」，答案并非简单的是或否。查询上下文适用于全文搜索，在这种场景下，你不仅希望获得匹配的文档，还希望确定每个文档的相关性。例如，如果你有一个包含莎士比亚全集的索引，可以将查询上下文用于以下搜索：

- 查找包含单词 `dream` 的文档，包括其各种形式（`dreaming` 或 `dreams`）和同义词（`contemplate`）。
- 查找与单词 `long live king` 匹配的文档。

在查询上下文中，每个匹配的文档都会在 `_score` 字段中包含相关性评分，你可以据此按相关性对文档进行[排序](/search-plugins/searching-data/sort)。 

要在查询上下文中运行查询子句，请将其传给 `query` 参数。例如，以下查询在 `shakespeare` 索引中搜索与单词 `long live king` 匹配的文档：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": "long live king"
    }
  }
}
```

::: info 注意
相关性评分是单精度浮点数，有效数字精度为 24 位。如果评分计算超出了有效数字精度，可能会损失精度。
:::
