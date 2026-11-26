---
title: 笛卡尔字段类型
---

# 笛卡尔字段类型

笛卡尔字段类型便于在二维笛卡尔坐标系中索引和搜索点与形状。笛卡尔字段类型与[地理](/field-types/supported-field-types/geographic)字段类型类似，区别在于它们表示的是笛卡尔平面上的点和形状，而笛卡尔平面并不基于地固地球参考系。在平面上计算距离比在球面上计算距离更高效，因此笛卡尔字段类型的距离排序速度更快。 

笛卡尔字段类型非常适合虚拟现实、计算机辅助设计（CAD）以及游乐园和体育场馆地图绘制等空间应用。 

笛卡尔字段类型的坐标是单精度浮点值。有关浮点值的范围和精度，请参阅[数值字段类型](/field-types/supported-field-types/numeric)。

下表列出了 OpenSearch 支持的所有笛卡尔字段类型。

字段数据类型 | 描述
:--- | :---  
[`xy_point`](/field-types/supported-field-types/xy-point) | 二维笛卡尔坐标系中的一个点，由 x 和 y 坐标指定。 
[`xy_shape`](/field-types/supported-field-types/xy-shape) | 二维笛卡尔坐标系中的一个形状，例如多边形或 xy 点的集合。 

::: info 注意
目前，OpenSearch 支持索引和搜索笛卡尔字段类型，但不支持对笛卡尔字段类型进行聚合（Aggregation）。如果希望实现聚合功能，请提交 [GitHub issue](https://github.com/opensearch-project/geospatial)。
:::
