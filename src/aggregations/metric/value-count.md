---
title: Value count
---

# Value count aggregations

The `value_count` metric is a single-value metric aggregation that calculates the number of values that an aggregation is based on.

For example, you can use the `value_count` metric with the `avg` metric to find how many numbers the aggregation uses to calculate an average value.

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
   "aggs": {
    "number_of_values": {
      "value_count": {
        "field": "taxful_total_price"
      }
    }
  }
}
```

#### Example response

```json
...
  "aggregations" : {
    "number_of_values" : {
      "value" : 4675
    }
  }
}
```
