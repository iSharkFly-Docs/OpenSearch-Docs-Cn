---
title: SQL 和 PPL API
---

# SQL 和 PPL API

使用 SQL 和 PPL API 向 SQL 插件发送查询。使用 `_sql` 端点发送 SQL 查询，使用 `_ppl` 端点发送 PPL 查询。对于这两种查询，都可以使用 `_explain` 端点将查询转换为 [OpenSearch 领域特定语言](/query-dsl/)（DSL），或者用来排查错误。

## 查询 API

向 SQL 插件发送 SQL/PPL 查询。可以通过查询参数指定响应格式。

### 查询参数

参数 | 数据类型 | 描述
:--- | :--- | :---
[format](/search-plugins/sql/response-formats) | String | 响应格式。`_sql` 端点支持 `jdbc`、`csv`、`raw` 和 `json` 格式。`_ppl` 端点支持 `jdbc`、`csv` 和 `raw` 格式。默认值为 `jdbc`。
sanitize | Boolean | 指定是否对结果中的特殊字符进行转义。更多信息请参阅[响应格式](/search-plugins/sql/response-formats)。默认值为 `true`。

### 请求字段

字段 | 数据类型 | 描述  
:--- | :--- | :---
query | String | 要执行的查询。必需。
[filter](#filtering-results) | JSON object | 对结果的过滤条件。可选。
[fetch_size](#paginating-results) | integer | 单个响应中返回的结果数量，用于对结果分页。默认值为 1,000。可选。仅支持 `jdbc` 响应格式。

#### 示例请求

```json
POST /_plugins/_sql 
{
  "query" : "SELECT * FROM accounts"
}
```

#### 示例响应

响应包含 schema 和结果：

```json
{
  "schema": [
    {
      "name": "account_number",
      "type": "long"
    },
    {
      "name": "firstname",
      "type": "text"
    },
    {
      "name": "address",
      "type": "text"
    },
    {
      "name": "balance",
      "type": "long"
    },
    {
      "name": "gender",
      "type": "text"
    },
    {
      "name": "city",
      "type": "text"
    },
    {
      "name": "employer",
      "type": "text"
    },
    {
      "name": "state",
      "type": "text"
    },
    {
      "name": "age",
      "type": "long"
    },
    {
      "name": "email",
      "type": "text"
    },
    {
      "name": "lastname",
      "type": "text"
    }
  ],
  "datarows": [
    [
      1,
      "Amber",
      "880 Holmes Lane",
      39225,
      "M",
      "Brogan",
      "Pyrami",
      "IL",
      32,
      "amberduke@pyrami.com",
      "Duke"
    ],
    [
      6,
      "Hattie",
      "671 Bristol Street",
      5686,
      "M",
      "Dante",
      "Netagy",
      "TN",
      36,
      "hattiebond@netagy.com",
      "Bond"
    ],
    [
      13,
      "Nanette",
      "789 Madison Street",
      32838,
      "F",
      "Nogal",
      "Quility",
      "VA",
      28,
      "nanettebates@quility.com",
      "Bates"
    ],
    [
      18,
      "Dale",
      "467 Hutchinson Court",
      4180,
      "M",
      "Orick",
      null,
      "MD",
      33,
      "daleadams@boink.com",
      "Adams"
    ]
  ],
  "total": 4,
  "size": 4,
  "status": 200
}
```

### 响应字段

字段 | 数据类型 | 描述  
:--- | :--- | :---
schema | Array | 指定所有字段的名称和类型。 
data_rows | 2D array | 结果数组。每个结果表示一个匹配的行（文档）。
total | Integer | 索引中行（文档）的总数。
size | Integer | 单个响应中返回的结果数量。
status | String | OpenSearch 运行查询后返回的 HTTP 响应状态。

## Explain API

SQL 插件提供 `explain` 功能，用于展示查询在 OpenSearch 上是如何执行的，这对于调试和开发很有帮助。向 `_plugins/_sql/_explain` 或 `_plugins/_ppl/_explain` 端点发送 POST 请求，会返回 JSON 格式的 [OpenSearch 领域特定语言](/query-dsl/)（DSL）来解释该查询。
可以在命令行中使用 `curl` 执行 explain API 操作，也可以像下面的示例那样在 Dashboards 控制台中执行。 

#### SQL 查询的 explain 请求示例

```json
POST _plugins/_sql/_explain
{
  "query": "SELECT firstname, lastname FROM accounts WHERE age > 20"
}
```

#### SQL 查询的 explain 响应示例

```json
{
  "root": {
    "name": "ProjectOperator",
    "description": {
      "fields": "[firstname, lastname]"
    },
    "children": [
      {
        "name": "OpenSearchIndexScan",
        "description": {
          "request": """OpenSearchQueryRequest(indexName=accounts, sourceBuilder={"from":0,"size":200,"timeout":"1m","query":{"range":{"age":{"from":20,"to":null,"include_lower":false,"include_upper":true,"boost":1.0}}},"_source":{"includes":["firstname","lastname"],"excludes":[]},"sort":[{"_doc":{"order":"asc"}}]}, searchDone=false)"""
        },
        "children": []
      }
    ]
  }
}
```

#### PPL 查询的 explain 请求示例

```json
POST _plugins/_ppl/_explain
{
  "query" : "source=accounts | fields firstname, lastname"
}
```

#### PPL 查询的 explain 响应示例

```json
{
  "root": {
    "name": "ProjectOperator",
    "description": {
      "fields": "[firstname, lastname]"
    },
    "children": [
      {
        "name": "OpenSearchIndexScan",
        "description": {
          "request": """OpenSearchQueryRequest(indexName=accounts, sourceBuilder={"from":0,"size":200,"timeout":"1m","_source":{"includes":["firstname","lastname"],"excludes":[]}}, searchDone=false)"""
        },
        "children": []
      }
    ]
  }
}
```

对于需要后处理的查询，`explain` 响应除了 OpenSearch DSL 之外还包含查询计划。对于不需要后处理的查询，可以看到完整的 DSL。

## 结果分页

要获取分页响应，请使用 `fetch_size` 参数。`fetch_size` 的值应大于 0，默认值为 1,000。值为 0 时将回退为不分页的响应。

::: info 注意
`fetch_size` 参数仅支持 `jdbc` 响应格式。
:::

### 示例

以下请求包含一个 SQL 查询，并指定每次返回五个结果：

```json
POST _plugins/_sql/
{
  "fetch_size" : 5,
  "query" : "SELECT firstname, lastname FROM accounts WHERE age > 20 ORDER BY state ASC"
}
```

响应包含不带 `fetch_size` 的查询会返回的所有字段，此外还有一个 `cursor` 字段，用于获取后续各页结果：

```json
{
  "schema": [
    {
      "name": "firstname",
      "type": "text"
    },
    {
      "name": "lastname",
      "type": "text"
    }
  ],
  "cursor": "d:eyJhIjp7fSwicyI6IkRYRjFaWEo1UVc1a1JtVjBZMmdCQUFBQUFBQUFBQU1XZWpkdFRFRkZUMlpTZEZkeFdsWnJkRlZoYnpaeVVRPT0iLCJjIjpbeyJuYW1lIjoiZmlyc3RuYW1lIiwidHlwZSI6InRleHQifSx7Im5hbWUiOiJsYXN0bmFtZSIsInR5cGUiOiJ0ZXh0In1dLCJmIjo1LCJpIjoiYWNjb3VudHMiLCJsIjo5NTF9",
  "total": 956,
  "datarows": [
    [
      "Cherry",
      "Carey"
    ],
    [
      "Lindsey",
      "Hawkins"
    ],
    [
      "Sargent",
      "Powers"
    ],
    [
      "Campos",
      "Olsen"
    ],
    [
      "Savannah",
      "Kirby"
    ]
  ],
  "size": 5,
  "status": 200
}
```

要获取后续页面，请使用上一个响应中的 `cursor`：

```json
POST /_plugins/_sql 
{
   "cursor": "d:eyJhIjp7fSwicyI6IkRYRjFaWEo1UVc1a1JtVjBZMmdCQUFBQUFBQUFBQU1XZWpkdFRFRkZUMlpTZEZkeFdsWnJkRlZoYnpaeVVRPT0iLCJjIjpbeyJuYW1lIjoiZmlyc3RuYW1lIiwidHlwZSI6InRleHQifSx7Im5hbWUiOiJsYXN0bmFtZSIsInR5cGUiOiJ0ZXh0In1dLCJmIjo1LCJpIjoiYWNjb3VudHMiLCJsIjo5NTF9"
}
```

下一个响应只包含结果的 `datarows` 和一个新的 `cursor`。

```json
{
  "cursor": "d:eyJhIjp7fSwicyI6IkRYRjFaWEo1UVc1a1JtVjBZMmdCQUFBQUFBQUFBQU1XZWpkdFRFRkZUMlpTZEZkeFdsWnJkRlZoYnpaeVVRPT0iLCJjIjpbeyJuYW1lIjoiZmlyc3RuYW1lIiwidHlwZSI6InRleHQifSx7Im5hbWUiOiJsYXN0bmFtZSIsInR5cGUiOiJ0ZXh0In1dLCJmIjo1LCJpIjoiYWNjb3VudHMabcde12345",
  "datarows": [
    [
      "Abbey",
      "Karen"
    ],
    [
      "Chen",
      "Ken"
    ],
    [
      "Ani",
      "Jade"
    ],
    [
      "Peng",
      "Hu"
    ],
    [
      "John",
      "Doe"
    ]
  ]
}
```

::: info 注意
如果嵌套字段被展平，`datarows` 中的记录数可能会超过 `fetch_size`。 
:::

最后一页结果只有 `datarows`，没有 `cursor`。到最后一页时，`cursor` 上下文会被自动清除。

要显式清除游标（cursor）上下文，请使用 `_plugins/_sql/close` 端点操作：

```json
POST /_plugins/_sql/close 
{
   "cursor": "d:eyJhIjp7fSwicyI6IkRYRjFaWEo1UVc1a1JtVjBZMmdCQUFBQUFBQUFBQU1XZWpkdFRFRkZUMlpTZEZkeFdsWnJkRlZoYnpaeVVRPT0iLCJjIjpbeyJuYW1lIjoiZmlyc3RuYW1lIiwidHlwZSI6InRleHQifSx7Im5hbWUiOiJsYXN0bmFtZSIsInR5cGUiOiJ0ZXh0In1dLCJmIjo1LCJpIjoiYWNjb3VudHMiLCJsIjo5NTF9"
}'
```

响应为 OpenSearch 返回的确认信息：

```json
{"succeeded":true}
```

## 过滤结果

可以使用 `filter` 参数直接向 OpenSearch DSL 添加更多条件。

以下 SQL 查询返回所有客户的姓名和账户余额，然后对结果进行过滤，只保留余额少于 $10,000 的客户。 

```json
POST /_plugins/_sql/ 
{
  "query" : "SELECT firstname, lastname, balance FROM accounts",
  "filter" : {
    "range" : {
      "balance" : {
        "lt" : 10000
      }
    }
  }
}
```

响应包含匹配的结果：

```json
{
  "schema": [
    {
      "name": "firstname",
      "type": "text"
    },
    {
      "name": "lastname",
      "type": "text"
    },
    {
      "name": "balance",
      "type": "long"
    }
  ],
  "total": 2,
  "datarows": [
    [
      "Hattie",
      "Bond",
      5686
    ],
    [
      "Dale",
      "Adams",
      4180
    ]
  ],
  "size": 2,
  "status": 200
}
```

可以使用 Explain API 查看此查询在 OpenSearch 上是如何执行的：

```json
POST /_plugins/_sql/_explain 
{
  "query" : "SELECT firstname, lastname, balance FROM accounts",
  "filter" : {
    "range" : {
      "balance" : {
        "lt" : 10000
      }
    }
  }
}'
```

响应包含与上述查询对应的 OpenSearch DSL 布尔查询：

```json
{
  "from": 0,
  "size": 200,
  "query": {
    "bool": {
      "filter": [{
        "bool": {
          "filter": [{
            "range": {
              "balance": {
                "from": null,
                "to": 10000,
                "include_lower": true,
                "include_upper": false,
                "boost": 1.0
              }
            }
          }],
          "adjust_pure_negative": true,
          "boost": 1.0
        }
      }],
      "adjust_pure_negative": true,
      "boost": 1.0
    }
  },
  "_source": {
    "includes": [
      "firstname",
      "lastname",
      "balance"
    ],
    "excludes": []
  }
}
```

## 使用参数

可以使用 `parameters` 字段向预处理（prepared）SQL 查询传递参数值。

以下 explain 操作使用了一个带 `age` 参数的 SQL 查询：

```json
POST /_plugins/_sql/_explain 
{
  "query": "SELECT * FROM accounts WHERE age = ?",
  "parameters": [{
    "type": "integer",
    "value": 30
  }]
}
```

响应包含与上述 SQL 查询对应的 OpenSearch DSL 布尔查询：

```json
{
  "from": 0,
  "size": 200,
  "query": {
    "bool": {
      "filter": [{
        "bool": {
          "must": [{
            "term": {
              "age": {
                "value": 30,
                "boost": 1.0
              }
            }
          }],
          "adjust_pure_negative": true,
          "boost": 1.0
        }
      }],
      "adjust_pure_negative": true,
      "boost": 1.0
    }
  }
}

```
