---
title: 矩阵统计
---

# 矩阵统计聚合

`matrix_stats` 聚合（Aggregation）以矩阵形式为多个字段生成高级统计信息。
以下示例以矩阵形式返回 `taxful_total_price` 和 `products.base_price` 字段的高级统计信息：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "matrix_stats_taxful_total_price": {
      "matrix_stats": {
        "fields": ["taxful_total_price", "products.base_price"]
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "matrix_stats_taxful_total_price" : {
    "doc_count" : 4675,
    "fields" : [
      {
        "name" : "products.base_price",
        "count" : 4675,
        "mean" : 34.994239430147196,
        "variance" : 360.5035285833703,
        "skewness" : 5.530161335032702,
        "kurtosis" : 131.16306324042148,
        "covariance" : {
          "products.base_price" : 360.5035285833703,
          "taxful_total_price" : 846.6489362233166
        },
        "correlation" : {
          "products.base_price" : 1.0,
          "taxful_total_price" : 0.8444765264325268
        }
      },
      {
        "name" : "taxful_total_price",
        "count" : 4675,
        "mean" : 75.05542864304839,
        "variance" : 2788.1879749835402,
        "skewness" : 15.812149139924037,
        "kurtosis" : 619.1235507385902,
        "covariance" : {
          "products.base_price" : 846.6489362233166,
          "taxful_total_price" : 2788.1879749835402
        },
        "correlation" : {
          "products.base_price" : 0.8444765264325268,
          "taxful_total_price" : 1.0
        }
      }
    ]
  }
 }
}
```

下表列出了所有响应字段。

统计项 | 描述
:--- | :---
`count` | 测量的样本数量。
`mean` | 从样本中测得的字段平均值。
`variance` | 所测字段的值偏离其平均值的程度。方差越大，值偏离平均值的程度就越大。
`skewness` | 衡量字段值在平均值周围分布的不对称程度。
`kurtosis` | 衡量分布尾部厚度的指标。尾部越轻，峰度越小；尾部越重，峰度越大。要了解有关峰度的信息，请参阅 [Wikipedia](https://en.wikipedia.org/wiki/Kurtosis)。
`covariance` | 衡量两个字段之间联合变化程度的指标。正值表示它们的值朝同一方向变化，负值则相反。
`correlation` | 衡量两个字段之间关系强度的指标。有效值介于 [-1, 1] 之间。值为 -1 表示负相关，值为 1 表示正相关，值为 0 表示二者之间不存在可识别的关系。
