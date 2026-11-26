---
title: 地理距离
---

# 地理距离聚合

`geo_distance` 聚合（Aggregation）根据与原点 `geo_point` 字段之间的距离，将文档（Document）分组到一系列同心圆中。
它与 `range` 聚合相同，区别在于它作用于地理位置。

例如，你可以使用 `geo_distance` 聚合查找距离你 1 km 以内的所有披萨店。搜索结果被限制在你指定的 1 km 半径内，但你也可以再添加 2 km 以内的结果。

`geo_distance` 聚合只能用于映射（Mapping）为 `geo_point` 的字段。

点是单个地理坐标，例如智能手机上显示的你的当前位置。在 OpenSearch 中，点的表示方式如下：

```json
{
  "location": {
    "type": "point",
    "coordinates": {
      "lat": 83.76,
      "lon": -81.2
    }
  }
}
```

你也可以将纬度和经度指定为数组 `[-81.20, 83.76]` 或字符串 `"83.76, -81.20"`

下表列出了 `geo_distance` 聚合的相关字段：

字段 | 描述 | 必需
:--- | :--- |:---
`field` |  指定要处理的地理点字段。 | 是
`origin` |  指定用于计算距离的起始地理点。 | 是
`ranges`  |  指定一个范围列表，根据文档与目标点之间的距离来收集文档。 | 是
`unit` |  定义 `ranges` 数组中使用的单位。`unit` 默认为 `m`（米），但你可以切换为其他单位，例如 `km`（千米）、`mi`（英里）、`in`（英寸）、`yd`（码）、`cm`（厘米）和 `mm`（毫米）。 | 否
`distance_type` | 指定 OpenSearch 计算距离的方式。默认值为 `sloppy_arc`（速度较快但精度较低），也可以设置为 `arc`（速度较慢但精度最高）或 `plane`（速度最快但精度最低）。由于误差较大，`plane` 只应用于较小的地理区域。 | 否

语法如下：

```json
{
  "aggs": {
    "aggregation_name": {
      "geo_distance": {
        "field": "field_1",
        "origin": "x, y",
        "ranges": [
          {
            "to": "value_1"
          },
          {
            "from": "value_2",
            "to": "value_3"
          },
          {
            "from": "value_4"
          }
        ]
      }
    }
  }
}
```

此示例根据与 `geo-point` 字段之间的以下距离来构建桶（Bucket）：

- 小于 10 km
- 10 至 20 km
- 20 至 50 km
- 50 至 100 km
- 大于 100 km

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "position": {
      "geo_distance": {
        "field": "geo.coordinates",
        "origin": {
          "lat": 83.76,
          "lon": -81.2
        },
        "ranges": [
          {
            "to": 10
          },
          {
            "from": 10,
            "to": 20
          },
          {
            "from": 20,
            "to": 50
          },
          {
            "from": 50,
            "to": 100
          },
          {
            "from": 100
          }
        ]
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "position" : {
    "buckets" : [
      {
        "key" : "*-10.0",
        "from" : 0.0,
        "to" : 10.0,
        "doc_count" : 0
      },
      {
        "key" : "10.0-20.0",
        "from" : 10.0,
        "to" : 20.0,
        "doc_count" : 0
      },
      {
        "key" : "20.0-50.0",
        "from" : 20.0,
        "to" : 50.0,
        "doc_count" : 0
      },
      {
        "key" : "50.0-100.0",
        "from" : 50.0,
        "to" : 100.0,
        "doc_count" : 0
      },
      {
        "key" : "100.0-*",
        "from" : 100.0,
        "doc_count" : 14074
      }
    ]
  }
 }
}
```
