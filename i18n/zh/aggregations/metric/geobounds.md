---
title: 地理边界
---

## 地理边界聚合

`geo_bounds` 指标是一种多值指标聚合（Metric Aggregation），用于计算包含给定 `geo_point` 或 `geo_shape` 字段所有值的[地理边界框](https://docs.ogc.org/is/12-063r5/12-063r5.html#30)。边界框以矩形左上角和右下角顶点的经纬度形式返回。

以下示例返回 `geoip.location` 字段的 `geo_bounds` 指标：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "geo": {
      "geo_bounds": {
        "field": "geoip.location"
      }
    }
  }
}
```

#### 示例响应

```json
"aggregations" : {
  "geo" : {
    "bounds" : {
      "top_left" : {
        "lat" : 52.49999997206032,
        "lon" : -118.20000001229346
      },
      "bottom_right" : {
        "lat" : 4.599999985657632,
        "lon" : 55.299999956041574
      }
    }
  }
 }
}
```

## 聚合 geoshape

要对 geoshape 字段执行聚合，首先创建一个索引（Index），并将 `location` 字段映射为 `geo_shape`：

```json
PUT national_parks
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

接下来，向 `national_parks` 索引中索引一些文档（Document）：

```json
PUT national_parks/_doc/1
{
  "name": "Yellowstone National Park",
  "location":
  {"type": "envelope","coordinates": [ [-111.15, 45.12], [-109.83, 44.12] ]}
}
```

```json
PUT national_parks/_doc/2
{
  "name": "Yosemite National Park",
  "location": 
  {"type": "envelope","coordinates": [ [-120.23, 38.16], [-119.05, 37.45] ]}
}
```

```json
PUT national_parks/_doc/3
{
  "name": "Death Valley National Park",
  "location": 
  {"type": "envelope","coordinates": [ [-117.34, 37.01], [-116.38, 36.25] ]}
}
```

你可以按如下方式对 `location` 字段执行 `geo_bounds` 聚合：

```json
GET national_parks/_search
{
  "aggregations": {
    "grouped": {
      "geo_bounds": {
        "field": "location",
        "wrap_longitude": true
      }
    }
  }
}
```

可选参数 `wrap_longitude` 指定聚合返回的边界框是否可以跨越国际日期变更线（180&deg; 经线）。如果将 `wrap_longitude` 设置为 `true`，边界框就可以跨越国际日期变更线，并返回一个左下角经度大于右上角经度的 `bounds` 对象。`wrap_longitude` 的默认值为 `true`。

响应中包含能够包围 `location` 字段中所有形状的地理边界框：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 3,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "national_parks",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "Yellowstone National Park",
          "location" : {
            "type" : "envelope",
            "coordinates" : [
              [
                -111.15,
                45.12
              ],
              [
                -109.83,
                44.12
              ]
            ]
          }
        }
      },
      {
        "_index" : "national_parks",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "name" : "Yosemite National Park",
          "location" : {
            "type" : "envelope",
            "coordinates" : [
              [
                -120.23,
                38.16
              ],
              [
                -119.05,
                37.45
              ]
            ]
          }
        }
      },
      {
        "_index" : "national_parks",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "name" : "Death Valley National Park",
          "location" : {
            "type" : "envelope",
            "coordinates" : [
              [
                -117.34,
                37.01
              ],
              [
                -116.38,
                36.25
              ]
            ]
          }
        }
      }
    ]
  },
  "aggregations" : {
    "Grouped" : {
      "bounds" : {
        "top_left" : {
          "lat" : 45.11999997776002,
          "lon" : -120.23000006563962
        },
        "bottom_right" : {
          "lat" : 36.249999976716936,
          "lon" : -109.83000006526709
        }
      }
    }
  }
}
```
</details>

::: info 注意
目前，OpenSearch 支持通过 API 执行 geoshape 聚合，但 OpenSearch Dashboards 可视化尚不支持。如果你希望在可视化中实现 geoshape 聚合，请为相关的 [GitHub issue](https://github.com/opensearch-project/dashboards-maps/issues/250) 投票。
:::
