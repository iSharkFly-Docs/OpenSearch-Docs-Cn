---
title: 别名
---

# 别名字段类型

别名（Alias）字段类型为现有字段创建另一个名称。你可以在[搜索](#using-aliases-in-search-api-operations)和[字段能力](#using-aliases-in-field-capabilities-api-operations) API 操作中使用别名，但存在一些[例外情况](#exceptions)。要设置[别名](#alias-field)，需要在 `path` 参数中指定[原始字段](#original-field)的名称。

## 示例

```json
PUT movies 
{
  "mappings" : {
    "properties" : {
      "year" : {
        "type" : "date"
      },
      "release_date" : {
        "type" : "alias",
        "path" : "year"
      }
    }
  }
}
```

## 参数

参数 | 描述 
:--- | :--- 
`path` | 原始字段的完整路径，包括所有父对象。例如 parent.child.field_name。必需。

## 别名字段

别名字段必须遵守以下规则：

- 一个别名字段只能有一个原始字段。
- 在嵌套对象中，别名必须与原始字段处于相同的嵌套层级。

::: info 注意
要更改别名引用的字段，请更新映射（Mapping）。请注意，之前存储的任何 percolator 查询中的别名仍会引用原来的字段。
:::

## 原始字段

别名的原始字段必须遵守以下规则：
- 原始字段必须在创建别名之前创建。
- 原始字段不能是对象或另一个别名。

## 在搜索 API 操作中使用别名

你可以在搜索 API 的以下读取操作中使用别名：
- 查询
- 排序
- 聚合
- `stored_fields`
- `docvalue_fields`
- 建议（Suggestion）
- 高亮
- 访问字段值的脚本

## 在字段能力 API 操作中使用别名

要在字段能力 API 中使用别名，请在 fields 参数中指定该别名。

```json
GET movies/_field_caps?fields=release_date
```

## 例外情况

在以下情况下不能使用别名：
- 在写入请求中，例如更新请求。
- 在多字段中，或作为 `copy_to` 的目标。
- 作为用于过滤结果的 _source 参数。
- 在接受字段名的 API 中，例如词项向量（term vectors）。
- 在 `terms`、`more_like_this` 和 `geo_shape` 查询中（检索文档时不支持别名）。

## 通配符

在搜索和字段能力的通配符查询中，原始字段和别名都会与通配符模式进行匹配。 

```json
GET movies/_field_caps?fields=release*
```
