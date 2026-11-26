---
title: Simple query string
---

# Simple query string 查询

使用 `simple_query_string` 查询（Query）类型可以直接在查询字符串中指定由正则表达式分隔的多个参数。Simple query string 的语法没有 query string 严格，因为它会丢弃字符串中任何无效的部分，并且不会因语法无效而返回错误。

该查询使用一种[简单语法](#simple-query-string-syntax)，根据特殊运算符解析查询字符串，并将字符串拆分为词项（Term）。解析完成后，查询会独立分析每个词项，然后返回匹配的文档（Document）。

以下查询对 `title` 字段执行模糊搜索：

```json
GET _search
{
  "query": {
    "simple_query_string": {
      "query": "\"rises wind the\"~4 | *ising~2",
      "fields": ["title"]
    }
  }
}
```

## Simple query string 语法

查询字符串由*词项*和*运算符*组成。词项是单个单词（例如，在查询 `wind rises` 中，词项为 `wind` 和 `rises`）。如果多个词项用引号括起来，它们会被视为一个短语，其中的单词按出现顺序进行匹配（例如 `"wind rises"`）。`+`、`|` 和 `-` 等运算符指定了用于解释查询字符串中文本的布尔逻辑。 

## 运算符

Simple query string 语法支持以下运算符。

运算符 | 描述
:--- | :---
`+` | 作为 `AND` 运算符。
`|` | 作为 `OR` 运算符。
`*` | 用在词项末尾时，表示前缀查询。
`"` | 将多个词项包装为一个短语（例如 `"wind rises"`）。
`(`, `)` | 包装一个子句以设置优先级（例如 `wind + (rises | rising)`）。
`~n` | 用在词项之后（例如 `wnid~3`）时，设置 `fuzziness`；用在短语之后时，设置 `slop`。 
`-` | 对词项取反。

上述所有运算符都是保留字符。若要将它们作为原始字符而非运算符引用，请使用反斜杠对其进行转义。发送 JSON 请求时，请使用 `\\` 转义保留字符（由于反斜杠字符本身也是保留字符，因此必须再用一个反斜杠对其进行转义）。

## 默认运算符

默认运算符为 `OR`（除非将 `default_operator` 设置为 `AND`）。默认运算符决定了查询的整体行为。例如，假设某个索引（Index）包含以下文档：

```json
PUT /customers/_doc/1
{
  "first_name":"Amber",
  "last_name":"Duke",
  "address":"880 Holmes Lane"
}
```

```json
PUT /customers/_doc/2
{
  "first_name":"Hattie",
  "last_name":"Bond",
  "address":"671 Bristol Street"
}
```

```json
PUT /customers/_doc/3
{
  "first_name":"Nanette",
  "last_name":"Bates",
  "address":"789 Madison St"
}
```

```json
PUT /customers/_doc/4
{
  "first_name":"Dale",
  "last_name":"Amber",
  "address":"467 Hutchinson Court"
}
```

以下查询尝试查找地址中包含单词 `street` 或 `st` 且不包含单词 `madison` 的文档：

```json
GET /customers/_search
{
  "query": {
    "simple_query_string": {
      "fields": [ "address" ],
      "query": "street st -madison"
    }
  }
}

```

然而，结果中不仅包含预期的文档，而是包含了全部四个文档：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 3,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 4,
      "relation": "eq"
    },
    "max_score": 2.2039728,
    "hits": [
      {
        "_index": "customers",
        "_id": "2",
        "_score": 2.2039728,
        "_source": {
          "first_name": "Hattie",
          "last_name": "Bond",
          "address": "671 Bristol Street"
        }
      },
      {
        "_index": "customers",
        "_id": "3",
        "_score": 1.2039728,
        "_source": {
          "first_name": "Nanette",
          "last_name": "Bates",
          "address": "789 Madison St"
        }
      },
      {
        "_index": "customers",
        "_id": "1",
        "_score": 1,
        "_source": {
          "first_name": "Amber",
          "last_name": "Duke",
          "address": "880 Holmes Lane"
        }
      },
      {
        "_index": "customers",
        "_id": "4",
        "_score": 1,
        "_source": {
          "first_name": "Dale",
          "last_name": "Amber",
          "address": "467 Hutchinson Court"
        }
      }
    ]
  }
}
```
</details>

由于默认运算符为 `OR`，该查询既包含含有单词 `street` 或 `st` 的文档（文档 2 和 3），也包含不含单词 `madison` 的文档（文档 1 和 4）。

要正确表达查询意图，请在 `-madison` 前加上 `+`：

```json
GET /customers/_search
{
  "query": {
    "simple_query_string": {
      "fields": [ "address" ],
      "query": "street st +-madison"
    }
  }
}
```

或者，将 `AND` 指定为默认运算符，并对单词 `street` 和 `st` 使用析取（OR）：

```json
GET /customers/_search
{
  "query": {
    "simple_query_string": {
      "fields": [ "address" ],
      "query": "st|street -madison",
      "default_operator": "AND"
    }
  }
}
```

上述查询返回文档 2：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 2.2039728,
    "hits": [
      {
        "_index": "customers",
        "_id": "2",
        "_score": 2.2039728,
        "_source": {
          "first_name": "Hattie",
          "last_name": "Bond",
          "address": "671 Bristol Street"
        }
      }
    ]
  }
}
```
</details>

