---
title: xy point
---

# xy point 字段类型

xy point 字段类型包含二维笛卡尔坐标系中的一个点，由 x 和 y 坐标指定。它基于 Lucene 的 [XYPoint](https://lucene.apache.org/core/9_3_0/core/org/apache/lucene/geo/XYPoint.html) 字段类型。xy point 字段类型与 [geopoint](/field-types/supported-field-types/geo-point) 字段类型类似，但没有 geopoint 的取值范围限制。xy point 的坐标是单精度浮点值。有关浮点值的范围和精度，请参阅[数值字段类型](/field-types/supported-field-types/numeric)。

## 示例

创建一个包含 xy point 字段类型的映射（Mapping）：

```json
PUT testindex1
{
  "mappings": {
    "properties": {
      "point": {
        "type": "xy_point"
      }
    }
  }
}
```

## 格式

xy point 可以按以下格式进行索引：

- 包含 x 和 y 坐标的对象

```json
PUT testindex1/_doc/1
{
  "point": { 
    "x": 0.5,
    "y": 4.5
  }
}
```

- "`x`, `y`" 格式的字符串

```json
PUT testindex1/_doc/2
{
  "point": "0.5, 4.5" 
}
```

- [`x`, `y`] 格式的数组

```json
PUT testindex1/_doc/3
{
  "point": [0.5, 4.5] 
}
```

- "POINT(`x` `y`)" 格式的[熟知文本（Well-known Text，WKT）](https://docs.opengeospatial.org/is/12-063r5/12-063r5.html) POINT

```json
PUT testindex1/_doc/4
{
  "point": "POINT (0.5 4.5)"
}
```

- GeoJSON 格式

```json
PUT testindex1/_doc/5
{
  "point" : {
    "type" : "Point",
    "coordinates" : [0.5, 4.5]        
  }
}
```

::: info 注意
在所有 xy point 格式中，坐标都必须按 `x, y` 的顺序指定。 
:::

## 参数

下表列出了 xy point 字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`ignore_malformed` | 一个布尔值，指定是否忽略格式错误的值而不抛出异常。默认值为 `false`。
`ignore_z_value` | 仅适用于具有三个坐标的点。如果 `ignore_z_value` 为 `true`，第三个坐标不会被索引，但仍会存储在 _source 字段中。如果 `ignore_z_value` 为 `false`，则会抛出异常。
[`null_value`](/field-types/supported-field-types/#null-value) | 用于替代 `null` 的值。该值必须与字段类型相同。如果未指定此参数，当字段值为 `null` 时，该字段被视为缺失。默认值为 `null`。
