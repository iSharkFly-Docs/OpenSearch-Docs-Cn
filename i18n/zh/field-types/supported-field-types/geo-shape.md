---
title: 地理形状
---

# 地理形状字段类型

地理形状（geoshape）字段类型包含一个地理形状，例如多边形或地理点的集合。为了索引地理形状，OpenSearch 会将形状细分为三角形网格，并将每个三角形存储在 BKD 树中。这可以提供 10<sup>-7</sup> 十进制度的精度，代表近乎完美的空间分辨率。该过程的性能主要受所索引多边形的顶点数量影响。

## 示例

创建一个包含地理形状字段类型的映射（Mapping）：

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_shape"
      }
    }
  }
}
```

## 格式

地理形状可以按以下格式进行索引：

- [GeoJSON](https://geojson.org/)
- [Well-Known Text（WKT）](https://docs.opengeospatial.org/is/12-063r5/12-063r5.html)

::: info 注意
在 GeoJSON 和 WKT 中，坐标数组内的坐标都必须按 `longitude, latitude` 的顺序指定。请注意，在这种格式中经度在前。
:::

## 地理形状类型

下表描述了可用的地理形状类型及其与 GeoJSON 和 WKT 类型的对应关系。

OpenSearch 类型 | GeoJSON 类型 | WKT 类型 | 描述 
:--- | :--- | :--- | :--- 
[`point`](#point) | Point | POINT | 由纬度和经度指定的地理点。OpenSearch 使用世界大地坐标系（WGS84）坐标。
[`linestring`](#linestring) | LineString | LINESTRING | 由两个或更多点指定的线。可以是一条直线，也可以是由相连线段组成的路径。
[`polygon`](#polygon) | Polygon | POLYGON | 由坐标形式的顶点列表指定的多边形。多边形必须是闭合的，即最后一个点必须与第一个点相同。因此，要创建一个 n 边形，需要 n+1 个顶点。顶点的最小数量为四个，此时创建的是一个三角形。
[`multipoint`](#multipoint) | MultiPoint | MULTIPOINT | 一组互不相连但彼此相关的离散点组成的数组。
[`multilinestring`](#multilinestring) | MultiLineString | MULTILINESTRING | 由线串组成的数组。
[`multipolygon`](#multipolygon) | MultiPolygon | MULTIPOLYGON | 由多边形组成的数组。
[`geometrycollection`](#geometry-collection) | GeometryCollection | GEOMETRYCOLLECTION | 地理形状的集合，其中的形状可以是不同类型。
[`envelope`](#envelope) | N/A | BBOX | 由左上角和右下角顶点指定的边界矩形。

## 点

点是由纬度和经度指定的一对坐标。 

以 GeoJSON 格式索引一个点：

```json
PUT testindex/_doc/1
{
  "location" : {
    "type" : "point",
    "coordinates" : [74.00, 40.71]
  }
}
```

以 WKT 格式索引一个点：

```json
PUT testindex/_doc/1
{
  "location" : "POINT (74.0060 40.7128)"
}
```

## 线串

线串（linestring）是由两个或更多点指定的线。如果这些点共线，则线串是一条直线；否则，线串表示由线段组成的路径。

以 GeoJSON 格式索引一个线串：

```json
PUT testindex/_doc/2
{
  "location" : {
    "type" : "linestring",
    "coordinates" : [[74.0060, 40.7128], [71.0589, 42.3601]]
  }
}
```

以 WKT 格式索引一个线串：

```json
PUT testindex/_doc/2
{
  "location" : "LINESTRING (74.0060 40.7128, 71.0589 42.3601)"
}
```

## 多边形

多边形由坐标形式的顶点列表指定。多边形必须是闭合的，即最后一个点必须与第一个点相同。以下示例使用四个点创建一个三角形。 

::: info 注意
GeoJSON 要求按逆时针顺序列出多边形的顶点。WKT 对顶点顺序没有特定要求。
:::

以 GeoJSON 格式索引一个多边形（三角形）：

```json
PUT testindex/_doc/3
{
  "location" : {
    "type" : "polygon",
    "coordinates" : [
      [[74.0060, 40.7128], 
      [71.0589, 42.3601], 
      [73.7562, 42.6526], 
      [74.0060, 40.7128]]
    ]
  }
}
```

以 WKT 格式索引一个多边形（三角形）：

```json
PUT testindex/_doc/3
{
  "location" : "POLYGON ((74.0060 40.7128, 71.0589 42.3601, 73.7562 42.6526, 74.0060 40.7128))"
}
```

多边形内部可以有孔。在这种情况下，`coordinates` 字段将包含多个数组。第一个数组表示外部多边形，后续的每个数组表示一个孔。孔用多边形表示，并以坐标数组的形式指定。

::: info 注意
GeoJSON 要求按逆时针顺序列出多边形的顶点，按顺时针顺序列出孔的顶点。WKT 对顶点顺序没有特定要求。
:::

以 GeoJSON 格式索引一个带有三角形孔的多边形（三角形）：

```json
PUT testindex/_doc/4
{
  "location" : {
    "type" : "polygon",
    "coordinates" : [
      [[74.0060, 40.7128], 
      [71.0589, 42.3601], 
      [73.7562, 42.6526], 
      [74.0060, 40.7128]],
      
      [[72.6734,41.7658], 
      [72.6506, 41.5623], 
      [73.0515, 41.5582], 
      [72.6734, 41.7658]]
    ]
  }
}
```

以 WKT 格式索引一个带有三角形孔的多边形（三角形）：

```json
PUT testindex/_doc/4
{
  "location" : "POLYGON ((40.7128 74.0060, 42.3601 71.0589, 42.6526 73.7562, 40.7128 74.0060), (41.7658 72.6734, 41.5623 72.6506, 41.5582 73.0515, 41.7658 72.6734))"
}
```

在 OpenSearch 中，可以按顺时针或逆时针顺序列出顶点来指定多边形。对于不跨越日期变更线（宽度小于 180&deg;）的多边形，这种方式没有问题。但是，跨越日期变更线（宽度大于 180&deg;）的多边形可能存在歧义，因为 WKT 对顶点顺序没有特定要求。因此，对于跨越日期变更线的多边形，必须按逆时针顺序列出其顶点。 

可以在映射时定义 [`orientation`](#parameters) 参数来指定顶点的遍历顺序：

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_shape",
        "orientation" : "left"
      }
    }
  }
}
```

