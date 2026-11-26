---
title: IP 地址
---

# IP 地址字段类型

ip 字段类型包含 IPv4 或 IPv6 格式的 IP 地址。 

::: info 注意
如需表示 IP 地址范围，可以使用 IP [范围字段类型](/field-types/supported-field-types/range)。
:::

## 示例

创建一个包含 IP 地址的映射（Mapping）：

```json
PUT testindex 
{
  "mappings" : {
    "properties" :  {
      "ip_address" : {
        "type" : "ip"
      }
    }
  }
}
```

索引一个包含 IP 地址的文档（Document）：

```json
PUT testindex/_doc/1 
{
  "ip_address" : "10.24.34.0"
}
```

在索引中查询特定的 IP 地址：

```json
GET testindex/_doc/1 
{
  "query": {
    "term": {
      "ip_address": "10.24.34.0"
    }
  }
}
```

## 搜索 IP 地址及其关联的网络掩码

可以使用[无类别域间路由（CIDR）表示法](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation)在索引中查询 IP 地址。使用 CIDR 表示法时，需要指定 IP 地址和前缀长度（0–32），两者用 `/` 分隔。例如，前缀长度为 24 时，将匹配前 24 位相同的所有 IP 地址。

#### IPv4 格式的查询示例

```json
GET testindex/_search 
{
  "query": {
    "term": {
      "ip_address": "10.24.34.0/24"
    }
  }
}
```

#### IPv6 格式的查询示例

```json
GET testindex/_search 
{
  "query": {
    "term": {
      "ip_address": "2001:DB8::/24"
    }
  }
}
```

如果在 `query_string` 查询中使用 IPv6 格式的 IP 地址，需要对 `:` 字符进行转义，因为它们会被解析为特殊字符。可以将 IP 地址用引号括起来，并用 `\` 对这些引号进行转义。

```json
GET testindex/_search 
{
  "query" : {
    "query_string": {
      "query": "ip_address:\"2001:DB8::/24\""
    }
  }
}
```

## 参数

下表列出了 ip 字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`boost` | 一个浮点值，指定该字段对相关性评分（Relevance Score）的权重。大于 1.0 的值会提高该字段的相关性，介于 0.0 和 1.0 之间的值会降低该字段的相关性。默认值为 1.0。
`doc_values` | 一个布尔值，指定是否将该字段存储到磁盘上，以便用于聚合、排序或脚本。默认值为 `true`。
`ignore_malformed` | 一个布尔值，指定忽略格式错误的值而不抛出异常。默认值为 `false`。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。 
[`null_value`](/field-types/supported-field-types/#null-value) | 用于替代 `null` 的值，必须与字段类型相同。如果未指定此参数，当字段值为 `null` 时，该字段会被视为缺失。默认值为 `null`。
`store` | 一个布尔值，指定是否存储字段值，以便能独立于 _source 字段单独检索。默认值为 `false`。
