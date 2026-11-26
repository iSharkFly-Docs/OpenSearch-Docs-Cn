---
title: Geotile 网格
---

# Geotile 网格聚合

geotile 网格聚合（Aggregation）将文档（Document）分组到网格单元中以进行地理分析。每个网格单元对应一个[地图瓦片](https://en.wikipedia.org/wiki/Tiled_web_map)，并使用 `{zoom}/{x}/{y}` 格式进行标识。你可以使用 geotile 网格聚合对 [geopoint](/field-types/supported-field-types/geo-point) 或 [geoshape](/field-types/supported-field-types/geo-shape) 字段中的文档进行聚合。一个显著的区别是：geopoint 只会出现在一个桶（Bucket）中，而 geoshape 会计入与之相交的所有 geotile 网格单元。

## 精度

`precision` 参数控制决定网格单元大小的粒度级别。精度越低，网格单元越大。

以下示例演示了低精度和高精度的聚合请求。

首先，创建一个索引（Index），并将 `location` 字段映射为 `geo_point`：

```json
PUT national_parks
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      }
    }
  }
}
```

将以下文档（Document）索引到示例索引中：

```json
PUT national_parks/_doc/1
{
  "name": "Yellowstone National Park",
  "location": "44.42, -110.59" 
}
```

```json
PUT national_parks/_doc/2
{
  "name": "Yosemite National Park",
  "location": "37.87, -119.53" 
}
```

```json
PUT national_parks/_doc/3
{
  "name": "Death Valley National Park",
  "location": "36.53, -116.93" 
}
```

::: info 注意
你可以使用多种格式来索引 geopoint。有关所有支持格式的列表，请参阅 [geopoint 文档](/field-types/supported-field-types/geo-point#formats)。
:::

## 低精度请求

运行一个低精度请求，将全部三个文档归入同一个桶（Bucket）：

```json
GET national_parks/_search
{
  "aggregations": {
    "grouped": {
      "geotile_grid": {
        "field": "location",
        "precision": 1
      }
    }
  }
}
```

::: info 注意
geotile 网格聚合查询既可以使用 `GET` HTTP 方法，也可以使用 `POST` HTTP 方法。
:::

响应将所有文档分在了一组，因为它们距离足够近，可以归入同一个网格单元：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 51,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 3,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "national_parks",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "Yellowstone National Park",
          "location": "44.42, -110.59"
        }
      },
      {
        "_index": "national_parks",
        "_id": "2",
        "_score": 1,
        "_source": {
          "name": "Yosemite National Park",
          "location": "37.87, -119.53"
        }
      },
      {
        "_index": "national_parks",
        "_id": "3",
        "_score": 1,
        "_source": {
          "name": "Death Valley National Park",
          "location": "36.53, -116.93"
        }
      }
    ]
  },
  "aggregations": {
    "grouped": {
      "buckets": [
        {
          "key": "1/0/0",
          "doc_count": 3
        }
      ]
    }
  }
}
```
</details>

## 高精度请求

现在运行一个高精度请求：

```json
GET national_parks/_search
{
  "aggregations": {
    "grouped": {
      "geotile_grid": {
        "field": "location",
        "precision": 6
      }
    }
  }
}
```

由于粒度更高，三个文档被分别归入不同的桶：

<details open markdown="block">
  <summary>
    响应
  </summary>
  
```json
{
  "took": 15,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 3,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "national_parks",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "Yellowstone National Park",
          "location": "44.42, -110.59"
        }
      },
      {
        "_index": "national_parks",
        "_id": "2",
        "_score": 1,
        "_source": {
          "name": "Yosemite National Park",
          "location": "37.87, -119.53"
        }
      },
      {
        "_index": "national_parks",
        "_id": "3",
        "_score": 1,
        "_source": {
          "name": "Death Valley National Park",
          "location": "36.53, -116.93"
        }
      }
    ]
  },
  "aggregations": {
    "grouped": {
      "buckets": [
        {
          "key": "6/12/23",
          "doc_count": 1
        },
        {
          "key": "6/11/25",
          "doc_count": 1
        },
        {
          "key": "6/10/24",
          "doc_count": 1
        }
      ]
    }
  }
}
```
</details>

你还可以在 `bounds` 参数中提供边界范围的坐标来限制地理区域。`bounds` 和 `geo_bounding_box` 的坐标都可以使用任意一种 [geopoint 格式](/field-types/supported-field-types/geo-point#formats)来指定。以下查询（Query）对 `bounds` 参数使用了 Well-Known Text（WKT）"POINT(`longitude` `latitude`)" 格式：

```json
GET national_parks/_search
{
  "size": 0,
  "aggregations": {
    "grouped": {
      "geotile_grid": {
        "field": "location",
        "precision": 6,
        "bounds": {
            "top_left": "POINT (-120 38)",
            "bottom_right": "POINT (-116 36)"
        }
      }
    }
  }
}
```

响应中只包含位于指定边界内的两个结果：

<details open markdown="block">
  <summary>
    响应
  </summary>
  
```json
{
  "took": 48,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 3,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "national_parks",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "Yellowstone National Park",
          "location": "44.42, -110.59"
        }
      },
      {
        "_index": "national_parks",
        "_id": "2",
        "_score": 1,
        "_source": {
          "name": "Yosemite National Park",
          "location": "37.87, -119.53"
        }
      },
      {
        "_index": "national_parks",
        "_id": "3",
        "_score": 1,
        "_source": {
          "name": "Death Valley National Park",
          "location": "36.53, -116.93"
        }
      }
    ]
  },
  "aggregations": {
    "grouped": {
      "buckets": [
        {
          "key": "6/11/25",
          "doc_count": 1
        },
        {
          "key": "6/10/24",
          "doc_count": 1
        }
      ]
    }
  }
}
```
</details>

`bounds` 参数既可以与 `geo_bounding_box` 过滤器一起使用，也可以单独使用；这两个参数相互独立，彼此之间可以存在任意空间关系。

## 聚合 geoshape

要对 geoshape 字段执行聚合，首先创建一个索引，并将 `location` 字段映射为 `geo_shape`：

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
      "geotile_grid": {
        "field": "location",
        "precision": 6
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
    "grouped" : {
      "buckets" : [
        {
          "key" : "6/12/23",
          "doc_count" : 1
        },
        {
          "key" : "6/12/22",
          "doc_count" : 1
        },
        {
          "key" : "6/11/25",
          "doc_count" : 1
        },
        {
          "key" : "6/11/24",
          "doc_count" : 1
        },
        {
          "key" : "6/10/24",
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

Geotile 网格聚合请求支持以下参数。

参数 | 数据类型 | 描述
:--- | :--- | :---
field | String | 包含 geopoint 的字段。该字段必须映射为 `geo_point` 字段。如果该字段包含数组，则会聚合所有数组值。必需。
precision | Integer | 用于确定网格单元以对结果进行分桶的粒度级别。单元不能超过所需精度的指定大小（对角线）。有效值范围为 [0, 29]。可选。默认值为 7。
bounds | Object | 用于过滤 geopoint 的边界框。边界框由左上角和右下角顶点定义。顶点以 geopoint 的形式指定，可使用以下任一格式：<br>- 包含纬度和经度的对象<br>- [`longitude`, `latitude`] 格式的数组<br>- "`latitude`,`longitude`" 格式的字符串<br>- geohash<br>- WKT<br> 有关格式示例，请参阅 [geopoint 格式](/field-types/supported-field-types/geo-point#formats)。可选。
size | Integer | 要返回的最大桶数。当桶的数量多于 `size` 时，OpenSearch 返回包含文档较多的桶。可选。默认值为 10,000。
shard_size | Integer | 每个分片（Shard）返回的最大桶数。可选。默认值为 max (10, `size` &middot; 分片数)，这样可以为优先级更高的桶提供更准确的计数。
