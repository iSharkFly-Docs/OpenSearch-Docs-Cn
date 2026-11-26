---
title: Query string
---

# Query string 查询

`query_string` 查询（Query）会根据 [query string 语法](#query-string-syntax)解析查询字符串。它可以用来创建功能强大而又简洁的查询，这些查询可以包含通配符并搜索多个字段。

::: info 注意
使用 `query_string` 查询进行搜索时不会返回嵌套文档（Document）。要搜索嵌套字段，请使用 [`nested` 查询](/field-types/supported-field-types/nested)。
:::

::: warning 重要
Query string 查询的语法很严格，语法无效时会返回错误。因此，它不太适合搜索框类应用。如需语法不那么严格的替代方案，可以考虑使用 [`simple_query_string` 查询](/query-dsl/full-text/simple-query-string)。如果不需要支持查询语法，请使用 [`match` 查询](/query-dsl/full-text/match)。
:::

## Query string 语法

Query string 语法基于 [Apache Lucene 查询语法](https://lucene.apache.org/core/2_9_4/queryparsersyntax.html)。

你可以在以下场景中使用 query string 语法：

1. 在 `query_string` 查询中，例如：
    ```json
    GET _search
    {
      "query": {
        "query_string": {
          "query": "the wind AND (rises OR rising)"
        }
      }
    }
    ```

1. 在 OpenSearch Dashboards 的 Discover 或 Dashboard 应用中关闭 DQL 后，如下图所示。
  ![在 OpenSearch Dashboards Discover 中使用 query string 语法](/images/discover-lucene-syntax.png)
  

  ::: tip 提示
  DQL 和 Query string query（Lucene）语言是 Discover 和 Dashboards 中搜索栏的两种语言选项。要比较这两种语言选项，请参阅 [Discover 和 Dashboard 搜索栏](/dashboards/#discover-and-dashboard-search-bar)。
  :::

1. 使用 HTTP 请求查询参数进行搜索时，例如： 
  ```json
    GET _search?q=wind
  ```

查询字符串由*词项*和*运算符*组成。词项（Term）是单个单词（例如，在查询 `wind rises` 中，词项为 `wind` 和 `rises`）。如果多个词项用引号括起来，它们会被视为一个短语，其中的单词按出现顺序进行匹配（例如 `"wind rises"`）。运算符（例如 `OR`、`AND` 和 `NOT`）指定了用于解释查询字符串中文本的布尔逻辑。 

本节中的示例使用一个包含以下映射（Mapping）和文档的索引（Index）：

```json
PUT /testindex
{
  "mappings": {
    "properties": {
      "title": { 
        "type": "text",
        "fields": {
          "english": { 
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}
```

```json
PUT /testindex/_doc/1
{
  "title": "The wind rises"
}
```

```json
PUT /testindex/_doc/2
{
  "title": "Gone with the wind",
  "description": "A 1939 American epic historical film"
}
```

```json
PUT /testindex/_doc/3
{
  "title": "Windy city"
}
```

```json
PUT /testindex/_doc/4
{
  "article title": "Wind turbines"
}
```

## 保留字符

以下是 query string 查询的保留字符列表： 

`+`, `-`, `=`, `&&`, `||`, `>`, `<`, `!`, `(`, `)`,`{`, `}`, `[`, `]`, `^`, `"`, `~`, `*`, `?`, `:`, `\`, `/`

::: tip 提示
使用反斜杠（`\`）转义保留字符。发送 JSON 请求时，请使用双反斜杠（`\\`）转义保留字符（由于反斜杠字符本身也是保留字符，因此必须再用一个反斜杠对其进行转义）。 
:::

例如，要搜索表达式 `2*3`，请将查询字符串指定为 `2\\*3`：

```json
GET /testindex/_search
{
 "query": {
    "query_string": {
      "query": "title: 2\\*3"
    }
  }
}
```

::: warning 重要
`>` 和 `<` 符号不能转义，它们会被解释为范围查询。 
:::

## 空白字符和空查询

空白字符不被视为运算符。如果查询字符串为空或只包含空白字符，查询不返回任何结果。

## 字段名称

在冒号前指定字段名称。下表列出了包含字段名称的示例查询。

`query_string` 查询中的查询 | Discover 中的查询 | 文档匹配条件 | `testindex` 索引中的匹配文档
:--- | :--- | :--- | :---
`title: wind` | `title: wind` | `title` 字段包含单词 `wind`。 | 1, 2
`title: (wind OR windy)` | `title: (wind OR windy)` | `title` 字段包含单词 `wind` 或单词 `windy`。 | 1, 2, 3
`title: \"wind rises\"` | `title: "wind rises"` | `title` 字段包含短语 `wind rises`。使用反斜杠转义引号。 | 1
`article\\ title: wind` | `article\ title: wind` | `article title` 字段包含单词 `wind`。使用反斜杠转义空格字符。 | 4
`title.\\*: rise` | `title.\*: rise` | 每个以 `title.` 开头的字段（在本例中为 `title.english`）都包含单词 `rise`。使用反斜杠转义通配符。 | 1
`_exists_: description` | `_exists_: description` | 字段 `description` 存在。 | 2

## 通配符表达式

可以使用特殊字符指定通配符表达式：`?` 替代单个字符，`*` 替代零个或多个字符。

#### 示例

以下查询搜索标题包含单词 `gone` 且描述中包含以 `hist` 开头的单词的文档：

```json
GET /testindex/_search
{
 "query": {
    "query_string": {
      "query": "title: gone AND description: hist*"
    }
  }
}
```

::: danger 警告
通配符查询可能会占用大量内存，从而降低性能。位于单词开头的通配符（例如 `*cal`）开销最大，因为基于此类通配符匹配文档需要检查索引中的所有词项。要禁用前导通配符，请将 `allow_leading_wildcard` 设置为 `false`。
:::

为提高效率，`*` 这样的纯通配符会被重写为 `exists` 查询。因此，通配符 `description: *` 会匹配 `description` 字段为空值的文档，但不会匹配缺少 `description` 字段或该字段值为 `null` 的文档。

如果将 `analyze_wildcard` 设置为 `true`，OpenSearch 会分析以 `*` 结尾的查询（例如 `hist*`）。因此，OpenSearch 会根据生成的词元（Token）构建一个布尔查询：对前 n-1 个词元进行精确匹配，对最后一个词元进行前缀匹配。

## 正则表达式

要在查询字符串中指定正则表达式模式，请用正斜杠（`/`）将其括起来，例如 `title: /w[a-z]nd/`。

::: warning 重要
`allow_leading_wildcard` 参数不适用于正则表达式。例如，像  `/.*d/` 这样的查询字符串会检查索引中的所有词项。 
:::

## 模糊匹配

可以使用 `~` 运算符运行模糊查询，例如 `title: rise~`。

该查询会搜索包含与搜索词项相似（在允许的最大编辑距离之内）的词项的文档。编辑距离定义为 [Damerau-Levenshtein 距离](https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance)，它衡量将一个词项变为另一个词项所需的单字符修改（插入、删除、替换或换位）次数。

默认编辑距离 2 应该可以捕获 80% 的拼写错误。要更改默认编辑距离，请在 `~` 运算符之后指定新的编辑距离。例如，要将编辑距离设置为 `1`，请使用查询 `title: rise~1`。

::: warning 重要
不要混用模糊运算符和通配符运算符。如果同时指定模糊运算符和通配符运算符，其中一个运算符将不会生效。例如，如果搜索 `wnid*~1`，通配符运算符 `*` 会生效，但模糊运算符 `~1` 不会生效。
:::

## 邻近查询

邻近查询不要求搜索短语按指定顺序出现。它允许短语中的单词以不同顺序出现，或被其他单词隔开。邻近查询指定短语中单词的最大编辑距离。例如，以下查询在匹配指定短语中的单词时允许的编辑距离为 4：

```json
GET /testindex/_search
{
 "query": {
    "query_string": {
      "query": "title: \"wind gone\"~4"
    }
  }
}
```

OpenSearch 匹配文档时，文档中单词的顺序越接近查询中指定的单词顺序（编辑距离越小），文档的相关性评分（Relevance Score）就越高。  

## 范围

要为数值、字符串或日期字段指定范围，请使用方括号（`[min TO max]`）表示包含边界的范围，使用花括号（`{min TO max}`）表示不包含边界的范围。也可以混合使用方括号和花括号来包含或排除下界和上界（例如 `{min TO max]`）。 

日期范围中的日期必须采用映射该日期字段时所用的格式。有关支持的日期格式的更多信息，请参阅[格式](/field-types/supported-field-types/date#formats)。

下表提供了范围语法示例。

数据类型 | 查询 | 查询字符串
:--- | :--- | :---
Numeric | 账号为 1 到 15（含）的文档。 | `account_number: [1 TO 15]` 或 <br> `account_number: (>=1 AND <=15)` 或 <br> `account_number: (+>=1 +<=15)`
| 账号大于或等于 15 的文档。 | `account_number: [15 TO *]` 或 <br> `account_number: >=15`（注意 `>=` 符号后没有空格）
String | 姓氏从 Bates（含）到 Duke（不含）的文档。 | `lastname: [Bates TO Duke}` 或 <br> `lastname: (>=Bates AND <Duke)`
| 姓氏按字母顺序排在 Bates 之前的文档。 | `lastname: {* TO Bates}` 或 <br> `lastname: <Bates`（注意 `<` 符号后没有空格）
Date | 发布日期在 03/21/2023 和 09/25/2023 之间（含）的文档。 | `release_date: [03/21/2023 TO 09/25/2023]`

::: tip 提示
除了在查询字符串中指定范围外，还可以使用[范围查询](/query-dsl/term/range)，它提供了更可靠的语法。
:::

## 权重提升

使用脱字符（`^`）权重提升（boost）运算符，可以按一定倍数提升文档的相关性评分。[0, 1) 范围内的值会降低相关性，大于 1 的值会提高相关性。默认值为 `1`。 

下表提供了权重提升示例。

类型 | 描述 | 查询字符串
:--- | :--- | :---
单词权重提升 | 查找所有包含单词 `street` 的地址，并提升包含单词 `Madison` 的地址的权重。 | `address: Madison^2 street`
短语权重提升 | 查找标题包含短语 `wind rises` 的文档，权重提升为 2 倍。 | `title: \"wind rises\"^2` 
| 查找标题包含单词 `wind rises` 的文档，并将包含短语 `wind rises` 的文档的权重提升为 2 倍。 | `title: (wind rises)^2`

## 布尔运算符

在查询中提供搜索词项时，默认情况下，查询会返回至少包含一个所提供词项的文档。你可以使用 `default_operator` 参数为所有词项指定运算符。因此，如果将 `default_operator` 设置为 `AND`，则所有词项都是必需的；如果将其设置为 `OR`，则所有词项都是可选的。 

### `+` 和 `-` 运算符 {#and---operators}

如果希望更精细地控制必需词项和可选词项，可以使用 `+` 和 `-` 运算符。`+` 运算符使其后的词项成为必需词项，而 `-` 运算符则排除其后的词项。

例如，查询字符串 `title: (gone +wind -turbines)` 指定在匹配文档的标题中，词项 `gone` 是可选的，词项 `wind` 必须出现，而词项 `turbines` 不能出现：

```json
GET /testindex/_search
{
 "query": {
    "query_string": {
      "query": "title: (gone +wind -turbines)"
    }
  }
}
```

该查询返回两个匹配的文档：

```json
{
  "_index": "testindex",
  "_id": "2",
  "_score": 1.3159468,
  "_source": {
    "title": "Gone with the wind",
    "description": "A 1939 American epic historical film"
  }
},
{
  "_index": "testindex",
  "_id": "1",
  "_score": 0.3438858,
  "_source": {
    "title": "The wind rises"
  }
}
```

上述查询等价于以下布尔查询：

```json
GET testindex/_search
{
  "query": {
    "bool": {
      "must": {
        "match": {
          "title": "wind"
        }
      },
      "should": {
        "match": {
          "title": "gone"
        }
      },
      "must_not": {
        "match": {
          "title": "turbines"
        }
      }
    }
  }
}
```

### 传统布尔运算符

或者，也可以使用以下布尔运算符：`AND`、`&&`、`OR`、`||`、`NOT`、`!`。但是，这些运算符不遵循优先级规则，因此在使用多个布尔运算符时，必须使用括号来指定优先级。例如，查询字符串 `title: (gone +wind -turbines)` 可以使用布尔运算符改写为：

`title: ((gone AND wind) OR wind) AND NOT turbines`

运行以下包含改写后查询字符串的查询：

```json
GET testindex/_search
{
 "query": {
    "query_string": {
      "query": "title: ((gone AND wind) OR wind) AND NOT turbines"
    }
  }
}
```

该查询返回的结果与使用 `+` 和 `-` 运算符的查询相同。但请注意，匹配文档的相关性评分与之前的结果不同：

```json
{
  "_index": "testindex",
  "_id": "2",
  "_score": 1.6166971,
  "_source": {
    "title": "Gone with the wind",
    "description": "A 1939 American epic historical film"
  }
},
{
  "_index": "testindex",
  "_id": "1",
  "_score": 0.3438858,
  "_source": {
    "title": "The wind rises"
  }
}
```

### 分组

使用括号将多个子句或词项分组为子查询。例如，以下查询搜索标题中包含单词 `gone` 或 `rises`、且必须包含单词 `wind` 的文档：

```json
GET testindex/_search
{
 "query": {
    "query_string": {
      "query": "title: (gone OR rises) AND wind"
    }
  }
}
```

结果中包含两个匹配的文档：

```json
{
  "_index": "testindex",
  "_id": "1",
  "_score": 1.5046883,
  "_source": {
    "title": "The wind rises"
  }
},
{
  "_index": "testindex",
  "_id": "2",
  "_score": 1.3159468,
  "_source": {
    "title": "Gone with the wind",
    "description": "A 1939 American epic historical film"
  }
}
```

还可以使用分组来提升子查询结果的权重或指定目标字段，例如 `title:(gone AND wind) description:(historical film)^2`。

## 搜索多个字段

要搜索多个字段，请使用 `fields` 参数。提供 `fields` 参数时，查询会被重写为 `field_1: query OR field_2: query ...`。 

例如，以下查询在 `title` 和 `description` 字段中搜索词项 `wind` 或 `film`：

```json
GET testindex/_search
{
  "query": {
    "query_string": {
      "fields": [ "title", "description" ],
      "query": "wind AND film"
    }
  }
}
```

上述查询等价于以下未提供 `fields` 参数的查询：

```json
GET testindex/_search
{
  "query": {
    "query_string": {
      "query": "(title:wind OR description:wind) AND (title:film OR description:film)"
    }
  }
}
```

### 搜索字段的多个子字段

要搜索某个字段的所有内部字段，可以使用通配符。例如，要搜索 `address` 字段中的所有子字段，请使用以下查询：

```json
GET /testindex/_search
{
  "query": {
    "query_string" : {
      "fields" : ["address.*"],
      "query" : "New AND (York OR Jersey)"
    }
  }
}
```

上述查询等价于以下未提供 `fields` 参数的查询（注意 `*` 使用 `\\` 进行了转义）：

```json
GET /testindex/_search
{
  "query": {
    "query_string" : {
      "query" : "address.\\*: New AND (York OR Jersey)"
    }
  }
}
```

### 权重提升 {#boosting-1}

由每个搜索词项生成的子查询会通过带有 `tie_breaker` 的 [`dis_max` 查询](/query-dsl/compound/disjunction-max)组合起来。要提升单个字段的权重，请使用 `^` 运算符。例如，以下查询将 `title` 字段的权重提升为 2 倍：

```json
GET testindex/_search
{
  "query": {
    "query_string": {
      "fields": [ "title^2", "description" ],
      "query": "wind AND film"
    }
  }
}
```

要提升某个字段所有子字段的权重，请在通配符之后指定权重提升运算符：

```json
GET /testindex/_search
{
  "query": {
    "query_string" : {
      "fields" : ["work_address", "address.*^2"],
      "query" : "New AND (York OR Jersey)"
    }
  }
}
```

### 多字段搜索参数

搜索多个字段时，可以向 `query_string` 查询传递额外的可选参数 `type`。 

参数 | 数据类型 | 描述
:--- | :--- | :---
`type` | String | 决定 OpenSearch 如何执行查询并为结果评分。有效值为 `best_fields`、`bool_prefix`、`most_fields`、`cross_fields`、`phrase` 和 `phrase_prefix`。默认值为 `best_fields`。有关各有效值的说明，请参阅 [Multi-match 查询类型](/query-dsl/full-text/multi-match#multi-match-query-types)。 

## `query_string` 查询中的同义词 {#synonyms-in-the-querystring-query}

`query_string` 查询支持通过 `synonym_graph` 词元过滤器（Token Filter）进行多词项同义词扩展。如果使用 `synonym_graph` 词元过滤器，OpenSearch 会为每个同义词创建一个 [match phrase 查询](/query-dsl/full-text/match-phrase)。 

`auto_generate_synonyms_phrase_query` 参数指定是否为多词项同义词自动创建 match phrase 查询。默认情况下，`auto_generate_synonyms_phrase_query` 为 `true`，因此如果将 `ml, machine learning` 指定为同义词并搜索 `ml`，OpenSearch 会搜索 `ml OR "machine learning"`。 

或者，也可以使用合取（AND）方式匹配多词项同义词。如果将 `auto_generate_synonyms_phrase_query` 设置为 `false`，OpenSearch 会搜索 `ml OR (machine AND learning)`。 

例如，以下查询搜索文本 `ml models`，并指定不为每个同义词自动生成 match phrase 查询：

```json
GET /testindex/_search
{
  "query": {
    "query_string": {
      "default_field": "title",
      "query": "ml models",
      "auto_generate_synonyms_phrase_query": false
    }
  }
}
```

对于该查询，OpenSearch 会创建以下布尔查询：`(ml OR (machine AND learning)) models`。

## 最少应匹配数

`query_string` 查询会以每个运算符为界拆分查询，并为整个输入创建一个布尔查询。[`minimum_should_match` 参数](/query-dsl/minimum-should-match)指定文档在搜索结果中返回所必须匹配的最少词项数。例如，以下查询指定每个搜索结果的 `description` 字段必须至少匹配两个词项：

```json
GET /testindex/_search
{
  "query": {
    "query_string": {
      "fields": [
        "description"
      ],
      "query": "historical epic film",
      "minimum_should_match": 2
    }
  }
}
```

对于该查询，OpenSearch 会创建以下布尔查询：`(description:historical description:epic description:film)~2`。

### 多字段的最少应匹配数

如果在 `query_string` 查询中指定了多个字段，OpenSearch 会为指定的字段创建一个 [`dis_max` 查询](/query-dsl/compound/disjunction-max)。如果没有为查询词项显式指定运算符，整个查询文本会被视为一个子句。OpenSearch 使用这个单一子句为每个字段构建查询。最终的布尔查询只包含一个与所有字段的 `dis_max` 查询相对应的子句，因此不会应用 `minimum_should_match` 参数。

例如，在以下查询中，`historical epic heroic` 被视为单个子句：

```json
GET /testindex/_search
{
  "query": {
    "query_string": {
      "fields": [
        "title",
        "description"
      ],
      "query": "historical epic heroic",
      "minimum_should_match": 2
    }
  }
}
```

对于该查询，OpenSearch 会创建以下布尔查询：`((title:historical title:epic title:heroic) | (description:historical description:epic description:heroic))`。

如果为查询词项添加显式运算符（`AND` 或 `OR`），每个词项都会被视为一个单独的子句，`minimum_should_match` 参数可以应用于这些子句。例如，在以下查询中，`historical`、`epic` 和 `heroic` 被视为单独的子句：

```json
GET /testindex/_search
{
  "query": {
    "query_string": {
      "fields": [
        "title",
        "description"
      ],
      "query": "historical OR epic OR heroic",
      "minimum_should_match": 2
    }
  }
}
```

对于该查询，OpenSearch 会创建以下布尔查询：`((title:historical | description:historical) (description:epic | title:epic) (description:heroic | title:heroic))~2`。该查询至少匹配三个子句中的两个。每个子句表示针对一个词项在 `title` 和 `description` 两个字段上的 `dis_max` 查询。

或者，为了确保可以应用 `minimum_should_match`，可以将 `type` 参数设置为 `cross_fields`。这表示在分析输入文本时，具有相同分析器（Analyzer）的字段应分为一组：

```json
GET /testindex/_search
{
  "query": {
    "query_string": {
      "fields": [
        "title",
        "description"
      ],
      "query": "historical epic heroic",
      "type": "cross_fields",
      "minimum_should_match": 2
    }
  }
}
```

对于该查询，OpenSearch 会创建以下布尔查询：`((title:historical | description:historical) (description:epic | title:epic) (description:heroic | title:heroic))~2`。 

但是，如果使用不同的分析器，则必须在查询中使用显式运算符，以确保 `minimum_should_match` 参数应用于每个词项。

## 参数

下表列出了 `query_string` 查询支持的参数。除 `query` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`query` | String | 用于搜索的文本，可以包含采用 [query string 语法](#query-string-syntax)的表达式。必需。
`allow_leading_wildcard` | Boolean | 指定是否允许 `*` 和 `?` 作为搜索词项的首字符。默认值为 `true`。
`analyze_wildcard` | Boolean | 指定 OpenSearch 是否应尝试分析通配符词项。默认值为 `false`。
`analyzer` | String | 用于对查询字符串文本进行分词的[分析器](/analyzers/)。默认值为 `default_field` 指定的索引时分析器。如果没有为 `default_field` 指定分析器，则 `analyzer` 为该索引的默认分析器。
`auto_generate_synonyms_phrase_query` | Boolean | 指定是否为多词项同义词自动创建 [match phrase 查询](/query-dsl/full-text/match-phrase)。例如，如果将 `ba, batting average` 指定为同义词并搜索 `ba`，OpenSearch 会搜索 `ba OR "batting average"`（如果此选项为 `true`）或 `ba OR (batting AND average)`（如果此选项为 `false`）。默认值为 `true`。
`boost` | Floating-point | 按给定的倍数提升该子句的权重。适用于在复合查询中为各子句设置权重。[0, 1) 范围内的值会降低相关性，大于 1 的值会提高相关性。默认值为 `1`。 
`default_field` | String | 查询字符串中未指定字段时要搜索的字段。支持通配符。默认为 `index.query. Default_field` 索引设置中指定的值。默认情况下，`index.query. Default_field` 为 `*`，表示提取所有适用于词项查询的字段，并过滤掉元数据字段。如果未指定 `prefix`，提取出的字段会组合成一个查询。适用的字段不包括嵌套文档。搜索所有适用字段可能是一项资源密集型操作。`indices.query.bool.max_clause_count` 搜索设置定义了一次可查询的字段数与词项数之积的最大值。`indices.query.bool.max_clause_count` 的默认值为 1,024。
`default_operator`| String | 如果查询字符串包含多个搜索词项，该参数指定文档被视为匹配时是需要所有词项都匹配（`AND`），还是只需一个词项匹配（`OR`）。有效值为：<br>- `OR`：字符串 `to be` 被解释为 `to OR be`<br>- `AND`：字符串 `to be` 被解释为 `to AND be`<br> 默认值为 `OR`。
`enable_position_increments` | Boolean | 为 `true` 时，生成的查询会感知位置增量。当移除停用词在词项之间留下不需要的“间隙”时，此设置很有用。默认值为 `true`。
`fields` | String array | 要搜索的字段列表（例如 `"fields": ["title^4", "description"]`）。支持通配符。如果未指定，则默认使用 `index.query. Default_field` 设置，该设置的默认值为 `["*"]`。
`fuzziness` | String | 在判断某个词项是否与某个值匹配时，将一个单词变为另一个单词所需的字符编辑（插入、删除、替换）次数。例如，`wined` 与 `wind` 之间的距离为 1。有效值为非负整数或 `AUTO`。默认值 `AUTO` 会根据每个词项的长度选择一个值，适用于大多数场景。
`fuzzy_max_expansions` | Positive integer | 查询最多可以扩展到的词项数。模糊查询会“扩展到”在 `fuzziness` 指定距离内的若干个匹配词项，然后 OpenSearch 尝试匹配这些词项。默认值为 `50`。
`fuzzy_transpositions` | Boolean | 将 `fuzzy_transpositions` 设置为 `true`（默认值）时，会在 `fuzziness` 选项的插入、删除和替换操作之外，增加相邻字符的交换操作。例如，如果 `fuzzy_transpositions` 为 true（交换“n”和“i”），`wind` 与 `wnid` 之间的距离为 1；如果为 false（删除“n”，再插入“n”），距离为 2。如果 `fuzzy_transpositions` 为 false，`rewind` 和 `wnid` 与 `wind` 的距离相同（均为 2），尽管从人的角度来看，`wnid` 显然只是一个拼写错误。默认值适用于大多数场景。
`lenient` | Boolean | 将 `lenient` 设置为 `true` 会忽略查询与文档字段之间的数据类型不匹配。例如，查询字符串 `"8.2"` 可以匹配 `float` 类型的字段。默认值为 `false`。
`max_determinized_states` | Positive integer | 对于包含正则表达式的查询字符串（例如 `"query": "/wind.+?/"`），Lucene 可以创建的“[状态](https://lucene.apache.org/core/8_9_0/core/org/apache/lucene/util/automaton/Operations.html#DEFAULT_MAX_DETERMINIZED_STATES)”（一种复杂度度量）的最大数量。数值越大，允许查询使用的内存越多。默认值为 10,000。
`minimum_should_match` | Positive or negative integer, positive or negative percentage, combination | 如果查询字符串包含多个搜索词项并且使用 `or` 运算符，该参数指定文档被视为匹配时需要匹配的词项数。例如，如果 `minimum_should_match` 为 2，则 `wind often rising` 与 `The Wind Rises.` 不匹配；如果 `minimum_should_match` 为 `1`，则二者匹配。有关详细信息，请参阅 [Minimum should match](/query-dsl/minimum-should-match)。
`phrase_slop` | Integer | 匹配的单词之间允许出现的最大单词数。如果 `phrase_slop` 为 2，则短语中匹配的单词之间最多允许出现两个单词。换位的单词的 slop 为 2。默认值为 `0`（精确短语匹配，匹配的单词必须彼此相邻）。
`quote_analyzer` | String | 用于对查询字符串中带引号的文本进行分词的分析器。对于带引号的文本，该参数会覆盖 `analyzer` 参数。默认值为 `default_field` 指定的 `search_quote_analyzer`。 
`quote_field_suffix` | String | 此选项支持使用与非精确匹配不同的分析方法来搜索精确匹配（用引号括起来）。例如，如果 `quote_field_suffix` 为 `.exact`，并且在 `title` 字段中搜索 `\"lightly\"`，OpenSearch 会在 `title.exact` 字段中搜索单词 `lightly`。第二个字段可能使用不同的类型（例如 `keyword` 而不是 `text`）或不同的分析器。  
`rewrite` | String | 决定 OpenSearch 如何重写多词项查询并为其评分。有效值为 `constant_score`、`scoring_boolean`、`constant_score_boolean`、`top_terms_N`、`top_terms_boost_N` 和 `top_terms_blended_freqs_N`。默认值为 `constant_score`。
`time_zone` | String | 指定目标时区相对于 `UTC` 偏移的小时数。如果查询字符串包含日期范围，则需要指明时区偏移量。例如，对于包含日期范围的查询（如 `"query": "wind rises release_date[2012-01-01 TO 2014-01-01]"`），可设置 `time_zone": "-08:00"`。用于指定偏移小时数的默认时区格式为 `UTC`。

::: warning 重要
Query string 查询可能会在内部转换为[前缀查询](/query-dsl/term/prefix)。如果 [`search.allow_expensive_queries`](/query-dsl/#expensive-queries) 设置为 `false`，则不会执行前缀查询。如果启用了 `index_prefixes`，则会忽略 `search.allow_expensive_queries` 设置，并构建和执行优化后的查询。
:::
