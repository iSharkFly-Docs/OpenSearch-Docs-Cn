---
title: 全文搜索
---

# 全文搜索

使用 SQL 命令进行全文搜索。SQL 插件（plugin）支持 OpenSearch 中可用的全文查询（full-text query）的一个子集。

要了解 OpenSearch 中的全文查询，请参阅[全文查询](/query-dsl/full-text/)。

## Match

使用 `MATCH` 函数（function）搜索在指定字段（Field）中与 `string`、`number`、`date` 或 `boolean` 值匹配的文档（Document）。

### 语法

```sql
match(field_expression, query_expression[, option=<option_value>]*)
```

可以按任意顺序指定以下选项：

- `analyzer`
- `auto_generate_synonyms_phrase`
- `fuzziness`
- `max_expansions`
- `prefix_length`
- `fuzzy_transpositions`
- `fuzzy_rewrite`
- `lenient`
- `operator`
- `minimum_should_match`
- `zero_terms_query`
- `boost`

有关参数说明和支持的值，请参阅 `match` 查询[文档](/query-dsl/full-text/match)。

### 示例 1：在 `message` 字段中搜索文本 "this is a test"：

```json
GET my_index/_search
{
  "query": {
    "match": {
      "message": "this is a test"
    }
  }
}
```

*SQL 查询：*
```sql
SELECT message FROM my_index WHERE match(message, "this is a test")
```
*PPL 查询：*
```ppl
SOURCE=my_index | WHERE match(message, "this is a test") | FIELDS message
```

### 示例 2：使用 `operator` 参数搜索 `message` 字段：

```json
GET my_index/_search
{
  "query": {
    "match": {
      "message": {
        "query": "this is a test",
        "operator": "and"
      }
    }
  }
}
```

*SQL 查询：*
```sql
SELECT message FROM my_index WHERE match(message, "this is a test", operator='and')
```
*PPL 查询：*
```ppl
SOURCE=my_index | WHERE match(message, "this is a test", operator='and') | FIELDS message
```

### 示例 3：使用 `operator` 和 `zero_terms_query` 参数搜索 `message` 字段：

```json
GET my_index/_search
{
  "query": {
    "match": {
      "message": {
        "query": "to be or not to be",
        "operator": "and",
        "zero_terms_query": "all"
      }
    }
  }
}
```

*SQL 查询：*
```sql
SELECT message FROM my_index WHERE match(message, "this is a test", operator='and', zero_terms_query='all')
```
*PPL 查询：*
```sql
SOURCE=my_index | WHERE match(message, "this is a test", operator='and', zero_terms_query='all') | FIELDS message
```

## Multi-match

要在多个字段中搜索文本，请使用 `MULTI_MATCH` 函数。该函数对应于搜索引擎中使用的 `multi_match` 查询，返回在一个或多个指定字段中与所提供的文本、数字、日期或布尔值匹配的文档。

### 语法 {#syntax-1}

`MULTI_MATCH` 函数使用 **^** 字符对特定字段进行*权重提升*（boost）。权重提升是一种乘数，使某个字段中的匹配比其他字段中的匹配具有更高的权重。语法支持使用双引号、单引号、反引号或不加任何引号来指定字段。使用星号 ``"*"`` 搜索所有字段。星号必须加引号。

```sql
multi_match([field_expression+], query_expression[, option=<option_value>]*)
```

权重是可选的，在字段名之后指定。它可以用 `caret` 字符 `^` 或空白字符分隔。请参考以下示例：

```sql
multi_match(["Tags" ^ 2, 'Title' 3.4, `Body`, Comments ^ 0.3], ...)
multi_match(["*"], ...)
```

可以按任意顺序为 `MULTI_MATCH` 指定以下选项：

- `analyzer`
- `auto_generate_synonyms_phrase`
- `cutoff_frequency`
- `fuzziness`
- `fuzzy_transpositions`
- `lenient`
- `max_expansions`
- `minimum_should_match`
- `operator`
- `prefix_length`
- `tie_breaker`
- `type`
- `slop`
- `zero_terms_query`
- `boost`

有关参数说明和支持的值，请参阅 `multi_match` 查询[文档](/query-dsl/full-text/multi-match)。

### 例如，通过 REST API 在 `firstname` 或 `lastname` 字段中搜索 `Dale`：

```json
GET accounts/_search
{
  "query": {
    "multi_match": {
      "query": "Lane Street",
      "fields": [ "address" ],
    }
  }
}
```
可以在 *SQL* 中使用 `multi_match` 函数调用
```sql
SELECT firstname, lastname
FROM accounts
WHERE multi_match(['*name'], 'Dale')
```
或使用 `multi_match` *PPL* 函数调用
```sql
SOURCE=accounts | WHERE multi_match(['*name'], 'Dale') | fields firstname, lastname
```

