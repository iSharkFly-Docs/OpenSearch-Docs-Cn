---
title: Object
---

# Object 字段类型

object 字段类型包含一个 JSON 对象（一组名称/值对）。JSON 对象中的值可以是另一个 JSON 对象。映射对象字段时不需要将类型指定为 `object`，因为 `object` 是默认类型。

## 示例

创建一个包含对象字段的映射（Mapping）：

```json
PUT testindex1/_mappings
{
    "properties": {
      "patient": { 
        "properties" :
          {
            "name" : {
              "type" : "text"
            },
            "id" : {
              "type" : "keyword"
            }
          }   
      }
    }
}
```

索引一个包含对象字段的文档（Document）：

```json
PUT testindex1/_doc/1
{ 
  "patient": { 
    "name" : "John Doe",
    "id" : "123456"
  } 
}
```

嵌套对象在内部以扁平的键/值对形式存储。如需引用嵌套对象中的字段，请使用 `parent field`.`child field` 的形式（例如 `patient.id`）。

搜索 ID 为 123456 的病人：

```json
GET testindex1/_search
{
  "query": {
    "term" : {
      "patient.id" : "123456"
    }
  }
}
```

## 参数

下表列出了 object 字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
[`dynamic`](#the-dynamic-parameter) | 指定是否可以向该对象动态添加新字段。有效值为 `true`、`false` 和 `strict`。默认值为 `true`。
`enabled` | 一个布尔值，指定是否解析该对象的 JSON 内容。如果 `enabled` 设置为 `false`，该对象的内容不会被索引，也无法搜索，但仍然可以从 _source 字段中检索。默认值为 `true`。
`properties` | 该对象的字段，可以是任何受支持的类型。如果 `dynamic` 设置为 `true`，则可以向该对象动态添加新属性。

### `dynamic` 参数

`dynamic` 参数指定是否可以向已索引的对象动态添加新字段。

例如，可以先创建一个映射，其中 `patient` 对象只有一个字段：

```json
PUT testindex1/_mappings
{
    "properties": {
      "patient": { 
        "properties" :
          {
            "name" : {
              "type" : "text"
            }
          }   
      }
    }
}
```

然后索引一个文档，在 `patient` 中包含一个新的 `id` 字段：

```json
PUT testindex1/_doc/1
{ 
  "patient": { 
    "name" : "John Doe",
    "id" : "123456"
  } 
}
```

结果，`id` 字段被添加到了映射中：

```json
{
  "testindex1" : {
    "mappings" : {
      "properties" : {        
        "patient" : {
          "properties" : {
            "id" : {
              "type" : "text",
              "fields" : {
                "keyword" : {
                  "type" : "keyword",
                  "ignore_above" : 256
                }
              }
            },
            "name" : {
              "type" : "text"
            }
          }
        }
      }
    }
  }
}
```

`dynamic` 参数有以下有效值。

值 | 描述 
:--- | :--- 
`true` | 可以向映射动态添加新字段。这是默认值。
`false` | 不能向映射动态添加新字段。如果检测到新字段，该字段不会被索引，也无法搜索，但仍然可以从 _source 字段中检索。 
`strict` | 当向映射动态添加新字段时，会抛出异常。如需向对象添加新字段，必须先将其添加到映射中。

::: info 注意
内部对象会继承父对象的 `dynamic` 参数值，除非它们声明了自己的 `dynamic` 参数值。
:::
