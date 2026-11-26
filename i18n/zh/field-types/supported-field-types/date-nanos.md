---
title: 纳秒日期
---

# 纳秒日期字段类型

`date_nanos` 字段类型与 [`date`](/field-types/supported-field-types/date) 字段类型类似，都用于保存日期。不同之处在于，`date` 以毫秒精度存储日期，而 `date_nanos` 以纳秒精度存储日期。日期存储为 `long` 值，对应自纪元（epoch）以来的纳秒数。因此，支持的日期范围大约为 1970 年至 2262 年。

对 `date_nanos` 字段的查询（Query）会被转换为对字段值 `long` 表示形式的范围查询。然后，存储字段和聚合（Aggregation）结果会使用该字段上设置的格式转换为字符串。 

::: info 注意
`date_nanos` 字段支持 `date` 所支持的全部[格式](/field-types/supported-field-types/date#formats)和[参数](/field-types/supported-field-types/date#parameters)。可以使用多个格式，用 `||` 分隔。
:::

对于 `date_nanos` 字段，可以使用 `strict_date_optional_time_nanos` 格式来保留纳秒精度。如果将字段映射为 `date_nanos` 时没有指定格式，则默认格式为 `strict_date_optional_time||epoch_millis`，允许以 `strict_date_optional_time` 或 `epoch_millis` 格式传入值。`strict_date_optional_time` 格式支持纳秒精度的日期，而 `epoch_millis` 格式只支持毫秒精度的日期。

## 示例

创建一个映射（Mapping），其中 `date` 字段的类型为 `date_nanos`，格式为 `strict_date_optional_time_nanos`：

```json
PUT testindex/_mapping
{
  "properties": {
      "date": {
        "type": "date_nanos",
        "format" : "strict_date_optional_time_nanos"
      }
    }
}
```

向索引中索引两个文档（Document）：

```json
PUT testindex/_doc/1
{ "date": "2022-06-15T10:12:52.382719622Z" }
```

```json
PUT testindex/_doc/2
{ "date": "2022-06-15T10:12:52.382719624Z" }
```

可以使用 range 查询搜索日期范围：

```json
GET testindex/_search
{
  "query": {
    "range": {
      "date": {
        "gte": "2022-06-15T10:12:52.382719621Z",
        "lte": "2022-06-15T10:12:52.382719623Z"
      }
    }
  }
}
```

响应中包含日期位于指定范围内的文档：

```json
{
  "took": 43,
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
        "_index": "testindex",
        "_id": "1",
        "_score": 1,
        "_source": {
          "date": "2022-06-15T10:12:52.382719622Z"
        }
      }
    ]
  }
}
```

查询包含 `date_nanos` 字段的文档时，可以使用 `fields` 或 `docvalue_fields`：

```json
GET testindex/_search
{
  "fields": ["date"]
}
```

```json
GET testindex/_search
{
  "docvalue_fields" : [
    {
      "field" : "date"
    }
  ]
}
```

上述任一查询的响应都包含两个已索引的文档：

```json
{
  "took": 4,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 1,
        "_source": {
          "date": "2022-06-15T10:12:52.382719622Z"
        },
        "fields": {
          "date": [
            "2022-06-15T10:12:52.382719622Z"
          ]
        }
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 1,
        "_source": {
          "date": "2022-06-15T10:12:52.382719624Z"
        },
        "fields": {
          "date": [
            "2022-06-15T10:12:52.382719624Z"
          ]
        }
      }
    ]
  }
}
```

可以按如下方式对 `date_nanos` 字段进行排序：

```json
GET testindex/_search
{
  "sort": { 
    "date": "asc"
  } 
}
```

响应中包含排序后的文档：

```json
{
  "took": 5,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": null,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": null,
        "_source": {
          "date": "2022-06-15T10:12:52.382719622Z"
        },
        "sort": [
          1655287972382719700
        ]
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": null,
        "_source": {
          "date": "2022-06-15T10:12:52.382719624Z"
        },
        "sort": [
          1655287972382719700
        ]
      }
    ]
  }
}
```

还可以使用 Painless 脚本访问字段的纳秒部分：

```json
GET testindex/_search
{
  "script_fields" : {
    "my_field" : {
      "script" : {
        "lang" : "painless",
        "source" : "doc['date'].value.nano" 
      }
    }
  }
}
```

响应中只包含字段的纳秒部分：

```json
{
  "took": 4,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 1,
        "fields": {
          "my_field": [
            382719622
          ]
        }
      },
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 1,
        "fields": {
          "my_field": [
            382719624
          ]
        }
      }
    ]
  }
}
```
