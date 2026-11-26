---
title: 指标聚合
---

# 指标聚合

指标聚合（Metric Aggregation）可以让你执行简单的计算，例如求字段的最小值、最大值和平均值。

## 指标聚合的类型

指标聚合分为两种类型：单值指标聚合和多值指标聚合。

### 单值指标聚合

单值指标聚合返回单个指标，例如 `sum`、`min`、`max`、`avg`、`cardinality` 或 `value_count`。

### 多值指标聚合

多值指标聚合返回多个指标，包括 `stats`、`extended_stats`、`matrix_stats`、`percentile`、`percentile_ranks`、`geo_bound`、`top_hits` 和 `scripted_metric`。

## 支持的指标聚合

OpenSearch 支持以下指标聚合：

- [平均值（Average）](/aggregations/metric/average)
- [基数（Cardinality）](/aggregations/metric/cardinality)
- [扩展统计（Extended stats）](/aggregations/metric/extended-stats)
- [地理边界（Geobounds）](/aggregations/metric/geobounds)
- [矩阵统计（Matrix stats）](/aggregations/metric/matrix-stats)
- [最大值（Maximum）](/aggregations/metric/maximum)
- [最小值（Minimum）](/aggregations/metric/minimum)
- [百分位排名（Percentile ranks）](/aggregations/metric/percentile-ranks)
- [百分位数（Percentile）](/aggregations/metric/percentile)
- [脚本指标（Scripted metric）](/aggregations/metric/scripted-metric)
- [统计（Stats）](/aggregations/metric/stats)
- [求和（Sum）](/aggregations/metric/sum)
- [热门命中（Top hits）](/aggregations/metric/top-hits)
- [值计数（Value count）](/aggregations/metric/value-count)
