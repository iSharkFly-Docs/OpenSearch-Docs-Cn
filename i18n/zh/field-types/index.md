---
title: 映射和字段类型
---

# 映射和字段类型

你可以通过创建*映射（Mapping）* 来定义文档及其字段的存储和索引方式。映射指定了文档的字段列表。文档中的每个字段都有一个*字段类型（Field Type）*，它定义了该字段所包含数据的类型。例如，你可能希望指定 `year` 字段的类型为 `date`。要了解更多信息，请参阅[支持的字段类型](/field-types/supported-field-types/)。

如果你刚开始构建集群和数据，可能还不确定数据应该如何存储。在这种情况下，可以使用动态映射，让 OpenSearch 动态地添加数据及其字段。但是，如果你清楚地知道数据属于哪些类型，并希望强制执行这一标准，则可以使用显式映射。

例如，如果你想指明 `year` 的类型应为 `text` 而不是 `integer`，而 `age` 应为 `integer`，就可以使用显式映射来实现。如果使用动态映射，OpenSearch 可能会把 `year` 和 `age` 都解释为整数。

本节提供了一个示例，演示如何创建索引映射，以及如何向其中添加一个会经过 ip_range 验证的文档。

---
## 动态映射

索引文档时，OpenSearch 会通过动态映射自动添加字段。你也可以显式地向索引映射中添加字段。

#### 动态映射类型

类型 | 描述
:--- | :---
null | `null` 字段无法被索引或搜索。当字段被设置为 null 时，OpenSearch 会将其视为该字段没有值。
boolean | OpenSearch 接受 `true` 和 `false` 作为布尔值。空字符串等同于 `false.`
float | 单精度 32 位浮点数。
double | 双精度 64 位浮点数。
integer | 有符号 32 位数字。
object | 对象是标准的 JSON 对象，可以拥有自己的字段和映射。例如，`movies` 对象可以包含 `title`、`year` 和 `director` 等其他属性。
array | OpenSearch 中的数组只能存储一种类型的值，例如只包含整数或只包含字符串的数组。空数组会被视为没有值的字段。
text | 表示全文值的字符串字符序列。
keyword | 结构化字符组成的字符串序列，例如电子邮件地址或邮政编码。
date detection string | 默认启用。如果新的字符串字段匹配日期格式，则该字符串会作为 `date` 字段处理。例如，`date: "2012/03/11"` 会被作为日期处理。
numeric detection string | 如果禁用，OpenSearch 可能会把本应作为数字处理的数值自动作为字符串处理。启用后，OpenSearch 可以将字符串处理为 `long`、`integer`、`short`、`byte`、`double`、`float`、`half_float`、`scaled_float` 和 `unsigned_long`。默认禁用。

## 显式映射

如果你确切知道字段需要的数据类型，可以在创建索引时在请求体中指定。

```json
PUT sample-index1
{
  "mappings": {
    "properties": {
      "year":    { "type" : "text" },
      "age":     { "type" : "integer" },
      "director":{ "type" : "text" }
    }
  }
}
```

### 响应
```json
{
    "acknowledged": true,
    "shards_acknowledged": true,
    "index": "sample-index1"
}
```

要向现有索引或数据流添加映射，可以使用 `PUT` 或 `POST` HTTP 方法向 `_mapping` 端点发送请求：

```json
POST sample-index1/_mapping
{
  "properties": {
    "year":    { "type" : "text" },
    "age":     { "type" : "integer" },
    "director":{ "type" : "text" }
  }
}
```

::: info 注意
你不能更改现有字段的映射，只能修改该字段的映射参数。 
:::

---
## 映射用法示例

以下示例演示如何创建映射，指定 OpenSearch 忽略所有 IP 地址格式错误、不符合 [`ip`](/field-types/supported-field-types/ip) 数据类型的文档。这可以通过将 `ignore_malformed` 参数设置为 `true` 来实现。

### 创建带有 `ip` 映射的索引

要创建索引，请使用 PUT 请求：

```json
PUT /test-index 
{
  "mappings" : {
    "properties" :  {
      "ip_address" : {
        "type" : "ip",
        "ignore_malformed": true
      }
    }
  }
}
```

你可以向索引中添加一个 IP 地址格式错误的文档：

```json
PUT /test-index/_doc/1 
{
  "ip_address" : "malformed ip address"
}
```

由于 `ignore_malformed` 设置为 true，这个被索引的 IP 地址不会引发错误。 

你可以使用以下请求查询该索引：

```json
GET /test-index/_search
```

响应显示，被索引文档中的 `ip_address` 字段被忽略了：

```json
{
  "took": 14,
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
    "max_score": 1,
    "hits": [
      {
        "_index": "test-index",
        "_id": "1",
        "_score": 1,
        "_ignored": [
          "ip_address"
        ],
        "_source": {
          "ip_address": "malformed ip address"
        }
      }
    ]
  }
}
```

## 获取映射

要获取一个或多个索引的所有映射，请使用以下请求：

```json
GET <index>/_mapping
```

在上述请求中，`<index>` 可以是一个索引名称，也可以是以逗号分隔的索引名称列表。 

要获取所有索引的所有映射，请使用以下请求：

```json
GET _mapping
```

要获取特定字段的映射，请提供索引名称和字段名称：

```json
GET _mapping/field/<fields>
GET /<index>/_mapping/field/<fields>
```

`<index>` 和 `<fields>` 都可以指定为单个值或以逗号分隔的列表。

例如，以下请求检索 `sample-index1` 中 `year` 和 `age` 字段的映射：

```json
GET sample-index1/_mapping/field/year,age
```

响应包含指定的字段：

```json
{
  "sample-index1" : {
    "mappings" : {
      "year" : {
        "full_name" : "year",
        "mapping" : {
          "year" : {
            "type" : "text"
          }
        }
      },
      "age" : {
        "full_name" : "age",
        "mapping" : {
          "age" : {
            "type" : "integer"
          }
        }
      }
    }
  }
}
```
