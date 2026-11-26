---
title: 词项级查询与全文查询的比较
---

# 词项级查询与全文查询的比较

词项级查询（Term-level Query）和全文查询（Full-text Query）都可以用来搜索文本，但词项级查询通常用于搜索结构化数据，而全文查询用于全文搜索。词项级查询与全文查询的主要区别在于：词项级查询在文档（Document）中搜索指定的精确词项，而全文查询会对查询字符串进行[分析](/analyzers/)。下表总结了词项级查询与全文查询之间的区别。

| | 词项级查询 | 全文查询
:--- | :--- | :---
*描述* | 词项级查询回答哪些文档与查询匹配。 | 全文查询回答文档与查询的匹配程度。
*分析器* | 搜索词项不会被分析。也就是说，term 查询会按原样搜索你的搜索词项。  | 搜索词项会被索引特定文档字段时所用的同一个分析器（Analyzer）分析。也就是说，你的搜索词项会经历与文档字段相同的分析过程。
*相关性* | 词项级查询只返回匹配的文档，而不按相关性评分（Relevance Score）对其排序。它们仍然会计算相关性评分，但返回的所有文档的评分都相同。 | 全文查询会为每个匹配项计算相关性评分，并按相关性从高到低对结果排序。
*使用场景* | 当你需要匹配数字、日期或标签等精确值，且不需要按相关性对匹配结果排序时，请使用词项级查询。 | 当你需要匹配文本字段，并在考虑大小写和词干变体等因素后按相关性排序时，请使用全文查询。

::: info 注意
OpenSearch 使用 BM25 排名算法计算相关性评分。更多信息，请参阅 [Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25)。
:::

## 应该使用全文查询还是词项级查询？

为了阐明全文查询与词项级查询之间的区别，请看以下两个搜索特定文本短语的示例。莎士比亚全集已被索引到一个 OpenSearch 集群中。

### 示例：短语搜索

在此示例中，你将在莎士比亚全集的 `text_entry` 字段中搜索短语「To be, or not to be」。 

首先，使用**词项级查询**进行此搜索：

```json
GET shakespeare/_search
{
  "query": {
    "term": {
      "text_entry": "To be, or not to be"
    }
  }
}
```

响应中没有任何匹配项，`hits` 为零即说明了这一点：

```json
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  }
}
```

这是因为词项「To be, or not to be」是在倒排索引中按字面搜索的，而倒排索引中只存储了文本字段经过分析后的值。词项级查询不适合搜索经过分析的文本字段，因为它们经常会产生意外的结果。处理文本数据时，词项级查询只应用于映射为 `keyword` 的字段。

现在，使用**全文查询**搜索同一短语：

```json
GET shakespeare/_search
{
  "query": {
    "match": {
      "text_entry": "To be, or not to be"
    }
  }
}
```

搜索查询「To be, or not to be」会像文档的 `text_entry` 字段一样，经过分析并被切分为词元（Token）数组。全文查询会取搜索查询与所有文档的 `text_entry` 字段之间的词元交集，然后按相关性评分对结果排序：

```json
{
  "took" : 19,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 10000,
      "relation" : "gte"
    },
    "max_score" : 17.419369,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "34229",
        "_score" : 17.419369,
        "_source" : {
          "type" : "line",
          "line_id" : 34230,
          "play_name" : "Hamlet",
          "speech_number" : 19,
          "line_number" : "3.1.64",
          "speaker" : "HAMLET",
          "text_entry" : "To be, or not to be: that is the question:"
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "109930",
        "_score" : 14.883024,
        "_source" : {
          "type" : "line",
          "line_id" : 109931,
          "play_name" : "A Winters Tale",
          "speech_number" : 23,
          "line_number" : "4.4.153",
          "speaker" : "PERDITA",
          "text_entry" : "Not like a corse; or if, not to be buried,"
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "103117",
        "_score" : 14.782743,
        "_source" : {
          "type" : "line",
          "line_id" : 103118,
          "play_name" : "Twelfth Night",
          "speech_number" : 53,
          "line_number" : "1.3.95",
          "speaker" : "SIR ANDREW",
          "text_entry" : "will not be seen; or if she be, its four to one"
        }
      }
    ]
  }
}
...
```

关于所有全文查询的列表，请参阅[全文查询](/query-dsl/full-text/)。

### 示例：精确词项搜索

如果你想在 `speaker` 字段中搜索「HAMLET」这样的精确词项，并且不需要按相关性评分对结果排序，那么词项级查询的效率更高：

```json
GET shakespeare/_search
{
  "query": {
    "term": {
      "speaker": "HAMLET"
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took" : 5,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1582,
      "relation" : "eq"
    },
    "max_score" : 4.2540946,
    "hits" : [
      {
        "_index" : "shakespeare",
        "_id" : "32700",
        "_score" : 4.2540946,
        "_source" : {
          "type" : "line",
          "line_id" : 32701,
          "play_name" : "Hamlet",
          "speech_number" : 9,
          "line_number" : "1.2.66",
          "speaker" : "HAMLET",
          "text_entry" : "[Aside]  A little more than kin, and less than kind."
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "32702",
        "_score" : 4.2540946,
        "_source" : {
          "type" : "line",
          "line_id" : 32703,
          "play_name" : "Hamlet",
          "speech_number" : 11,
          "line_number" : "1.2.68",
          "speaker" : "HAMLET",
          "text_entry" : "Not so, my lord; I am too much i' the sun."
        }
      },
      {
        "_index" : "shakespeare",
        "_id" : "32709",
        "_score" : 4.2540946,
        "_source" : {
          "type" : "line",
          "line_id" : 32710,
          "play_name" : "Hamlet",
          "speech_number" : 13,
          "line_number" : "1.2.75",
          "speaker" : "HAMLET",
          "text_entry" : "Ay, madam, it is common."
        }
      }
    ]
  }
}
...
```

词项级查询提供精确匹配。因此，如果你搜索「Hamlet」，不会得到任何匹配项，因为「HAMLET」是一个 keyword 字段，在 OpenSearch 中按字面存储，而不是以经过分析的形式存储。
搜索查询「HAMLET」同样按字面进行搜索。因此，要匹配该字段，我们需要输入完全相同的字符。
