---
title: 二进制
---

# 二进制字段类型

二进制（binary）字段类型包含以 [Base64](https://en.wikipedia.org/wiki/Base64) 编码的二进制值，该值不可搜索。 

## 示例

创建一个包含二进制字段的映射：

```json
PUT testindex 
{
  "mappings" : {
    "properties" :  {
      "binary_value" : {
        "type" : "binary"
      }
    }
  }
}
```

索引一个包含二进制值的文档：

```json
PUT testindex/_doc/1 
{
  "binary_value" : "bGlkaHQtd29rfx4="
}
```

::: info 注意
使用 `=` 作为填充字符。不允许包含内嵌的换行符。
:::

## 参数

下表列出了二进制字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`doc_values` | 一个布尔值，指定是否应将该字段存储在磁盘上，以便用于聚合、排序或脚本。可选。默认值为 `true`。
`store` | 一个布尔值，指定是否应存储该字段值，使其可以独立于 _source 字段单独检索。可选。默认值为 `false`。
