---
title: 补全
---

# 补全字段类型

补全（completion）字段类型通过补全建议器（completion suggester）提供自动补全功能。补全建议器是一种前缀建议器，因此只匹配文本的开头部分。补全建议器会创建一个内存数据结构，查找速度更快，但会增加内存占用。使用此功能之前，需要将所有可能的补全项列表上传到索引（Index）中。

## 示例

创建一个包含补全字段的映射（Mapping）：

```json
PUT chess_store
{
  "mappings": {
    "properties": {
      "suggestions": {
        "type": "completion"
      },
      "product": {
        "type": "keyword"
      }
    }
  }
}
```

将建议项索引到 OpenSearch 中：

```json
PUT chess_store/_doc/1
{
  "suggestions": {
      "input": ["Books on openings", "Books on endgames"],
      "weight" : 10
    }
}
```

## 参数

下表列出了补全字段接受的参数。

参数 | 描述 
:--- | :--- 
`input` | 可能的补全项列表，可以是字符串或字符串数组。不能包含 `\u0000`（null）、`\u001f`（信息分隔符一）或 `\u001e`（信息分隔符二）。必需。
`weight` | 用于对建议项进行排名的正整数或正整数字符串。可选。

可以按如下方式索引多个建议项：

```json
PUT chess_store/_doc/2
{
  "suggestions": [
    {
      "input": "Chess set",
      "weight": 20
    },
    {
      "input": "Chess pieces",
      "weight": 10
    },
    {
      "input": "Chess board",
      "weight": 5
    }
  ]
}
```

你也可以使用以下简写形式（注意，在这种写法中不能提供 `weight` 参数）：

```json
PUT chess_store/_doc/3
{
  "suggestions" : [ "Chess clock", "Chess timer" ]
}
```

## 查询补全字段类型

要查询补全字段类型，请指定要搜索的前缀以及用于查找建议项的字段名称。

在索引中查询以单词 "chess" 开头的建议项：

```json
GET chess_store/_search
{
  "suggest": {
    "product-suggestions": {
      "prefix": "chess",        
      "completion": {         
          "field": "suggestions"
      }
    }
  }
}
```

响应包含自动补全建议项：

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
  },
  "suggest" : {
    "product-suggestions" : [
      {
        "text" : "chess",
        "offset" : 0,
        "length" : 5,
        "options" : [
          {
            "text" : "Chess set",
            "_index" : "chess_store",
            "_type" : "_doc",
            "_id" : "2",
            "_score" : 20.0,
            "_source" : {
              "suggestions" : [
                {
                  "input" : "Chess set",
                  "weight" : 20
                },
                {
                  "input" : "Chess pieces",
                  "weight" : 10
                },
                {
                  "input" : "Chess board",
                  "weight" : 5
                }
              ]
            }
          },
          {
            "text" : "Chess clock",
            "_index" : "chess_store",
            "_type" : "_doc",
            "_id" : "3",
            "_score" : 1.0,
            "_source" : {
              "suggestions" : [
                "Chess clock",
                "Chess timer"
              ]
            }
          }
        ]
      }
    ]
  }
}
```

在响应中，`_score` 字段包含索引时设置的 `weight` 参数值。`text` 字段填充的是建议项的 `input` 参数。

默认情况下，响应包含整个文档（Document），包括 `_source` 字段，这可能会影响性能。要只返回 `suggestions` 字段，可以在 `_source` 参数中指定。你还可以通过指定 `size` 参数来限制返回的建议项数量。

```json
GET chess_store/_search
{
  "_source": "suggestions", 
  "suggest": {
    "product-suggestions": {
      "prefix": "chess",        
      "completion": {         
          "field": "suggestions",
          "size" : 3
      }
    }
  }
}
```

响应包含建议项：

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
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "product-suggestions" : [
      {
        "text" : "chess",
        "offset" : 0,
        "length" : 5,
        "options" : [
          {
            "text" : "Chess set",
            "_index" : "chess_store",
            "_type" : "_doc",
            "_id" : "2",
            "_score" : 20.0,
            "_source" : {
              "suggestions" : [
                {
                  "input" : "Chess set",
                  "weight" : 20
                },
                {
                  "input" : "Chess pieces",
                  "weight" : 10
                },
                {
                  "input" : "Chess board",
                  "weight" : 5
                }
              ]
            }
          },
          {
            "text" : "Chess clock",
            "_index" : "chess_store",
            "_type" : "_doc",
            "_id" : "3",
            "_score" : 1.0,
            "_source" : {
              "suggestions" : [
                "Chess clock",
                "Chess timer"
              ]
            }
          }
        ]
      }
    ]
  }
}
```

