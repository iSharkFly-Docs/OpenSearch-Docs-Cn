---
title: Term
---

# Term 查询

使用 `term` 查询在字段中搜索精确的词项。例如，以下查询搜索具有精确行号的行：

```json
GET shakespeare/_search
{
  "query": {
    "term": {
      "line_id": {
        "value": "61809"
      }
    }
  }
}
```

在为文档（Document）建立索引时，`text` 字段会被[分析](/analyzers/)。分析过程包括对文本进行分词、转换为小写以及去除标点符号。`match` 查询会分析查询文本，而 `term` 查询只匹配精确的词项，因此可能无法返回相关的结果。请避免在 `text` 字段上使用 `term` 查询。更多信息，请参阅[词项级查询与全文查询的比较](/query-dsl/term-vs-full-text)。

你可以在 `case_insensitive` 参数中指定查询不区分大小写：

```json
GET shakespeare/_search
{
  "query": {
    "term": {
      "speaker": {
        "value": "HAMLET",
        "case_insensitive": true
      }
    }
  }
}
```

响应中包含匹配的文档，而不考虑大小写差异：

```json
"hits": {
  "total": {
    "value": 1582,
    "relation": "eq"
  },
  "max_score": 2,
  "hits": [
    {
      "_index": "shakespeare",
      "_id": "32700",
      "_score": 2,
      "_source": {
        "type": "line",
        "line_id": 32701,
        "play_name": "Hamlet",
        "speech_number": 9,
        "line_number": "1.2.66",
        "speaker": "HAMLET",
        "text_entry": "[Aside]  A little more than kin, and less than kind."
      }
    },
  ...
}
```

## 参数

该查询接受字段名称（`<field>`）作为顶层参数：

```json
GET _search
{
  "query": {
    "term": {
      "<field>": {
        "value": "sample",
        ... 
      }
    }
  }
}
```

`<field>` 接受以下参数。除 `value` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`value` | String | 要在 `<field>` 指定的字段中搜索的词项。只有当文档的字段值与该词项完全匹配（包括空格和大小写）时，才会在结果中返回该文档。
`boost` | Floating-point | 按给定的倍数提升查询权重。适用于包含多个查询的搜索。[0, 1) 范围内的值会降低相关性，大于 1 的值会提高相关性。默认值为 `1`。 
`case_insensitive` | Boolean | 如果为 `true`，则允许值与已索引的字段值进行不区分大小写的匹配。默认值为 `false`（是否区分大小写由字段的映射决定）。
