---
title: Geohex 网格
---

# Geohex 网格聚合

六边形分层地理空间索引系统（Hexagonal Hierarchical Geospatial Indexing System，H3）将地球表面划分为可识别的六边形单元。

H3 网格系统克服了 Geohash 分区不均匀的局限，因此非常适合邻近性应用。Geohash 对经纬度对进行编码，导致两极附近的分区明显更小，而赤道附近的分区则相当于一个经度。相比之下，H3 网格系统的形变很小，并且仅限于 122 个分区中的 5 个。这五个分区被放置在很少使用的区域（例如大洋中央），从而使重要区域没有误差。因此，基于 H3 网格系统对文档（Document）进行分组，可以获得比 Geohash 网格更好的聚合（Aggregation）效果。

geohex 网格聚合将 [geopoint](/field-types/supported-field-types/geo-point) 分组到网格单元中以进行地理分析。每个网格单元对应一个 [H3 单元](https://h3geo.org/docs/core-library/h3Indexing/#h3-cell-indexp)，并使用 [H3Index 表示法](https://h3geo.org/docs/core-library/h3Indexing/#h3index-representation)进行标识。

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
      "geohex_grid": {
        "field": "location",
        "precision": 1
      }
    }
  }
}
```

::: info 注意
geohex 网格聚合查询既可以使用 `GET` HTTP 方法，也可以使用 `POST` HTTP 方法。
:::

响应将文档 2 和文档 3 分在了一组，因为它们距离足够近，可以归入同一个网格单元：

```json
{
  "took" : 4,
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
          "location" : "44.42, -110.59"
        }
      },
      {
        "_index" : "national_parks",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "name" : "Yosemite National Park",
          "location" : "37.87, -119.53"
        }
      },
      {
        "_index" : "national_parks",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "name" : "Death Valley National Park",
          "location" : "36.53, -116.93"
        }
      }
    ]
  },
  "aggregations" : {
    "grouped" : {
      "buckets" : [
        {
          "key" : "8129bffffffffff",
          "doc_count" : 2
        },
        {
          "key" : "8128bffffffffff",
          "doc_count" : 1
        }
      ]
    }
  }
}
```

## 高精度请求

现在运行一个高精度请求：

```json
GET national_parks/_search
{
  "aggregations": {
    "grouped": {
      "geohex_grid": {
        "field": "location",
        "precision": 6
      }
    }
  }
}
```

由于粒度更高，三个文档被分别归入不同的桶：

```json
{
  "took" : 5,
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
          "location" : "44.42, -110.59"
        }
      },
      {
        "_index" : "national_parks",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "name" : "Yosemite National Park",
          "location" : "37.87, -119.53"
        }
      },
      {
        "_index" : "national_parks",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "name" : "Death Valley National Park",
          "location" : "36.53, -116.93"
        }
      }
    ]
  },
  "aggregations" : {
    "grouped" : {
      "buckets" : [
        {
          "key" : "8629ab6dfffffff",
          "doc_count" : 1
        },
        {
          "key" : "8629857a7ffffff",
          "doc_count" : 1
        },
        {
          "key" : "862896017ffffff",
          "doc_count" : 1
        }
      ]
    }
  }
}
```

## 过滤请求

高精度请求会消耗大量资源，因此我们建议使用 `geo_bounding_box` 之类的过滤器来限制地理区域。例如，以下查询应用了一个过滤器来限制搜索区域：

```json
GET national_parks/_search
{
  "size" : 0,  
  "aggregations": {
    "filtered": {
      "filter": {
        "geo_bounding_box": {
          "location": {
            "top_left": "38, -120",
            "bottom_right": "36, -116"
          }
        }
      },
      "aggregations": {
        "grouped": {
          "geohex_grid": {
            "field": "location",
            "precision": 6
          }
        }
      }
    }
  }
}
```

响应中包含位于 `geo_bounding_box` 边界内的两个文档：

```json
{
  "took" : 4,
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
    "max_score" : null,
    "hits" : [ ]
  },
  "aggregations" : {
    "filtered" : {
      "doc_count" : 2,
      "grouped" : {
        "buckets" : [
          {
            "key" : "8629ab6dfffffff",
            "doc_count" : 1
          },
          {
            "key" : "8629857a7ffffff",
            "doc_count" : 1
          }
        ]
      }
    }
  }
}
```

你还可以在 `bounds` 参数中提供边界范围的坐标来限制地理区域。`bounds` 和 `geo_bounding_box` 的坐标都可以使用任意一种 [geopoint 格式](/field-types/supported-field-types/geo-point#formats)来指定。以下查询（Query）对 `bounds` 参数使用了 Well-Known Text（WKT）"POINT(`longitude` `latitude`)" 格式：

```json
GET national_parks/_search
{
  "size": 0,
  "aggregations": {
    "grouped": {
      "geohex_grid": {
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
    "max_score" : null,
    "hits" : [ ]
  },
  "aggregations" : {
    "grouped" : {
      "buckets" : [
        {
          "key" : "8629ab6dfffffff",
          "doc_count" : 1
        },
        {
          "key" : "8629857a7ffffff",
          "doc_count" : 1
        }
      ]
    }
  }
}
```

`bounds` 参数既可以与 `geo_bounding_box` 过滤器一起使用，也可以单独使用；这两个参数相互独立，彼此之间可以存在任意空间关系。

## 支持的参数

Geohex 网格聚合请求支持以下参数。

参数 | 数据类型 | 描述
:--- | :--- | :---
field | String | 包含 geopoint 的字段。该字段必须映射为 `geo_point` 字段。如果该字段包含数组，则会聚合所有数组值。必需。
precision | Integer | 用于确定网格单元以对结果进行分桶的粒度级别。单元不能超过所需精度的指定大小（对角线）。有效值范围为 [0, 15]。可选。默认值为 5。
bounds | Object | 用于过滤 geopoint 的边界框。边界框由左上角和右下角顶点定义。顶点以 geopoint 的形式指定，可使用以下任一格式：<br>- 包含纬度和经度的对象<br>- [`longitude`, `latitude`] 格式的数组<br>- "`latitude`,`longitude`" 格式的字符串<br>- geohash<br>- WKT<br> 有关格式示例，请参阅 [geopoint 格式](/field-types/supported-field-types/geo-point#formats)。可选。
size | Integer | 要返回的最大桶数。当桶的数量多于 `size` 时，OpenSearch 返回包含文档较多的桶。可选。默认值为 10,000。
shard_size | Integer | 每个分片（Shard）返回的最大桶数。可选。默认值为 max (10, `size` &middot; 分片数)，这样可以为优先级更高的桶提供更准确的计数。