::: info 注意
要使用源过滤功能，请在 `_search` 端点上使用建议功能。`_suggest` 端点不支持源过滤。
:::

## 补全查询参数

下表列出了补全建议器查询接受的参数。

参数 | 描述 
:--- | :--- 
`field` | 一个字符串，指定要在其上运行查询的字段。必需。
`size` | 一个整数，指定返回建议项的最大数量。可选。默认值为 5。
`skip_duplicates` | 一个布尔值，指定是否跳过重复的建议项。可选。默认值为 `false`。

## 模糊补全查询

为了支持模糊匹配，可以为补全查询指定 `fuzziness` 参数。这样，即使用户输错了搜索词，补全查询仍会返回结果。此外，与查询匹配的前缀越长，文档的评分就越高。

```json
GET chess_store/_search
{
  "suggest": {
    "product-suggestions": {
      "prefix": "chesc",        
      "completion": {         
          "field": "suggestions",
          "size" : 3,
          "fuzzy" : {
            "fuzziness" : "AUTO"
          }
      }
    }
  }
}
```

::: tip 提示
要使用所有默认的模糊选项，请指定 `"fuzzy": {}` 或 `"fuzzy": true`。
:::

下表列出了模糊补全建议器查询接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`fuzziness` | 模糊度可以设置为以下值之一： <br> 1. 一个整数，指定此次编辑允许的最大 [Levenshtein 距离](https://en.wikipedia.org/wiki/Levenshtein_distance)。 <br> 2. `AUTO`：0–2 个字符的字符串必须精确匹配，3–5 个字符的字符串允许 1 次编辑，超过 5 个字符的字符串允许 2 次编辑。<br> 默认值为 `AUTO`。
`min_length` | 一个整数，指定开始返回建议项时输入所需的最小长度。如果搜索词短于 `min_length`，则不返回任何建议项。默认值为 3。
`prefix_length` | 一个整数，指定开始返回建议项时匹配前缀所需的最小长度。如果长度为 `prefix_length` 的前缀不匹配，即使搜索词仍在 Levenshtein 距离之内，也不会返回任何建议项。默认值为 1。
`transpositions` | 一个布尔值，指定是否将换位（相邻字符互换）计为一次编辑而不是两次。示例：建议项的 `input` 参数为 `abcde`，`fuzziness` 为 1。如果 `transpositions` 设置为 `true`，则 `abdce` 会匹配；如果 `transpositions` 设置为 `false`，则 `abdce` 不会匹配。默认值为 `true`。
`unicode_aware` | 一个布尔值，指定在计算编辑距离、换位和长度时是否使用 Unicode 码位。如果 `unicode_aware` 设置为 `true`，计算速度会较慢。默认值为 `false`，此时以字节为单位计算距离。

## 正则表达式查询

你可以使用正则表达式来定义补全建议器查询的前缀。 

例如，要搜索以 "a" 开头且后面某处包含 "d" 的字符串，请使用以下查询：

```json
GET chess_store/_search
{
  "suggest": {
    "product-suggestions": {
      "regex": "a.*d",        
      "completion": {         
          "field": "suggestions"
      }
    }
  }
}
```

响应匹配了字符串 "abcde"：

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
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "suggest" : {
    "product-suggestions" : [
      {
        "text" : "a.*d",
        "offset" : 0,
        "length" : 4,
        "options" : [
          {
            "text" : "abcde",
            "_index" : "chess_store",
            "_type" : "_doc",
            "_id" : "2",
            "_score" : 20.0,
            "_source" : {
              "suggestions" : [
                {
                  "input" : "abcde",
                  "weight" : 20
                }
              ]
            }
          }
        ]
      }
    ]
  }
}
```
