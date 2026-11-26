---
title: 地理和 xy 查询
---

# 地理和 xy 查询

地理和 xy 查询（Geographic and xy Query）用于搜索包含地图或坐标平面上的点和形状的字段。地理查询作用于地理空间数据，而 xy 查询作用于二维坐标数据。在所有地理查询中，geoshape 查询与 xy 查询非常相似，区别在于前者搜索[地理字段](/field-types/supported-field-types/geographic)，后者搜索[笛卡尔字段](/field-types/supported-field-types/xy)。

## xy 查询

[xy 查询](/query-dsl/geo-and-xy/xy)用于搜索在笛卡尔坐标系中包含几何图形的文档（Document）。这些几何图形可以存储在 [`xy_point`](/field-types/supported-field-types/xy-point) 字段中（支持点），也可以存储在 [`xy_shape`](/field-types/supported-field-types/xy-shape) 字段中（支持点、线、圆和多边形）。 

xy 查询返回包含以下内容的文档：
- 与给定形状存在以下四种空间关系之一的 xy 形状和 xy 点：`INTERSECTS`、`DISJOINT`、`WITHIN` 或 `CONTAINS`。
- 与给定形状相交的 xy 点。

## 地理查询

地理查询用于搜索包含地理空间几何图形的文档。这些几何图形可以存储在 [`geo_point`](/field-types/supported-field-types/geo-point) 字段中（支持地图上的点），也可以存储在 [`geo_shape`](/field-types/supported-field-types/geo-shape) 字段中（支持点、线、圆和多边形）。 

OpenSearch 提供以下地理查询类型：

- [**地理边界框查询**](/query-dsl/geo-and-xy/geo-bounding-box)：返回 geopoint 字段值位于边界框内的文档。 
- **地理距离查询**：返回 geopoint 与给定 geopoint 的距离在指定范围内的文档。
- **地理多边形查询**：返回 geopoint 位于多边形内的文档。
- **地理形状查询**：返回包含以下内容的文档：
    - 与给定形状存在以下四种空间关系之一的 geoshape 和 geopoint：`INTERSECTS`、`DISJOINT`、`WITHIN` 或 `CONTAINS`。
    - 与给定形状相交的 geopoint。