## 限制运算符

要限制 simple query string 解析器支持的运算符，请在 `flags` 参数中列出希望支持的运算符，并用 `|` 分隔。例如，以下查询仅启用 `OR`、`AND` 和 `FUZZY` 运算符：

```json
GET /customers/_search
{
  "query": {
    "simple_query_string": {
      "fields": [ "address" ],
      "query": "bristol | madison +stre~2",
      "flags": "OR|AND|FUZZY"
    }
  }
}
```

下表列出了所有可用的运算符标志。

标志 | 描述
:--- | :--- 
`ALL` (default) | 启用所有运算符。 
`AND` | 启用 `+`（`AND`）运算符。 
`ESCAPE` | 启用 `\` 作为转义字符。 
`FUZZY` | 启用单词之后的 `~n` 运算符，其中 `n` 是一个整数，表示匹配时允许的编辑距离。
`NEAR` | 启用短语之后的 `~n` 运算符，其中 `n` 是匹配词元（Token）之间允许的最大位置数。与 `SLOP` 相同。 
`NONE` | 禁用所有运算符。 
`NOT` | 启用 `-`（`NOT`）运算符。 
`OR` | 启用 `|`（`OR`）运算符。 
`PHRASE` | 启用 `"`（引号）进行短语搜索。 
`PRECEDENCE` | 启用 `(` 和 `)`（括号）运算符来设置运算符优先级。 
`PREFIX` | 启用 `*`（前缀）运算符。 
`SLOP` | 启用短语之后的 `~n` 运算符，其中 `n` 是匹配词元之间允许的最大位置数。与 `NEAR` 相同。 
`WHITESPACE` | 启用空白字符作为拆分文本的字符。 

## 通配符表达式

可以使用 `*` 特殊字符指定通配符表达式，它可以替代零个或多个字符。例如，以下查询在所有以 `name` 结尾的字段中进行搜索：

```json
GET /customers/_search
{
  "query": {
    "simple_query_string" : {
      "query":    "Amber Bond",
      "fields": [ "*name" ] 
    }
  }
}
```

## 权重提升

使用脱字符（`^`）权重提升（boost）运算符，可以按一定倍数提升某个字段的相关性评分（Relevance Score）。[0, 1) 范围内的值会降低相关性，大于 1 的值会提高相关性。默认值为 `1`。 

例如，以下查询搜索 `first_name` 和 `last_name` 字段，并将 `first_name` 字段中的匹配结果的权重提升为 2 倍：

```json
GET /customers/_search
{
  "query": {
    "simple_query_string" : {
      "query":    "Amber",
      "fields": [ "first_name^2", "last_name" ] 
    }
  }
}
```

## 多位置词元

对于多位置词元，simple query string 会创建一个 [match phrase 查询](/query-dsl/full-text/match-phrase)。因此，如果将 `ml, machine learning` 指定为同义词并搜索 `ml`，OpenSearch 会搜索 `ml OR "machine learning"`。 

或者，也可以使用合取（AND）方式匹配多位置词元。如果将 `auto_generate_synonyms_phrase_query` 设置为 `false`，OpenSearch 会搜索 `ml OR (machine AND learning)`。 

例如，以下查询搜索文本 `ml models`，并指定不为每个同义词自动生成 match phrase 查询：

