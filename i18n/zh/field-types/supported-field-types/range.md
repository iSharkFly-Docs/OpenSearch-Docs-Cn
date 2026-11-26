---
title: 范围字段类型
---

# 范围字段类型

下表列出了 OpenSearch 支持的所有范围字段类型。

字段数据类型 | 描述
:--- | :---
`integer_range` | [integer](/field-types/supported-field-types/numeric) 值的范围。 
`long_range` | [long](/field-types/supported-field-types/numeric) 值的范围。   
`double_range` | [double](/field-types/supported-field-types/numeric) 值的范围。  
`float_range` | [float](/field-types/supported-field-types/numeric) 值的范围。 
`ip_range` | IPv4 或 IPv6 格式的 [IP 地址](/field-types/supported-field-types/ip)范围。起始和结束 IP 地址可以采用不同的格式。  
`date_range` | [date](/field-types/supported-field-types/date) 值的范围。起始和结束日期可以采用不同的[格式](/field-types/supported-field-types/date#formats)。在内部，所有日期都存储为无符号 64 位整数，表示自纪元（epoch）以来的毫秒数。

## 示例

创建一个包含 double 范围和 date 范围的映射（Mapping）：

```json
PUT testindex 
{
  "mappings" : {
    "properties" :  {
      "gpa" : {
        "type" : "double_range"
      },
      "graduation_date" : {
        "type" : "date_range",
        "format" : "strict_year_month||strict_year_month_day"
      }
    }
  }
}
```

索引一个包含 double 范围和 date 范围的文档（Document）：

```json
PUT testindex/_doc/1
{
  "gpa" : {
    "gte" : 1.0,
    "lte" : 4.0
  },
  "graduation_date" : {
    "gte" : "2019-05-01",
    "lte" : "2019-05-15"
  }
}
```

## IP 地址范围

可以用两种格式指定 IP 地址范围：范围格式和 [CIDR 表示法](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation)。

创建一个包含 IP 地址范围的映射：

```json
PUT testindex 
{
  "mappings" : {
    "properties" :  {
      "ip_address_range" : {
        "type" : "ip_range" 
      },
      "ip_address_cidr" : {
        "type" : "ip_range" 
      }
    }
  }
}
```

索引一个包含两种格式 IP 地址范围的文档：

```json
PUT testindex/_doc/2
{
  "ip_address_range" : {
    "gte" : "10.24.34.0",
    "lte" : "10.24.35.255"
  },
  "ip_address_cidr" : "10.24.34.0/24"
}
```

## 查询范围字段

可以使用 [term 查询](#term-query)或 [range 查询](#range-query)在范围字段中搜索值。 

### Term 查询

term 查询接受一个值，并匹配该值落在其范围内的所有范围字段。

以下查询将返回文档 1，因为 3.5 落在范围 [1.0, 4.0] 之内：

```json
GET testindex/_search
{
  "query" : {
    "term" : {
      "gpa" : {
        "value" : 3.5
      }
    }
  }
}
```

### Range 查询

对范围字段执行 range 查询会返回位于该范围内的文档。 

查询 2019 年的所有毕业日期，以 "MM/dd/yyyy" 格式提供日期范围：

```json
GET testindex1/_search
{
  "query": {
    "range": {
      "graduation_date": {
        "gte": "01/01/2019",
        "lte": "12/31/2019",
        "format": "MM/dd/yyyy",
        "relation" : "within"       
      }
    }
  }
}
```

对于 `within` 和 `intersects` 关系，上述查询会返回文档 1；对于 `contains` 关系则不会返回。有关关系类型的更多信息，请参阅 [range 查询参数](/query-dsl/term/range#parameters)。

## 参数

下表列出了范围字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`boost` | 一个浮点值，指定该字段对相关性评分（Relevance Score）的权重。大于 1.0 的值会提高该字段的相关性，介于 0.0 和 1.0 之间的值会降低该字段的相关性。默认值为 1.0。
`coerce` | 一个布尔值，表示对整数值截断小数部分，并将字符串转换为数值。默认值为 `true`。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。 
`store` | 一个布尔值，指定是否存储字段值，以便能独立于 _source 字段单独检索。默认值为 `false`。
