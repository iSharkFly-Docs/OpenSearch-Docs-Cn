---
title: 桶聚合
---

# 桶聚合

桶聚合（Bucket Aggregation）将文档（Document）集合归类为桶（Bucket）。桶聚合的类型决定了给定文档所属的桶。

你可以使用桶聚合来实现分面导航（通常以侧边栏的形式放在搜索结果页面上），帮助用户筛选结果。

## 支持的桶聚合

OpenSearch 支持以下桶聚合：

- [邻接矩阵（Adjacency matrix）](/aggregations/bucket/adjacency-matrix)
- [日期直方图（Date histogram）](/aggregations/bucket/date-histogram)
- [日期范围（Date range）](/aggregations/bucket/date-range)
- [多样化采样器（Diversified sampler）](/aggregations/bucket/diversified-sampler)
- [过滤器（Filter）](/aggregations/bucket/filter)
- [多过滤器（Filters）](/aggregations/bucket/filters)
- [地理距离（Geodistance）](/aggregations/bucket/geo-distance)
- [Geohash 网格（Geohash grid）](/aggregations/bucket/geohash-grid)
- [Geohex 网格（Geohex grid）](/aggregations/bucket/geohex-grid)
- [Geotile 网格（Geotile grid）](/aggregations/bucket/geotile-grid)
- [全局（Global）](/aggregations/bucket/global)
- [直方图（Histogram）](/aggregations/bucket/histogram)
- [IP 范围（IP range）](/aggregations/bucket/ip-range)
- [缺失（Missing）](/aggregations/bucket/missing)
- [多词项（Multi-terms）](/aggregations/bucket/multi-terms)
- [嵌套（Nested）](/aggregations/bucket/nested)
- [范围（Range）](/aggregations/bucket/range)
- [反向嵌套（Reverse nested）](/aggregations/bucket/reverse-nested)
- [采样器（Sampler）](/aggregations/bucket/sampler)
- [显著词项（Significant terms）](/aggregations/bucket/significant-terms)
- [显著文本（Significant text）](/aggregations/bucket/significant-text)
- [词项（Terms）](/aggregations/bucket/terms)
