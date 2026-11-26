---
title: 函数
---

# 函数

SQL 语言支持 SQL 插件的所有[通用函数](/search-plugins/sql/functions)，包括[相关性搜索](/search-plugins/sql/full-text)函数，此外还引入了几个仅在 SQL 中可用的函数同义词。
这些同义词由 `V1` 引擎提供。更多信息请参阅[限制](/search-plugins/sql/limitation)。

## Match 查询

`MATCHQUERY` 和 `MATCH_QUERY` 函数是 [`MATCH`](/search-plugins/sql/full-text#match) 相关性函数的同义词。它们不接受额外的参数，只是提供了另一种语法。

### 语法

要使用 `matchquery` 或 `match_query`，请传入搜索查询以及要搜索的字段名称：

```sql
match_query(field_expression, query_expression[, option=<option_value>]*)
matchquery(field_expression, query_expression[, option=<option_value>]*)
field_expression = match_query(query_expression[, option=<option_value>]*)
field_expression = matchquery(query_expression[, option=<option_value>]*)
```

可以按任意顺序指定以下选项：

- `analyzer`
- `boost`

### 示例

可以使用 `MATCHQUERY` 代替 `MATCH`：

```sql
SELECT account_number, address
FROM accounts
WHERE MATCHQUERY(address, 'Holmes')
```

也可以使用 `MATCH_QUERY` 代替 `MATCH`：

```sql
SELECT account_number, address
FROM accounts
WHERE address = MATCH_QUERY('Holmes')
```

结果包含地址中含有“Holmes”的文档：

| account_number | address
:--- | :---
1 | 880 Holmes Lane

## Multi-match

[`MULTI_MATCH`](/search-plugins/sql/full-text#multi-match) 有三个同义词，语法略有不同。它们接受一个查询字符串和一个带权重的字段列表，还可以接受其他可选参数。

### 语法 {#syntax-1}

```sql
multimatch('query'=query_expression[, 'fields'=field_expression][, option=<option_value>]*)
multi_match('query'=query_expression[, 'fields'=field_expression][, option=<option_value>]*)
multimatchquery('query'=query_expression[, 'fields'=field_expression][, option=<option_value>]*)
```

`fields` 参数是可选的，可以包含单个字段或逗号分隔的字段列表（不允许包含空白字符）。每个字段的权重是可选的，在字段名称之后指定，用 `caret` 字符（`^`）分隔，中间不能有空白。 

### 示例 {#example-1}

以下查询展示了 multi-match 查询的 `fields` 参数分别使用单个字段和字段列表的情况： 

```sql
multi_match('fields' = "Tags^2,Title^3.4,Body,Comments^0.3", ...)
multi_match('fields' = "Title", ...)
```

可以按任意顺序指定以下选项：

- `analyzer`
- `boost`
- `slop`
- `type`
- `tie_breaker`
- `operator`

## Query string

`QUERY` 函数是 [`QUERY_STRING`](/search-plugins/sql/full-text#query-string) 的同义词。

### 语法 {#syntax-2}

```sql
query('query'=query_expression[, 'fields'=field_expression][, option=<option_value>]*)
```

`fields` 参数是可选的，可以包含单个字段或逗号分隔的字段列表（不允许包含空白字符）。每个字段的权重是可选的，在字段名称之后指定，用 `caret` 字符（`^`）分隔，中间不能有空白。 

### 示例 {#example-2}

以下查询展示了 multi-match 查询的 `fields` 参数分别使用单个字段和字段列表的情况： 

```sql
query('fields' = "Tags^2,Title^3.4,Body,Comments^0.3", ...)
query('fields' = "Tags", ...)
```

可以按任意顺序指定以下选项：

- `analyzer`
- `boost`
- `slop`
- `default_field`

### 在 SQL 和 PPL 查询中使用 `query_string` 的示例： {#example-of-using-querystring-in-sql-and-ppl-queries}

下面是一个使用 OpenSearch DSL 的 REST API 搜索请求示例。

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

上述请求等价于以下 `query` 函数：

```sql
SELECT account_number, address
FROM accounts
WHERE query('address:Lane OR address:Street')
```

结果包含地址中含有“Lane”或“Street”的文档：

| account_number | address
:--- | :---
1 | 880 Holmes Lane
6 | 671 Bristol Street
13 | 789 Madison Street

## Match phrase

`MATCHPHRASEQUERY` 函数是 [`MATCH_PHRASE`](/search-plugins/sql/full-text#query-string) 的同义词。

### 语法 {#syntax-3}

```sql
matchphrasequery(query_expression, field_expression[, option=<option_value>]*)
```

可以按任意顺序指定以下选项：

- `analyzer`
- `boost`
- `slop`

## Score 查询

要在返回每个匹配文档的同时返回相关性评分（relevance score），请使用 `SCORE`、`SCOREQUERY` 或 `SCORE_QUERY` 函数。

### 语法 {#syntax-4}

`SCORE` 函数需要两个参数。第一个参数是 [`MATCH_QUERY`](#match-query) 表达式。第二个参数是可选的浮点数，用于提升评分（默认值为 1.0）：

```sql
SCORE(match_query_expression, score)
SCOREQUERY(match_query_expression, score)
SCORE_QUERY(match_query_expression, score)
```

### 示例 {#example-3}

以下示例使用 `SCORE` 函数提升文档的评分：

```sql
SELECT account_number, address, _score
FROM accounts
WHERE SCORE(MATCH_QUERY(address, 'Lane'), 0.5) OR
  SCORE(MATCH_QUERY(address, 'Street'), 100)
ORDER BY _score
```

结果包含匹配项及其对应的评分：

| account_number | address | score
:--- | :--- | :---
1 | 880 Holmes Lane | 0.5
6 | 671 Bristol Street | 100
13 | 789 Madison Street | 100

## Wildcard 查询

要按给定的通配符搜索文档，请使用 `WILDCARDQUERY` 或 `WILDCARD_QUERY` 函数。

### 语法 {#syntax-5}

```sql
wildcardquery(field_expression, query_expression[, boost=<value>])
wildcard_query(field_expression, query_expression[, boost=<value>])
```

### 示例 {#example-4}

以下示例使用通配符查询：

```sql
SELECT account_number, address
FROM accounts
WHERE wildcard_query(address, '*Holmes*');
```

结果包含与通配符表达式匹配的文档：

| account_number | address
:--- | :---
1 | 880 Holmes Lane