```json
GET /testindex/_search
{
  "query": {
    "simple_query_string": {
      "fields": ["title"],
      "query": "ml models",
      "auto_generate_synonyms_phrase_query": false
    }
  }
}
```

对于该查询，OpenSearch 会创建以下布尔查询：`(ml OR (machine AND learning)) models`。

## 参数

下表列出了 `simple_query_string` 查询支持的顶级参数。除 `query` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`query`| String | 用于搜索的文本，可以包含采用 [simple query string 语法](#simple-query-string-syntax)的表达式。必需。
`analyze_wildcard` | Boolean | 指定 OpenSearch 是否应尝试分析通配符词项。默认值为 `false`。
`analyzer` | String | 用于对查询字符串文本进行分词的分析器（Analyzer）。默认值为 `default_field` 指定的索引时分析器。如果没有为 `default_field` 指定分析器，则 `analyzer` 为该索引的默认分析器。
`auto_generate_synonyms_phrase_query` | Boolean | 指定是否为多词项同义词自动创建 [match_phrase 查询](/query-dsl/full-text/match)。默认值为 `true`。
`default_operator`| String | 如果查询字符串包含多个搜索词项，该参数指定文档被视为匹配时是需要所有词项都匹配（`AND`），还是只需一个词项匹配（`OR`）。有效值为：<br>- `OR`：字符串 `to be` 被解释为 `to OR be`<br>- `AND`：字符串 `to be` 被解释为 `to AND be`<br> 默认值为 `OR`。
`fields` | String array | 要搜索的字段列表（例如 `"fields": ["title^4", "description"]`）。支持通配符。如果未指定，则默认使用 `index.query. Default_field` 设置，该设置的默认值为 `["*"]`。可同时搜索的最大字段数由 `indices.query.bool.max_clause_count` 定义，默认为 1,024。
`flags` | String | 由 `|` 分隔的要启用的[标志](/query-dsl/full-text/simple-query-string)字符串（例如 `AND|OR|NOT`）。默认值为 `ALL`。你可以为 `default_field` 显式设置值。例如，要返回所有标题，可将其设置为 `"default_field": "title"`。
`fuzzy_max_expansions` | Positive integer | 查询最多可以扩展到的词项数。模糊查询会“扩展到”在 `fuzziness` 指定距离内的若干个匹配词项，然后 OpenSearch 尝试匹配这些词项。默认值为 `50`。
`fuzzy_transpositions` | Boolean | 将 `fuzzy_transpositions` 设置为 `true`（默认值）时，会在 `fuzziness` 选项的插入、删除和替换操作之外，增加相邻字符的交换操作。例如，如果 `fuzzy_transpositions` 为 true（交换“n”和“i”），`wind` 与 `wnid` 之间的距离为 1；如果为 false（删除“n”，再插入“n”），距离为 2。如果 `fuzzy_transpositions` 为 false，`rewind` 和 `wnid` 与 `wind` 的距离相同（均为 2），尽管从人的角度来看，`wnid` 显然只是一个拼写错误。默认值适用于大多数场景。
`fuzzy_prefix_length`| Integer | 模糊匹配时保持不变的开头字符数。默认值为 0。 
`lenient` | Boolean | 将 `lenient` 设置为 `true` 会忽略查询与文档字段之间的数据类型不匹配。例如，查询字符串 `"8.2"` 可以匹配 `float` 类型的字段。默认值为 `false`。
`minimum_should_match` | Positive or negative integer, positive or negative percentage, combination | 如果查询字符串包含多个搜索词项并且使用 `or` 运算符，该参数指定文档被视为匹配时需要匹配的词项数。例如，如果 `minimum_should_match` 为 2，则 `wind often rising` 与 `The Wind Rises.` 不匹配；如果 `minimum_should_match` 为 `1`，则二者匹配。有关详细信息，请参阅 [Minimum should match](/query-dsl/minimum-should-match)。
`quote_field_suffix` | String | 此选项支持使用与非精确匹配不同的分析方法来搜索精确匹配（用引号括起来）。例如，如果 `quote_field_suffix` 为 `.exact`，并且在 `title` 字段中搜索 `\"lightly\"`，OpenSearch 会在 `title.exact` 字段中搜索单词 `lightly`。第二个字段可能使用不同的类型（例如 `keyword` 而不是 `text`）或不同的分析器。
