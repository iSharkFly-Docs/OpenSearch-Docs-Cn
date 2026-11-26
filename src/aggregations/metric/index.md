---
title: Metric aggregations
---

# Metric aggregations

Metric aggregations let you perform simple calculations such as finding the minimum, maximum, and average values of a field.

## Types of metric aggregations

There are two types of metric aggregations: single-value metric aggregations and multi-value metric aggregations.

### Single-value metric aggregations

Single-value metric aggregations return a single metric, for example, `sum`, `min`, `max`, `avg`, `cardinality`, or `value_count`.

### Multi-value metric aggregations

Multi-value metric aggregations return more than one metric. These include `stats`, `extended_stats`, `matrix_stats`, `percentile`, `percentile_ranks`, `geo_bound`, `top_hits`, and `scripted_metric`.

## Supported metric aggregations

OpenSearch supports the following metric aggregations:

- [Average](/aggregations/metric/average)
- [Cardinality](/aggregations/metric/cardinality)
- [Extended stats](/aggregations/metric/extended-stats)
- [Geobounds](/aggregations/metric/geobounds)
- [Matrix stats](/aggregations/metric/matrix-stats)
- [Maximum](/aggregations/metric/maximum)
- [Minimum](/aggregations/metric/minimum)
- [Percentile ranks](/aggregations/metric/percentile-ranks)
- [Percentile](/aggregations/metric/percentile)
- [Scripted metric](/aggregations/metric/scripted-metric)
- [Stats](/aggregations/metric/stats)
- [Sum](/aggregations/metric/sum)
- [Top hits](/aggregations/metric/top-hits)
- [Value count](/aggregations/metric/value-count)
