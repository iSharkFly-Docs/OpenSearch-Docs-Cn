---
title: 词项级查询
---

# 词项级查询

词项级查询（Term-level Query）在索引（Index）中搜索包含精确搜索词项的文档（Document）。词项级查询返回的文档不会按相关性评分（Relevance Score）排序。

处理文本数据时，词项级查询只应用于映射为 `keyword` 的字段。

词项级查询不适合搜索经过分析的文本字段。要返回经过分析的字段，请使用[全文查询](/query-dsl/full-text/)。

## 词项级查询类型

下表列出了所有词项级查询类型。

查询类型 | 描述
:--- | :--- 
[`term`](/query-dsl/term/term) | 在特定字段中搜索包含某个精确词项的文档。
[`terms`](/query-dsl/term/terms) | 在特定字段中搜索包含一个或多个词项的文档。
[`terms_set`](/query-dsl/term/terms-set) | 在特定字段中搜索至少匹配指定数量词项的文档。
[`ids`](/query-dsl/term/ids) | 按文档 ID 搜索文档。
[`range`](/query-dsl/term/range) | 搜索字段值位于特定范围内的文档。
[`prefix`](/query-dsl/term/prefix) | 搜索包含以特定前缀开头的词项的文档。
[`exists`](/query-dsl/term/exists) | 搜索在特定字段中有任意已索引值的文档。
[`fuzzy`](/query-dsl/term/fuzzy) | 搜索包含与搜索词项相似（在允许的最大 [Levenshtein 距离](https://en.wikipedia.org/wiki/Levenshtein_distance)内）的词项的文档。Levenshtein 距离衡量将一个词项变为另一个词项所需的单字符修改次数。
[`wildcard`](/query-dsl/term/wildcard) | 搜索包含与通配符模式匹配的词项的文档。 
[`regexp`](/query-dsl/term/regexp) | 搜索包含与正则表达式匹配的词项的文档。
