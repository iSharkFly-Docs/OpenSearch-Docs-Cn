---
title: Geohash 网格
---

# Geohash 网格聚合

`geohash_grid` 聚合（Aggregation）将文档（Document）分入桶（Bucket）中以进行地理分析。它将一个地理区域划分为由不同大小或精度的较小区域组成的网格。精度值越低，代表的地理区域越大；精度值越高，代表的地理区域越小、越精确。你可以使用 geohash 网格聚合对 [geopoint](/field-types/supported-field-types/geo-point) 或 [geoshape](/field-types/supported-field-types/geo-shape) 字段中的文档进行聚合。一个显著的区别是：geopoint 只会出现在一个桶中，而 geoshape 会计入与之相交的所有 geohash 网格单元。

查询（Query）返回的结果可能多到无法在地图上逐个显示每个 geopoint。`geohash_grid` 聚合按照你定义的精度级别（介于 1 到 12 之间，默认为 5）计算每个点的 geohash，从而将邻近的 geopoint 归入同一个桶中。要了解有关 geohash 的更多信息，请参阅 [Wikipedia](https://en.wikipedia.org/wiki/Geohash)。

Web 日志示例数据分布在较大的地理区域中，因此可以使用较低的精度值。你可以通过提高精度值来放大此地图：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "geo_hash": {
      "geohash_grid": {
        "field": "geo.coordinates",
        "precision": 4
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "geo_hash" : {
    "buckets" : [
      {
        "key" : "c1cg",
        "doc_count" : 104
      },
      {
        "key" : "dr5r",
        "doc_count" : 26
      },
      {
        "key" : "9q5b",
        "doc_count" : 20
      },
      {
        "key" : "c20g",
        "doc_count" : 19
      },
      {
        "key" : "dr70",
        "doc_count" : 18
      }
      ...
    ]
  }
 }
}
```

你可以使用 OpenSearch Dashboards 在地图上可视化聚合响应。

你希望聚合越精确，OpenSearch 消耗的资源就越多，因为聚合需要计算的桶数量会随之增加。默认情况下，OpenSearch 生成的桶不会超过 10,000 个。你可以使用 `size` 属性更改此行为，但请记住，对于包含数千个桶的超大范围查询，性能可能会受到影响。

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

接下来，向 `national_parks` 索引中索引一些文档：

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

你可以按如下方式对 `location` 字段执行聚合：

```json
GET national_parks/_search
{
  "aggregations": {
    "grouped": {
      "geohash_grid": {
        "field": "location",
        "precision": 1
      }
    }
  }
}
```

聚合 geoshape 时，一个 geoshape 可能会被计入多个桶，因为它与多个网格单元重叠：

<details open markdown="block">
  <summary>
    响应
  </summary>
  
```json
{
  "took" : 24,
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
    "grouped" : {
      "buckets" : [
        {
          "key" : "9",
          "doc_count" : 3
        },
        {
          "key" : "c",
          "doc_count" : 1
        }
      ]
    }
  }
}
```
</details>

::: info 注意
目前，OpenSearch 支持通过 API 执行 geoshape 聚合，但 OpenSearch Dashboards 可视化尚不支持。如果你希望在可视化中实现 geoshape 聚合，请为相关的 [GitHub issue](https://github.com/opensearch-project/dashboards-maps/issues/250) 投票。
:::

## 支持的参数

Geohash 网格聚合请求支持以下参数。

参数 | 数据类型 | 描述
:--- | :--- | :---
field | String | 执行聚合的字段。该字段必须映射为 `geo_point` 或 `geo_shape` 字段。如果该字段包含数组，则会聚合所有数组值。必需。
precision | Integer | 用于确定网格单元以对结果进行分桶的粒度级别。单元不能超过所需精度的指定大小（对角线）。有效值范围为 [0, 12]。可选。默认值为 5。
bounds | Object | 用于过滤 geopoint 和 geoshape 的边界框。边界框由左上角和右下角顶点定义。只有与该边界框相交或完全被该边界框包围的形状才会包含在聚合输出中。顶点以 geopoint 的形式指定，可使用以下任一格式：<br>- 包含纬度和经度的对象<br>- [`longitude`, `latitude`] 格式的数组<br>- "`latitude`,`longitude`" 格式的字符串<br>- geohash<br>- WKT<br> 有关格式示例，请参阅 [geopoint 格式](/field-types/supported-field-types/geo-point#formats)。可选。
size | Integer | 要返回的最大桶数。当桶的数量多于 `size` 时，OpenSearch 返回包含文档较多的桶。可选。默认值为 10,000。
shard_size | Integer | 每个分片（Shard）返回的最大桶数。可选。默认值为 max (10, `size` &middot; 分片数)，这样可以为优先级更高的桶提供更准确的计数。

## Geohash 精度

下表描述了 geohash 精度与网格单元近似尺寸之间的关系。

精度 /<br>geohash 长度 | 纬度位数 | 经度位数 | 纬度误差 | 经度误差 | 单元高度 | 单元宽度
:---:|:-------------:|:--------------:|:--------------:|:---------------:|:-----------:|:----------:
  1  |       2       |       3        |      ±23       |       ±23       |  4992.6 km  | 5009.4 km  
  2  |       5       |       5        |      ±2.8      |      ±5.6       |  624.1 km   | 1252.3 km  
  3  |       7       |       8        |     ±0.70      |      ±0.70      |   156 km    |  156.5 km  
  4  |      10       |       10       |     ±0.087     |      ±0.18      |   19.5 km   |  39.1 km   
  5  |      12       |       13       |     ±0.022     |     ±0.022      |   4.9 km    |   4.9 km   
  6  |      15       |       15       |    ±0.0027     |     ±0.0055     |   609.4 m   |   1.2 km   
  7  |      17       |       18       |    ±0.00068    |    ±0.00068     |   152.5 m   |  152.9 m   
  8  |      20       |       20       |    ±0.00086    |    ±0.000172    |    19 m     |   38.2 m   
  9  |      22       |       23       |   ±0.000021    |    ±0.000021    |    4.8 m    |   4.8 m    
 10  |      25       |       25       |  ±0.00000268   |   ±0.00000536   |   59.5 cm   |   1.2 m    
 11  |      27       |       28       |  ±0.00000067   |   ±0.00000067   |   14.9 cm   |  14.9 cm   
 12  |      30       |       30       |  ±0.00000008   |   ±0.00000017   |   1.9 cm    |   3.7 cm