之后索引的文档（Document）可以覆盖 `orientation` 设置：

```json
PUT testindex/_doc/3
{
  "location" : {
    "type" : "polygon",
    "orientation" : "cw",
    "coordinates" : [
      [[74.0060, 40.7128], 
      [71.0589, 42.3601], 
      [73.7562, 42.6526], 
      [74.0060, 40.7128]]
    ]
  }
}
```

## 多点

多点（multipoint）是一组互不相连但彼此相关的离散点组成的数组。 

以 GeoJSON 格式索引一个多点：

```json
PUT testindex/_doc/6
{
  "location" : {
    "type" : "multipoint",
    "coordinates" : [
      [74.0060, 40.7128], 
      [71.0589, 42.3601]
    ]
  }
}
```

以 WKT 格式索引一个多点：

```json
PUT testindex/_doc/6
{
  "location" : "MULTIPOINT (74.0060 40.7128, 71.0589 42.3601)"
}
```

## 多线串

多线串（multilinestring）是由线串组成的数组。

以 GeoJSON 格式索引一个线串：

```json
PUT testindex/_doc/2
{
  "location" : {
    "type" : "multilinestring",
    "coordinates" : [
      [[74.0060, 40.7128], [71.0589, 42.3601]],
      [[73.7562, 42.6526], [72.6734, 41.7658]]
      ]
  }
}
```

以 WKT 格式索引一个线串：

```json
PUT testindex/_doc/2
{
  "location" : "MULTILINESTRING ((74.0060 40.7128, 71.0589 42.3601), (73.7562 42.6526, 72.6734 41.7658))"
}
```

