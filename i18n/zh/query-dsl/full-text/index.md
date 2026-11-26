---
title: 全文查询
---

# 全文查询

本页列出了所有全文查询（Full-text Query）类型和常用选项。可以使用许多可选字段来构建细致的搜索行为，因此建议先针对具有代表性的索引（Index）测试一些基本查询类型并验证输出，然后再执行带有多个选项的更高级或更复杂的搜索。

OpenSearch 使用 Apache Lucene 搜索库，它为数据的摄取、索引、搜索和聚合提供了高效的数据结构和算法。

要详细了解搜索查询类，请参阅 [Lucene query JavaDocs](https://lucene.apache.org/core/8_9_0/core/org/apache/lucene/search/Query.html)。

本节介绍的全文查询类型使用标准分析器（Analyzer），该分析器会在提交查询时自动分析文本。

下表列出了所有全文查询类型。

查询类型 | 描述
:--- | :--- 
[`intervals`](/query-dsl/full-text/intervals) | 允许对匹配词项的邻近程度和顺序进行细粒度控制。 
[`match`](/query-dsl/full-text/match) | 默认的全文查询，可用于模糊匹配以及短语搜索或邻近搜索。
[`match_bool_prefix`](/query-dsl/full-text/match-bool-prefix) | 创建一个[布尔查询](/query-dsl/compound/bool)，匹配位于任意位置的所有词项，并将最后一个词项视为前缀。
[`match_phrase`](/query-dsl/full-text/match-phrase) | 与 `match` 查询类似，但匹配整个短语，允许的间隔由可配置的 slop 决定。
[`match_phrase_prefix`](/query-dsl/full-text/match-phrase-prefix) | 与 `match_phrase` 查询类似，但将词项作为整个短语匹配，并将最后一个词项视为前缀。
[`multi_match`](/query-dsl/full-text/multi-match) | 与 `match` 查询类似，但用于多个字段。
[`query_string`](/query-dsl/full-text/query-string) | 使用严格的语法，在单个查询字符串中指定布尔条件和多字段搜索。 
[`simple_query_string`](/query-dsl/full-text/simple-query-string) | `query_string` 查询的一个更简单、不那么严格的版本。
