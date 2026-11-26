---
title: 响应格式
---

# 响应格式

SQL 插件提供 `jdbc`、`csv`、`raw` 和 `json` 四种响应格式，分别适用于不同的用途。`jdbc` 格式使用最为广泛，因为它提供了 schema 信息，并增加了分页（pagination）等更多功能。除了 JDBC 驱动程序之外，各种客户端也都能从详细且格式规范的响应中受益。

## JDBC 格式

默认情况下，SQL 插件以标准 JDBC 格式返回响应。该格式面向 JDBC 驱动程序以及需要 schema 和结果集都格式规范的客户端。

#### 示例请求

以下查询没有指定响应格式，因此格式为 `jdbc`：

```json
POST _plugins/_sql
{
  "query" : "SELECT firstname, lastname, age FROM accounts ORDER BY age LIMIT 2"
}
```

#### 示例响应

在响应中，`schema` 包含字段名称和类型，`datarows` 字段包含结果集：

```json
{
  "schema": [{
      "name": "firstname",
      "type": "text"
    },
    {
      "name": "lastname",
      "type": "text"
    },
    {
      "name": "age",
      "type": "long"
    }
  ],
  "total": 4,
  "datarows": [
    [
      "Nanette",
      "Bates",
      28
    ],
    [
      "Amber",
      "Duke",
      32
    ]
  ],
  "size": 2,
  "status": 200
}
```

如果发生任何类型的错误，OpenSearch 会返回错误消息。

以下查询搜索一个不存在的字段 `unknown`：

```json
POST /_plugins/_sql
{
  "query" : "SELECT unknown FROM accounts"
}
```

响应中包含错误消息和错误原因：

```json
{
  "error": {
    "reason": "Invalid SQL query",
    "details": "Field [unknown] cannot be found or used here.",
    "type": "SemanticAnalysisException"
  },
  "status": 400
}
```

## OpenSearch DSL JSON 格式

如果将格式设置为 `json`，将以 JSON 格式返回 OpenSearch 的原始响应。由于这是 OpenSearch 的原生响应，需要额外处理才能解析和理解它。

#### 示例请求 {#example-request-1}

以下查询将响应格式设置为 `json`：

```json
POST _plugins/_sql?format=json
{
  "query" : "SELECT firstname, lastname, age FROM accounts ORDER BY age LIMIT 2"
}
```

#### 示例响应 {#example-response-1}

响应为 OpenSearch 的原始响应：

```json
{
  "_shards": {
    "total": 5,
    "failed": 0,
    "successful": 5,
    "skipped": 0
  },
  "hits": {
    "hits": [{
        "_index": "accounts",
        "_type": "account",
        "_source": {
          "firstname": "Nanette",
          "age": 28,
          "lastname": "Bates"
        },
        "_id": "13",
        "sort": [
          28
        ],
        "_score": null
      },
      {
        "_index": "accounts",
        "_type": "account",
        "_source": {
          "firstname": "Amber",
          "age": 32,
          "lastname": "Duke"
        },
        "_id": "1",
        "sort": [
          32
        ],
        "_score": null
      }
    ],
    "total": {
      "value": 4,
      "relation": "eq"
    },
    "max_score": null
  },
  "took": 100,
  "timed_out": false
}
```

## CSV 格式

也可以指定以 CSV 格式返回结果。 

#### 示例请求 {#example-request-2}

```json
POST /_plugins/_sql?format=csv
{
  "query" : "SELECT firstname, lastname, age FROM accounts ORDER BY age"
}
```

#### 示例响应 {#example-response-2}

```text
firstname,lastname,age
Nanette,Bates,28
Amber,Duke,32
Dale,Adams,33
Hattie,Bond,36
```
### 清理 CSV 格式的结果

默认情况下，OpenSearch 会按照以下规则清理（sanitize）表头单元格（字段名称）和数据单元格（字段内容）：

- 如果单元格以 `+`、`-`、`=` 或 `@` 开头，清理程序会在单元格开头插入一个单引号（`'`）。
- 如果单元格包含一个或多个逗号（`,`），清理程序会用双引号（`"`）将单元格括起来。

### 示例 

以下请求索引一个文档，其中的单元格以特殊字符开头或包含逗号：

```json
PUT /userdata/_doc/1?refresh=true
{
  "+firstname": "-Hattie",
  "=lastname": "@Bond",
  "address": "671 Bristol Street, Dente, TN"
}
```

可以使用下面的查询请求以 CSV 格式返回结果：

```json
POST /_plugins/_sql?format=csv
{
  "query" : "SELECT * FROM userdata"
}
```

在响应中，以特殊字符开头的单元格前面加上了 `'`，包含逗号的单元格则被引号括起来：

```text
'+firstname,'=lastname,address
'Hattie,'@Bond,"671 Bristol Street, Dente, TN"
```

要跳过清理，请将 `sanitize` 查询参数设置为 false：

```json
POST /_plugins/_sql?format=csvandsanitize=false
{
  "query" : "SELECT * FROM userdata"
}
```

响应包含原始 CSV 格式的结果：

```text
=lastname,address,+firstname
@Bond,"671 Bristol Street, Dente, TN",-Hattie
```

## Raw 格式

可以使用 raw 格式将结果通过管道传给其他命令行工具做后续处理。

#### 示例请求 {#example-request-3}

```json
POST /_plugins/_sql?format=raw
{
  "query" : "SELECT firstname, lastname, age FROM accounts ORDER BY age"
}
```

#### 示例响应 {#example-response-3}

```text
Nanette|Bates|28
Amber|Duke|32
Dale|Adams|33
Hattie|Bond|36
```

默认情况下，OpenSearch 会按照以下规则清理 `raw` 格式的结果：

- 如果数据单元格包含一个或多个管道符（`|`），清理程序会用双引号将单元格括起来。

### 示例 {#example-1}

以下请求索引一个字段中包含管道符（`|`）的文档：

```json
PUT /userdata/_doc/1?refresh=true
{
  "+firstname": "|Hattie",
  "=lastname": "Bond|",
  "|address": "671 Bristol Street| Dente| TN"
}
```

可以使用下面的查询请求以 `raw` 格式返回结果：

```json
POST /_plugins/_sql?format=raw
{
  "query" : "SELECT * FROM userdata"
}
```

查询返回的结果中，包含 `|` 字符的单元格被引号括起来：

```text
"|address"|=lastname|+firstname
"671 Bristol Street| Dente| TN"|"Bond|"|"|Hattie"
```
