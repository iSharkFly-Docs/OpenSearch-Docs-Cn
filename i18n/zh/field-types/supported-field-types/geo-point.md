---
title: 地理点
---

# 地理点字段类型

地理点（geopoint）字段类型包含一个由纬度和经度指定的地理点。 

## 示例

创建一个包含地理点字段类型的映射（Mapping）：

```json
PUT testindex1
{
  "mappings": {
    "properties": {
      "point": {
        "type": "geo_point"
      }
    }
  }
}
```

## 格式

地理点可以按以下格式进行索引：

- 包含纬度和经度的对象

```json
PUT testindex1/_doc/1
{
  "point": { 
    "lat": 40.71,
    "lon": 74.00
  }
}
```

- "`latitude`,`longitude`" 格式的字符串

```json
PUT testindex1/_doc/2
{
  "point": "40.71,74.00" 
}
```

- geohash

```json
PUT testindex1/_doc/3
{
  "point": "txhxegj0uyp3"
}
```

- [`longitude`, `latitude`] 格式的数组

```json
PUT testindex1/_doc/4
{
  "point": [74.00, 40.71] 
}
```

- "POINT(`longitude` `latitude`)" 格式的 [Well-Known Text](https://docs.opengeospatial.org/is/12-063r5/12-063r5.html) POINT

```json
PUT testindex1/_doc/5
{
  "point": "POINT (74.00 40.71)"
}
```

- GeoJSON 格式，其中 `coordinates` 采用 [`longitude`, `latitude`] 格式

```json
PUT testindex1/_doc/6
{
  "point": {
    "type": "Point",
    "coordinates": [74.00, 40.71]
  }
}
```

## 参数

下表列出了地理点字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`ignore_malformed` | 一个布尔值，指定忽略格式错误的值而不抛出异常。纬度的有效值范围为 [-90, 90]，经度的有效值范围为 [-180, 180]。默认值为 `false`。
`ignore_z_value` | 仅适用于具有三个坐标的点。如果 `ignore_z_value` 为 `true`，则第三个坐标不会被索引，但仍会存储在 _source 字段中。如果 `ignore_z_value` 为 `false`，则会抛出异常。
[`null_value`](/field-types/supported-field-types/#null-value) | 用于替代 `null` 的值，必须与字段类型相同。如果未指定此参数，当字段值为 `null` 时，该字段会被视为缺失。默认值为 `null`。
