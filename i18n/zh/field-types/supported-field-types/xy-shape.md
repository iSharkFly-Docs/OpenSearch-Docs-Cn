---
title: xy shape
---

# xy shape 字段类型

xy shape 字段类型包含一个形状，例如多边形或 xy 点的集合。它基于 Lucene 的 [XYShape](https://lucene.apache.org/core/9_3_0/core/org/apache/lucene/document/XYShape.html) 字段类型。为了索引 xy shape，OpenSearch 会将形状剖分为三角网格，并将每个三角形存储在 BKD 树（一组平衡的 k 维树）中。这可以提供 10<sup>-7</sup> 十进制度的精度，代表近乎完美的空间分辨率。

xy shape 字段类型与 [geoshape](/field-types/supported-field-types/geo-shape) 字段类型类似，但它表示的是笛卡尔平面上的形状，而笛卡尔平面并不基于地固地球参考系。xy shape 的坐标是单精度浮点值。有关浮点值的范围和精度，请参阅[数值字段类型](/field-types/supported-field-types/numeric)。

## 示例

创建一个包含 xy shape 字段类型的映射（Mapping）：

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "location": {
        "type": "xy_shape"
      }
    }
  }
}
```

## 格式

xy shape 可以按以下格式进行索引：

- [GeoJSON](https://geojson.org/)
- [熟知文本（Well-known Text，WKT）](https://docs.opengeospatial.org/is/12-063r5/12-063r5.html)

::: info 注意
无论是 GeoJSON 还是 WKT，坐标数组中的坐标都必须按 `x, y` 的顺序指定。
:::

## xy shape 类型

下表介绍了可用的 xy shape 类型及其与 GeoJSON 和 WKT 类型的对应关系。

OpenSearch 类型 | GeoJSON 类型 | WKT 类型 | 描述 
:--- | :--- | :--- | :--- 
[`point`](#point) | Point | POINT | 由 x 和 y 坐标指定的地理点。 
[`linestring`](#linestring) | LineString | LINESTRING | 由两个或更多点指定的线。可以是一条直线，也可以是由相连线段组成的路径。
[`polygon`](#polygon) | Polygon | POLYGON | 由坐标形式的顶点列表指定的多边形。多边形必须闭合，即最后一个点必须与第一个点相同。因此，创建一个 n 边形需要 n+1 个顶点。顶点的最少数量为四个，即创建一个三角形。
[`multipoint`](#multipoint) | MultiPoint | MULTIPOINT | 一组互不相连但彼此相关的离散点构成的数组。
[`multilinestring`](#multilinestring) | MultiLineString | MULTILINESTRING | linestring 数组。
[`multipolygon`](#multipolygon) | MultiPolygon | MULTIPOLYGON | 多边形数组。
[`geometrycollection`](#geometry-collection) | GeometryCollection | GEOMETRYCOLLECTION | 可以包含不同类型的 xy shape 的集合。
[`envelope`](#envelope) | N/A | BBOX | 由左上角和右下角顶点指定的边界矩形。

## Point

point 由一对坐标指定。 

以 GeoJSON 格式索引一个 point：

```json
PUT testindex/_doc/1
{
  "location" : {
    "type" : "point",
    "coordinates" : [0.5, 4.5]        
  }
}
```

以 WKT 格式索引一个 point：

```json
PUT testindex/_doc/1
{
  "location" : "POINT (0.5 4.5)"        
}
```

## Linestring

linestring 是由两个或更多点指定的线。如果这些点共线，则 linestring 是一条直线；否则，linestring 表示由线段组成的路径。

以 GeoJSON 格式索引一个 linestring：

```json
PUT testindex/_doc/2
{
  "location" : {
    "type" : "linestring",
    "coordinates" : [[0.5, 4.5], [-1.5, 2.3]]
  }
}
```

以 WKT 格式索引一个 linestring：

```json
PUT testindex/_doc/2
{
  "location" : "LINESTRING (0.5 4.5, -1.5 2.3)"
}
```

## Polygon

polygon 由坐标形式的顶点列表指定。多边形必须闭合，即最后一个点必须与第一个点相同。在下面的示例中，使用四个点创建了一个三角形。 

::: info 注意
GeoJSON 要求按逆时针顺序列出多边形的顶点，WKT 则不要求顶点的特定顺序。
:::

以 GeoJSON 格式索引一个多边形（三角形）：

```json
PUT testindex/_doc/3
{
  "location" : {
    "type" : "polygon",
    "coordinates" : [
      [[0.5, 4.5], 
      [2.5, 6.0], 
      [1.5, 2.0], 
      [0.5, 4.5]]
    ]
  }
}
```

以 WKT 格式索引一个多边形（三角形）：

```json
PUT testindex/_doc/3
{
  "location" : "POLYGON ((0.5 4.5, 2.5 6.0, 1.5 2.0, 0.5 4.5))"
}
```

多边形内部可以有洞。在这种情况下，`coordinates` 字段将包含多个数组。第一个数组表示外部多边形，之后的每个数组各表示一个洞。洞以多边形表示，并以坐标数组的形式指定。

::: info 注意
GeoJSON 要求按逆时针顺序列出多边形的顶点，并按顺时针顺序列出洞的顶点。WKT 则不要求顶点的特定顺序。
:::

以 GeoJSON 格式索引一个带有三角形洞的多边形（三角形）：

```json
PUT testindex/_doc/4
{
  "location" : {
    "type" : "polygon",
    "coordinates" : [
      [[0.5, 4.5], 
      [2.5, 6.0], 
      [1.5, 2.0], 
      [0.5, 4.5]],
      
      [[1.0, 4.5], 
      [1.5, 4.5], 
      [1.5, 4.0], 
      [1.0, 4.5]]
    ]
  }
}
```

以 WKT 格式索引一个带有三角形洞的多边形（三角形）：

```json
PUT testindex/_doc/4
{
  "location" : "POLYGON ((0.5 4.5, 2.5 6.0, 1.5 2.0, 0.5 4.5), (1.0 4.5, 1.5 4.5, 1.5 4.0, 1.0 4.5))"
}
```

默认情况下，多边形的顶点按逆时针顺序遍历。可以在映射时定义 [`orientation`](#parameters) 参数来指定顶点的遍历顺序：

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "location": {
        "type": "xy_shape",
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
      [[0.5, 4.5], 
      [2.5, 6.0], 
      [1.5, 2.0], 
      [0.5, 4.5]]
    ]
  }
}
```

