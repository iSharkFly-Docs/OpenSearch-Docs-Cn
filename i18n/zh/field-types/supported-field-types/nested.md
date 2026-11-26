---
title: Nested
---

# Nested 字段类型

nested 字段类型是一种特殊的[对象字段类型](/field-types/supported-field-types/object)。 

任何对象字段都可以接受一个对象数组。数组中的每个对象都会被动态映射为对象字段类型，并以扁平化的形式存储。这意味着数组中的对象会被拆分为各个单独的字段，所有对象中同一字段的值会存储在一起。有时需要使用 nested 类型将嵌套对象作为一个整体保留下来，以便对其执行搜索。

## 扁平化形式

默认情况下，每个嵌套对象都会被动态映射为对象字段类型。任何对象字段都可以接受一个对象数组。 

```json
PUT testindex1/_doc/100
{ 
  "patients": [ 
    {"name" : "John Doe", "age" : 56, "smoker" : true},
    {"name" : "Mary Major", "age" : 85, "smoker" : false}
  ] 
}
```

存储这些对象时，它们会被扁平化，因此其内部表示中每个字段都对应一个包含所有值的数组：

```json
{
    "patients.name" : ["John Doe", "Mary Major"],
    "patients.age" : [56, 85],
    "patients.smoker" : [true, false]
}
```

在这种表示形式下，有些查询（Query）可以正确执行。如果搜索年龄大于 75 岁或吸烟的病人，文档（Document）100 应当匹配。

```json
GET testindex1/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "term": {
            "patients.smoker": true
          }
        },
        {
          "range": {
            "patients.age": {
              "gte": 75
            }
          }
        }
      ]
    }
  }
}
```

该查询正确地返回了文档 100：

```json
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 1.3616575,
    "hits" : [
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "100",
        "_score" : 1.3616575,
        "_source" : {
          "patients" : [
            {
              "name" : "John Doe",
              "age" : "56",
              "smoker" : true
            },
            {
              "name" : "Mary Major",
              "age" : "85",
              "smoker" : false
            }
          ]
        }
      }
    ]
  }
}
```

而如果搜索年龄大于 75 岁且吸烟的病人，文档 100 不应当匹配。

```json
GET testindex1/_search 
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "patients.smoker": true
          }
        },
        {
          "range": {
            "patients.age": {
              "gte": 75
            }
          }
        }
      ]
    }
  }
}
```

然而，该查询仍然错误地返回了文档 100。这是因为在为各个字段创建值数组时，年龄与吸烟之间的关联丢失了。

## Nested 字段类型 {#nested-field-type-1}

嵌套对象会作为单独的文档存储，父对象持有对其子对象的引用。如需将对象标记为嵌套对象，请创建一个包含 nested 字段类型的映射（Mapping）。

```json
PUT testindex1
{
  "mappings" : {
    "properties": {
      "patients": { 
        "type" : "nested"
      }
    }
  }
}
```

然后，索引一个包含 nested 字段类型的文档：

```json
PUT testindex1/_doc/100
{ 
  "patients": [ 
    {"name" : "John Doe", "age" : 56, "smoker" : true},
    {"name" : "Mary Major", "age" : 85, "smoker" : false}
  ] 
}
```

可以使用以下 nested 查询来搜索年龄大于 75 岁或吸烟的病人：

```json
GET testindex1/_search
{
  "query": {
    "nested": {
      "path": "patients",
      "query": {
        "bool": {
          "should": [
            {
              "term": {
                "patients.smoker": true
              }
            },
            {
              "range": {
                "patients.age": {
                  "gte": 75
                }
              }
            }
          ]
        }
      }
    }
  }
}
```

该查询正确地返回了两个病人：

```json
{
  "took" : 7,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.8465736,
    "hits" : [
      {
        "_index" : "testindex1",
        "_id" : "100",
        "_score" : 0.8465736,
        "_source" : {
          "patients" : [
            {
              "name" : "John Doe",
              "age" : 56,
              "smoker" : true
            },
            {
              "name" : "Mary Major",
              "age" : 85,
              "smoker" : false
            }
          ]
        }
      }
    ]
  }
}
```

可以使用以下 nested 查询来搜索年龄大于 75 岁且吸烟的病人：

```json
GET testindex1/_search
{
  "query": {
    "nested": {
      "path": "patients",
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "patients.smoker": true
              }
            },
            {
              "range": {
                "patients.age": {
                  "gte": 75
                }
              }
            }
          ]
        }
      }
    }
  }
}
```

与预期一致，上述查询没有返回任何结果：

```json
{
  "took" : 7,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 0,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  }
}
```

## 参数

下表列出了对象字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
[`dynamic`](/field-types/supported-field-types/object#the-dynamic-parameter) | 指定是否可以向该对象动态添加新字段。有效值为 `true`、`false` 和 `strict`。默认值为 `true`。
`include_in_parent` | 一个布尔值，指定是否也将子嵌套对象中的所有字段以扁平化形式添加到父文档中。默认值为 `false`。
`include_in_root` | 一个布尔值，指定是否也将子嵌套对象中的所有字段以扁平化形式添加到根文档中。默认值为 `false`。
`properties` | 该对象的字段，可以是任何受支持的类型。如果 `dynamic` 设置为 `true`，则可以向该对象动态添加新属性。