| firstname | lastname
:--- | :---
Dale | Adams

## Query string

要根据运算符拆分文本，请使用 `QUERY_STRING` 函数。`QUERY_STRING` 函数支持逻辑连接词、通配符、正则表达式和邻近搜索。
该函数对应于搜索引擎中使用的 `query_string` 查询，返回在一个或多个指定字段中与所提供的文本、数字、日期或布尔值匹配的文档。

### 语法 {#syntax-2}

`QUERY_STRING` 函数的语法与 `MATCH_QUERY` 类似，并使用 **^** 字符对特定字段进行*权重提升*。权重提升是一种乘数，使某个字段中的匹配比其他字段中的匹配具有更高的权重。语法支持使用双引号、单引号、反引号或不加任何引号来指定字段。使用星号 ``"*"`` 搜索所有字段。星号必须加引号。

```sql
query_string([field_expression+], query_expression[, option=<option_value>]*)
```

权重是可选的，在字段名之后指定。它可以用 `caret` 字符 `^` 或空白字符分隔。请参考以下示例：

```sql
query_string(["Tags" ^ 2, 'Title' 3.4, `Body`, Comments ^ 0.3], ...)
query_string(["*"], ...)
```

可以按任意顺序为 `QUERY_STRING` 指定以下选项：

- `analyzer`
- `allow_leading_wildcard`
- `analyze_wildcard`
- `auto_generate_synonyms_phrase_query`
- `boost`
- `default_operator`
- `enable_position_increments`
- `fuzziness`
- `fuzzy_rewrite`
- `escape`
- `fuzzy_max_expansions`
- `fuzzy_prefix_length`
- `fuzzy_transpositions`
- `lenient`
- `max_determinized_states`
- `minimum_should_match`
- `quote_analyzer`
- `phrase_slop`
- `quote_field_suffix`
- `rewrite`
- `type`
- `tie_breaker`
- `time_zone`

有关参数说明和支持的值，请参阅 `query_string` 查询[文档](/query-dsl/full-text/query-string)。

### 在 SQL 和 PPL 查询中使用 `query_string` 的示例： {#example-of-using-querystring-in-sql-and-ppl-queries}

以下 REST API 搜索请求

```json
GET accounts/_search
{
  "query": {
    "query_string": {
      "query": "Lane Street",
      "fields": [ "address" ],
    }
  }
}
```

可以在 *SQL* 中调用

```sql
SELECT account_number, address
FROM accounts
WHERE query_string(['address'], 'Lane Street', default_operator='OR')
```

或在 *PPL* 中调用

```sql
SOURCE=accounts | WHERE query_string(['address'], 'Lane Street', default_operator='OR') | fields account_number, address
```

| account_number | address
:--- | :---
1 | 880 Holmes Lane
6 | 671 Bristol Street
13 | 789 Madison Street

## Match phrase

要搜索精确短语，请使用 `MATCHPHRASE` 或 `MATCH_PHRASE` 函数。

### 语法 {#syntax-3}

```sql
matchphrasequery(field_expression, query_expression)
matchphrase(field_expression, query_expression[, option=<option_value>]*)
match_phrase(field_expression, query_expression[, option=<option_value>]*)
```

`MATCHPHRASE`/`MATCH_PHRASE` 函数允许按任意顺序指定以下选项：

- `analyzer`
- `slop`
- `zero_terms_query`
- `boost`

有关参数说明和支持的值，请参阅 `match_phrase` 查询[文档](/query-dsl/full-text/match-phrase)。

### 在 SQL 和 PPL 查询中使用 `match_phrase` 的示例： {#example-of-using-matchphrase-in-sql-and-ppl-queries}

以下 REST API 搜索请求
```json
GET accounts/_search
{
  "query": {
    "match_phrase": {
      "address": {
        "query": "880 Holmes Lane"
      }
    }
  }
}
```
可以在 *SQL* 中调用
```sql
SELECT account_number, address
FROM accounts
WHERE match_phrase(address, '880 Holmes Lane')
```
或在 *PPL* 中调用
```sql
SOURCE=accounts | WHERE match_phrase(address, '880 Holmes Lane') | FIELDS account_number, address
```

| account_number | address
:--- | :---
1 | 880 Holmes Lane

## Simple query string

`simple_query_string` 函数对应于 OpenSearch 中的 `simple_query_string` 查询。它返回在一个或多个指定字段中与所提供的文本、数字、日期或布尔值匹配的文档。
使用 **^** 可以对特定字段进行*权重提升*。权重提升是一种乘数，使某个字段中的匹配比其他字段中的匹配具有更高的权重。