## Multipoint

multipoint 是一组互不相连但彼此相关的离散点构成的数组。 

以 GeoJSON 格式索引一个 multipoint：

```json
PUT testindex/_doc/6
{
  "location" : {
    "type" : "multipoint",
    "coordinates" : [
      [0.5, 4.5], 
      [2.5, 6.0]
    ]
  }
}
```

以 WKT 格式索引一个 multipoint：

```json
PUT testindex/_doc/6
{
  "location" : "MULTIPOINT (0.5 4.5, 2.5 6.0)"
}
```

## Multilinestring

multilinestring 是 linestring 数组。

以 GeoJSON 格式索引一个 multilinestring：

```json
PUT testindex/_doc/2
{
  "location" : {
    "type" : "multilinestring",
    "coordinates" : [
      [[0.5, 4.5], [2.5, 6.0]],
      [[1.5, 2.0], [3.5, 3.5]]
      ]
  }
}
```

以 WKT 格式索引一个 linestring：

```json
PUT testindex/_doc/2
{
  "location" : "MULTILINESTRING ((0.5 4.5, 2.5 6.0), (1.5 2.0, 3.5 3.5))"
}
```

## Multipolygon

multipolygon 是多边形数组。在本示例中，第一个多边形包含一个洞，第二个则没有。 

以 GeoJSON 格式索引一个 multipolygon：

```json
PUT testindex/_doc/4
{
  "location" : {
    "type" : "multipolygon",
    "coordinates" : [
    [
      [[0.5, 4.5], 
      [2.5, 6.0], 
      [1.5, 2.0], 
      [0.5, 4.5]],
      
      [[1.0, 4.5], 
      [1.5, 4.5], 
      [1.5, 4.0], 
      [1.0, 4.5]]
    ],
    [
      [[2.0, 0.0], 
      [1.0, 2.0], 
      [3.0, 1.0], 
      [2.0, 0.0]]
      ]
    ]
  }
}
```

以 WKT 格式索引一个 multipolygon：

```json
PUT testindex/_doc/4
{
  "location" : "MULTIPOLYGON (((0.5 4.5, 2.5 6.0, 1.5 2.0, 0.5 4.5), (1.0 4.5, 1.5 4.5, 1.5 4.0, 1.0 4.5)), ((2.0 0.0, 1.0 2.0, 3.0 1.0, 2.0 0.0)))"
}
```

## Geometry collection

geometry collection 是可以包含不同类型的 xy shape 的集合。

以 GeoJSON 格式索引一个 geometry collection：

```json
PUT testindex/_doc/7
{
  "location" : {
    "type": "geometrycollection",
    "geometries": [
      {
        "type": "point",
        "coordinates": [0.5, 4.5]
      },
      {
        "type": "linestring",
        "coordinates": [[2.5, 6.0], [1.5, 2.0]]
      }
    ]
  }
}
```

以 WKT 格式索引一个 geometry collection：

```json
PUT testindex/_doc/7
{
  "location" : "GEOMETRYCOLLECTION (POINT (0.5 4.5), LINESTRING(2.5 6.0, 1.5 2.0))"
}
```

## Envelope

envelope 是由左上角和右下角顶点指定的边界矩形。其 GeoJSON 格式为 `[[minX, maxY], [maxX, minY]]`。

以 GeoJSON 格式索引一个 envelope：

```json
PUT testindex/_doc/2
{
  "location" : {
    "type" : "envelope",
    "coordinates" : [[3.0, 2.0], [6.0, 0.0]]
  }
}
```

在 WKT 格式中，请使用 `BBOX (minX, maxY, maxX, minY)`。

以 WKT BBOX 格式索引一个 envelope：

```json
PUT testindex/_doc/8
{
  "location" : "BBOX (3.0, 2.0, 6.0, 0.0)"
}
```

## 参数

下表列出了 xy shape 字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`coerce` | 一个布尔值，指定是否自动闭合未闭合的线性环。默认值为 `false`。
`ignore_malformed` | 一个布尔值，指定是否忽略格式错误的 GeoJSON 或 WKT xy shape 而不抛出异常。默认值为 `false`（xy shape 格式错误时抛出异常）。
`ignore_z_value` | 仅适用于具有三个坐标的点。如果 `ignore_z_value` 为 `true`，第三个坐标不会被索引，但仍会存储在 _source 字段中。如果 `ignore_z_value` 为 `false`，则会抛出异常。默认值为 `true`。
`orientation` | 指定 xy shape 坐标列表中顶点的遍历顺序。`orientation` 可取以下值：<br> 1. RIGHT：逆时针。使用以下任一字符串（大小写均可）指定 RIGHT 方向：`right`、`counterclockwise`、`ccw`。<br> 2. LEFT：顺时针。使用以下任一字符串（大小写均可）指定 LEFT 方向：`left`、`clockwise`、`cw`。该值可以被单个文档覆盖。<br> 默认值为 `RIGHT`。
