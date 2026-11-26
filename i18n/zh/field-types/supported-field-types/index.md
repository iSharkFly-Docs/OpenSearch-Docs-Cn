---
title: 支持的字段类型
---

# 支持的字段类型

创建映射（Mapping）时，可以为字段指定数据类型。下表列出了 OpenSearch 支持的所有数据字段类型（Field Type）。

类别 | 字段类型及描述
:--- | :---
别名 | [`alias`](/field-types/supported-field-types/alias)：现有字段的附加名称。
二进制 | [`binary`](/field-types/supported-field-types/binary)：Base64 编码的二进制值。 
[数值](/field-types/supported-field-types/numeric) | 数值（`byte`、`double`、`float`、`half_float`、`integer`、`long`、[`unsigned_long`](/field-types/supported-field-types/unsigned-long)、`scaled_float`、`short`）。 
布尔 | [`boolean`](/field-types/supported-field-types/boolean)：布尔值。 
[日期](/field-types/supported-field-types/dates)|  [`date`](/field-types/supported-field-types/date)：以毫秒存储的日期。<br> [`date_nanos`](/field-types/supported-field-types/date-nanos)：以纳秒存储的日期。
IP | [`ip`](/field-types/supported-field-types/ip)：IPv4 或 IPv6 格式的 IP 地址。 
[范围](/field-types/supported-field-types/range) | 值的范围（`integer_range`、`long_range`、`double_range`、`float_range`、`date_range`、`ip_range`）。
[对象](/field-types/supported-field-types/object-fields)| [`object`](/field-types/supported-field-types/object)：JSON 对象。<br>[`nested`](/field-types/supported-field-types/nested)：当数组中的对象需要作为单独的文档独立索引时使用。<br>[`flat_object`](/field-types/supported-field-types/flat-object)：被视为字符串的 JSON 对象。<br>[`join`](/field-types/supported-field-types/join)：在同一索引中的文档之间建立父子关系。 
[字符串](/field-types/supported-field-types/string)|[`keyword`](/field-types/supported-field-types/keyword)：包含不经过分析的字符串。<br> [`text`](/field-types/supported-field-types/text)：包含经过分析的字符串。<br> [`match_only_text`](/field-types/supported-field-types/match-only-text)：`text` 字段的空间优化版本。<br>[`token_count`](/field-types/supported-field-types/token-count)：存储字符串中经分析后的词元（Token）数量。
[自动补全](/field-types/supported-field-types/autocomplete) |[`completion`](/field-types/supported-field-types/completion)：通过补全建议器（completion suggester）提供自动补全功能。<br> [`search_as_you_type`](/field-types/supported-field-types/search-as-you-type)：同时使用前缀补全和中缀补全，提供边输入边搜索功能。 
[地理](/field-types/supported-field-types/geographic)| [`geo_point`](/field-types/supported-field-types/geo-point)：地理点。<br>[`geo_shape`](/field-types/supported-field-types/geo-shape)：地理形状。
[排名](/field-types/supported-field-types/rank) | 提高或降低文档的相关性评分（Relevance Score）（`rank_feature`、`rank_features`）。  
k-NN 向量 | [`knn_vector`](/field-types/supported-field-types/knn-vector)：允许将 k-NN 向量索引到 OpenSearch 中，并执行各种 k-NN 搜索。
Percolator | [`percolator`](/field-types/supported-field-types/percolator)：指定将该字段视为查询（Query）。 

## 数组

OpenSearch 中没有专门的数组字段类型。不过，可以向任何字段传入一个值数组。数组中的所有值必须具有相同的字段类型。

```json
PUT testindex1/_doc/1
{
  "number": 1 
}

PUT testindex1/_doc/2
{
  "number": [1, 2, 3] 
}
```

## 多字段

多字段（Multifield）用于以不同方式索引同一个字段。字符串通常会被映射为 `text` 用于全文查询（Full-text Query），同时映射为 `keyword` 用于精确值查询。

可以使用 `fields` 参数创建多字段。例如，可以将图书的 `title` 映射为 `text` 类型，同时保留一个 `keyword` 类型的 `title.raw` 子字段。

```json
PUT books
{
  "mappings" : {
    "properties" : {
      "title" : {
        "type" : "text",
        "fields" : {
          "raw" : {
            "type" : "keyword"
          }
        }
      }
    }
  }
}
```

## Null 值

将字段的值设置为 `null`、空数组或由 `null` 值组成的数组，等同于该字段为空。因此，无法搜索该字段为 `null` 的文档（Document）。 

如需让字段的 `null` 值可被搜索，可以在索引的映射中指定该字段的 `null_value` 参数。这样，传入该字段的所有 `null` 值都会被替换为指定的 `null_value`。

::: info 注意
`null_value` 参数必须与字段类型相同。例如，如果字段是字符串，那么该字段的 `null_value` 也必须是字符串。
:::

### 示例

创建一个映射，将 `emergency_phone` 字段中的 `null` 值替换为字符串 "NONE"：

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "name": {
        "type": "keyword"
      },
      "emergency_phone": {
        "type": "keyword",
        "null_value": "NONE" 
      }
    }
  }
}
```

向 testindex 索引三个文档。文档 1 和文档 3 的 `emergency_phone` 字段包含 `null`，而文档 2 的 `emergency_phone` 字段是一个空数组：

```json
PUT testindex/_doc/1
{
  "name": "Akua Mansa",
  "emergency_phone": null
}
```

```json
PUT testindex/_doc/2
{
  "name": "Diego Ramirez",
  "emergency_phone" : []
}
```

```json
PUT testindex/_doc/3 
{
  "name": "Jane Doe",
  "emergency_phone": [null, null]
}
```

搜索没有紧急联系电话的人员：

```json
GET testindex/_search
{
  "query": {
    "term": {
      "emergency_phone": "NONE"
    }
  }
}
```

响应包含文档 1 和文档 3，但不包含文档 2，因为只有显式的 `null` 值才会被替换为字符串 "NONE"：

```json
{
  "took" : 1,
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
    "max_score" : 0.18232156,
    "hits" : [
      {
        "_index" : "testindex",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 0.18232156,
        "_source" : {
          "name" : "Akua Mansa",
          "emergency_phone" : null
        }
      },
      {
        "_index" : "testindex",
        "_type" : "_doc",
        "_id" : "3",
        "_score" : 0.18232156,
        "_source" : {
          "name" : "Jane Doe",
          "emergency_phone" : [
            null,
            null
          ]
        }
      }
    ]
  }
}
```

::: info 注意
`_source` 字段仍然包含显式的 `null` 值，因为它不受 `null_value` 的影响。
:::
