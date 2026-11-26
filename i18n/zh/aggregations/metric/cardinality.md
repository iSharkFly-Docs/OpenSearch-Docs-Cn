---
title: 基数
---

# 基数聚合

`cardinality` 指标是一种单值指标聚合（Metric Aggregation），用于统计字段中唯一值（即不同值）的数量。

以下示例查找电子商务商店中不同产品的数量：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "unique_products": {
      "cardinality": {
        "field": "products.product_id"
      }
    }
  }
}
```

#### 示例响应

```json
...
  "aggregations" : {
    "unique_products" : {
      "value" : 7033
    }
  }
}
```

基数计数是近似值。
如果你假想的商店中有数万种产品，精确计算基数就需要将所有值加载到一个哈希集合中，并返回该集合的大小。这种方法的可扩展性很差，它需要占用大量内存，并可能导致很高的延迟。

你可以通过 `precision_threshold` 设置来控制内存与准确性之间的权衡。该设置定义了一个阈值，低于此阈值时，计数预计会接近精确值；高于此值时，计数的准确性可能会有所下降。`precision_threshold` 的默认值为 3,000，支持的最大值为 40,000。

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "unique_products": {
      "cardinality": {
        "field": "products.product_id",
        "precision_threshold": 10000
      }
    }
  }
}
```
