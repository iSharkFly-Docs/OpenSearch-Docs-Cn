---
title: 无符号长整型
---

# Unsigned long 字段类型

`unsigned_long` 字段类型是一种数值字段类型，表示无符号 64 位整数，最小值为 0，最大值为 2<sup>64</sup> &minus; 1。在下面的示例中，`counter` 被映射为 `unsigned_long` 字段：

```json
PUT testindex 
{
  "mappings" : {
    "properties" :  {
      "counter" : {
        "type" : "unsigned_long"
      }
    }
  }
}
```

## 索引

要索引一个包含 `unsigned_long` 值的文档（Document），请使用以下请求：

```json
PUT testindex/_doc/1 
{
  "counter" : 10223372036854775807
}
```

也可以按如下方式使用 [Bulk API](/api-reference/document-apis/bulk)：

```json
POST _bulk
{ "index": { "_index": "testindex", "_id": "1" } }
{ "counter": 10223372036854775807 }
```

::: info 注意
如果 `unsigned_long` 类型字段的 `store` 参数设置为 `true`（即该字段是存储字段），它将以字符串形式存储和返回。`unsigned_long` 值不支持小数部分，因此如果提供了小数部分，它会被截断。
:::

## 查询

`unsigned_long` 字段支持其他数值类型所支持的大多数查询（Query）。例如，可以对 `unsigned_long` 字段使用 term 查询：

```json
POST _search
{
  "query": {
    "term": {
      "counter": {
        "value": 10223372036854775807
      }
    }
  }
}
```

也可以使用 range 查询：

```json
POST _search
{
  "query": {
    "range": {
      "counter": {
        "gte": 10223372036854775807
      }
    }
  }
}
```

## 排序

可以对 `unsigned_long` 字段使用 `sort` 值对搜索结果进行排序，例如：

```json
POST _search
{
  "sort" : [
    { 
      "counter" : { 
        "order" : "asc" 
      } 
    }
  ],
  "query": {
    "range": {
      "counter": {
        "gte": 10223372036854775807
      }
    }
  }
}
```

::: danger 警告
`unsigned_long` 字段不能用作索引排序字段（即 `sort.field` 索引设置中的字段）。
:::

## 聚合

与其他数值字段一样，`unsigned_long` 字段支持聚合（Aggregation）。对于 `terms` 和 `multi_terms` 聚合，`unsigned_long` 值按原样使用；而对于其他类型的聚合，这些值会被转换为 `double` 类型（可能会损失精度）。以下是 `terms` 聚合的示例：

```json
POST _search
{
  "query": {
    "match_all": {}
  },
  "aggs": {
    "counters": {
      "terms": { 
         "field": "counter" 
      }
    }
  }
}
```

## 脚本

在脚本中，`unsigned_long` 字段以 `BigInteger` 类的实例形式返回： 

```json
POST _search
{
  "query": {
    "bool": {
      "filter": {
        "script": {
          "script": "BigInteger amount = doc['counter'].value; return amount.compareTo(BigInteger.ZERO) > 0;"
        }
      }
    }
  }
}
```

## 限制

请注意 `unsigned_long` 字段类型的以下限制：

- 当对不同数值类型执行聚合，且其中一种类型为 `unsigned_long` 时，值会被转换为 `double` 类型并使用 `double` 运算，很可能会损失精度。

- `unsigned_long` 字段不能用作索引排序字段（即 `sort.field` 索引设置中的字段）。当对多个索引执行搜索，且结果按某个字段排序，而该字段在至少一个索引中为 `unsigned_long` 类型、在其他索引中为其他数值类型时，此限制同样适用。