## 多多边形

多多边形（multipolygon）是由多边形组成的数组。在此示例中，第一个多边形包含一个孔，第二个多边形不包含孔。 

以 GeoJSON 格式索引一个多多边形：

```json
PUT testindex/_doc/4
{
  "location" : {
    "type" : "multipolygon",
    "coordinates" : [
    [
      [[74.0060, 40.7128], 
      [71.0589, 42.3601], 
      [73.7562, 42.6526], 
      [74.0060, 40.7128]],
      
      [[72.6734,41.7658], 
      [72.6506, 41.5623], 
      [73.0515, 41.5582], 
      [72.6734, 41.7658]]
    ],
    [
      [[73.9776, 40.7614], 
      [73.9554, 40.7827], 
      [73.9631, 40.7812], 
      [73.9776, 40.7614]]
      ]
    ]
  }
}
```

以 WKT 格式索引一个多多边形：

```json
PUT testindex/_doc/4
{
  "location" : "MULTIPOLYGON (((40.7128 74.0060, 42.3601 71.0589, 42.6526 73.7562, 40.7128 74.0060), (41.7658 72.6734, 41.5623 72.6506, 41.5582 73.0515, 41.7658 72.6734)), ((73.9776 40.7614, 73.9554 40.7827, 73.9631 40.7812, 73.9776 40.7614)))"
}
```

## 几何集合

几何集合（geometry collection）是地理形状的集合，其中的形状可以是不同类型。

以 GeoJSON 格式索引一个几何集合：

```json
PUT testindex/_doc/7
{
  "location" : {
    "type": "geometrycollection",
    "geometries": [
      {
        "type": "point",
        "coordinates": [74.0060, 40.7128]
      },
      {
        "type": "linestring",
        "coordinates": [[73.7562, 42.6526], [72.6734, 41.7658]]
      }
    ]
  }
}
```

以 WKT 格式索引一个几何集合：

```json
PUT testindex/_doc/7
{
  "location" : "GEOMETRYCOLLECTION (POINT (74.0060 40.7128), LINESTRING(73.7562 42.6526, 72.6734 41.7658))"
}
```

## 包络

包络（envelope）是由左上角和右下角顶点指定的边界矩形。GeoJSON 格式为 `[[minLon, maxLat], [maxLon, minLat]]`。

以 GeoJSON 格式索引一个包络：

```json
PUT testindex/_doc/2
{
  "location" : {
    "type" : "envelope",
    "coordinates" : [[71.0589, 42.3601], [74.0060, 40.7128]]
  }
}
```

在 WKT 格式中，使用 `BBOX (minLon, maxLon, maxLat, minLat)`。

以 WKT BBOX 格式索引一个包络：

```json
PUT testindex/_doc/8
{
  "location" : "BBOX (71.0589, 74.0060, 42.3601, 40.7128)"
}
```

## 参数

下表列出了地理形状字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`coerce` | 一个布尔值，指定是否自动闭合未闭合的线性环。默认值为 `false`。
`ignore_malformed` | 一个布尔值，指定忽略格式错误的 GeoJSON 或 WKT 地理形状而不抛出异常。默认值为 `false`（地理形状格式错误时抛出异常）。
`ignore_z_value` | 仅适用于具有三个坐标的点。如果 `ignore_z_value` 为 `true`，则第三个坐标不会被索引，但仍会存储在 _source 字段中。如果 `ignore_z_value` 为 `false`，则会抛出异常。默认值为 `true`。
`orientation` | 指定地理形状坐标列表中顶点的遍历顺序。`orientation` 可取以下值：<br> 1. RIGHT：逆时针。使用以下任一字符串（大写或小写）指定 RIGHT 方向：`right`、`counterclockwise`、`ccw`。<br> 2. LEFT：顺时针。使用以下任一字符串（大写或小写）指定 LEFT 方向：`left`、`clockwise`、`cw`。该值可以被单个文档覆盖。<br> 默认值为 `RIGHT`。