### 语法 {#syntax-4}

语法支持使用双引号、单引号、反引号或不加任何引号来指定字段。使用星号 ``"*"`` 搜索所有字段。星号必须加引号。

```sql
simple_query_string([field_expression+], query_expression[, option=<option_value>]*)
```

权重是可选的，在字段名之后指定。它可以用 `caret` 字符 `^` 或空白字符分隔。请参考以下示例：

```sql
simple_query_string(["Tags" ^ 2, 'Title' 3.4, `Body`, Comments ^ 0.3], ...)
simple_query_string(["*"], ...)
```

可以按任意顺序为 `SIMPLE_QUERY_STRING` 指定以下选项：

- `analyze_wildcard`
- `analyzer`
- `auto_generate_synonyms_phrase_query`
- `boost`
- `default_operator`
- `flags`
- `fuzzy_max_expansions`
- `fuzzy_prefix_length`
- `fuzzy_transpositions`
- `lenient`
- `minimum_should_match`
- `quote_field_suffix`

有关参数说明和支持的值，请参阅 `simple_query_string` 查询[文档](/query-dsl/full-text/simple-query-string)。

### 在 SQL 和 PPL 查询中使用 `simple_query_string` 的*示例*：

以下 REST API 搜索请求
```json
GET accounts/_search
{
  "query": {
    "simple_query_string": {
      "query": "Lane Street",
      "fields": [ "address" ],
    }
  }
}
```
可以在 *SQL* 中调用
```sql
SELECT account_number, address
FROM accounts
WHERE simple_query_string(['address'], 'Lane Street', default_operator='OR')
```
或在 *PPL* 中调用
```sql
SOURCE=accounts | WHERE simple_query_string(['address'], 'Lane Street', default_operator='OR') | fields account_number, address
```

| account_number | address
:--- | :---
1 | 880 Holmes Lane
6 | 671 Bristol Street
13 | 789 Madison Street

## Match phrase prefix

要按给定前缀搜索短语，请使用 `MATCH_PHRASE_PREFIX` 函数，它会将查询字符串中的最后一个词项构造为前缀查询。

### 语法 {#syntax-5}

```sql
match_phrase_prefix(field_expression, query_expression[, option=<option_value>]*)
```

`MATCH_PHRASE_PREFIX` 函数允许按任意顺序指定以下选项：

- `analyzer`
- `slop`
- `max_expansions`
- `zero_terms_query`
- `boost`

有关参数说明和支持的值，请参阅 `match_phrase_prefix` 查询[文档](/query-dsl/full-text/match-phrase-prefix)。

### 在 SQL 和 PPL 查询中使用 `match_phrase_prefix` 的*示例*：

以下 REST API 搜索请求
```json
GET accounts/_search
{
  "query": {
    "match_phrase_prefix": {
      "author": {
        "query": "Alexander Mil"
      }
    }
  }
}
```
可以在 *SQL* 中调用
```sql
SELECT author, title
FROM books
WHERE match_phrase_prefix(author, 'Alexander Mil')
```
或在 *PPL* 中调用
```sql
source=books | where match_phrase_prefix(author, 'Alexander Mil') | fields author, title
```

| author | title
:--- | :---
Alan Alexander Milne | The House at Pooh Corner
Alan Alexander Milne | Winnie-the-Pooh

## Match boolean prefix

使用 `match_bool_prefix` 函数搜索仅在指定字段前缀上与文本匹配的文档。

### 语法 {#syntax-6}

```sql
match_bool_prefix(field_expression, query_expression[, option=<option_value>]*)
```

`MATCH_BOOL_PREFIX` 函数允许按任意顺序指定以下选项：

- `minimum_should_match`
- `fuzziness`
- `prefix_length`
- `max_expansions`
- `fuzzy_transpositions`
- `fuzzy_rewrite`
- `boost`
- `analyzer`
- `operator`

有关参数说明和支持的值，请参阅 `match_bool_prefix` 查询[文档](/query-dsl/full-text/match-bool-prefix)。

### 在 SQL 和 PPL 查询中使用 `match_bool_prefix` 的示例：

以下 REST API 搜索请求
```json
GET accounts/_search
{
  "query": {
    "match_bool_prefix": {
      "address": {
        "query": "Bristol Stre"
      }
    }
  }
}
```
可以在 *SQL* 中调用
```sql
SELECT firstname, address
FROM accounts
WHERE match_bool_prefix(address, 'Bristol Stre')
```
或在 *PPL* 中调用
```sql
source=accounts | where match_bool_prefix(address, 'Bristol Stre') | fields firstname, address
```

| firstname | address
:--- | :---
Hattie | 671 Bristol Street
Nanette | 789 Madison Street
