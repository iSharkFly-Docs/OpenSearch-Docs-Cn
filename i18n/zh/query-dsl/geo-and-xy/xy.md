---
title: xy
---

# xy 查询

要搜索包含 [xy point](/field-types/supported-field-types/xy-point) 和 [xy shape](/field-types/supported-field-types/xy-shape) 字段的文档（Document），请使用 xy 查询。 

## 空间关系

当你向 xy 查询提供一个 xy 形状时，xy 字段会按照与所提供形状之间的以下空间关系进行匹配。

关系 | 描述 | 支持的 xy 字段类型
:--- | :--- | :--- 
`INTERSECTS` | （默认）匹配 xy point 或 xy shape 与查询中提供的形状相交的文档。 | `xy_point`, `xy_shape`
`DISJOINT` | 匹配 xy shape 与查询中提供的形状不相交的文档。 | `xy_shape`
`WITHIN` | 匹配 xy shape 完全位于查询中提供的形状之内的文档。 | `xy_shape`
`CONTAINS` | 匹配 xy shape 完全包含查询中提供的形状的文档。 | `xy_shape`

以下示例演示如何搜索包含 xy 形状的文档。要了解如何搜索包含 xy 点的文档，请参阅[查询 xy 点](#querying-xy-points)一节。

## 在 xy 查询中定义形状

在 xy 查询中定义形状有两种方式：在查询时提供新的形状定义，或者引用在另一个索引（Index）中预先索引的形状的名称。  

### 使用新的形状定义

要向 xy 查询提供新的形状，请在 `xy_shape` 字段中定义它。

以下示例演示如何搜索 xy 形状与查询时定义的 xy 形状匹配的文档。

首先，创建一个索引，并将 `geometry` 字段映射为 `xy_shape`：

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "geometry": {
        "type": "xy_shape"
      }
    }
  }
}
```

索引一个包含点的文档和一个包含多边形的文档：

```json
PUT testindex/_doc/1
{
  "geometry": { 
    "type": "point",
    "coordinates": [0.5, 3.0]
  }
}

PUT testindex/_doc/2
{
  "geometry" : {
    "type" : "polygon",
    "coordinates" : [
      [[2.5, 6.0],
      [0.5, 4.5], 
      [1.5, 2.0], 
      [3.5, 3.5],
      [2.5, 6.0]]
    ]
  }
}
```

定义一个 [`envelope`](/field-types/supported-field-types/xy-shape#envelope)&mdash;即 `[[minX, maxY], [maxX, minY]]` 格式的边界矩形。搜索 xy 点或形状与该 envelope 相交的文档：

```json
GET testindex/_search
{
  "query": {
    "xy_shape": {
      "geometry": {
        "shape": {
          "type": "envelope",
          "coordinates": [ [ 0.0, 6.0], [ 4.0, 2.0] ]
        },
        "relation": "WITHIN"
      }
    }
  }
}
```

下图展示了该示例。点和多边形都位于边界 envelope 之内。

<img src="/images/xy_query.png" alt="xy shape query" width="250">

响应中包含这两个文档：

```json
{
  "took" : 363,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 0.0,
    "hits" : [
      {
        "_index" : "testindex",
        "_id" : "1",
        "_score" : 0.0,
        "_source" : {
          "geometry" : {
            "type" : "point",
            "coordinates" : [
              0.5,
              3.0
            ]
          }
        }
      },
      {
        "_index" : "testindex",
        "_id" : "2",
        "_score" : 0.0,
        "_source" : {
          "geometry" : {
            "type" : "polygon",
            "coordinates" : [
              [
                [
                  2.5,
                  6.0
                ],
                [
                  0.5,
                  4.5
                ],
                [
                  1.5,
                  2.0
                ],
                [
                  3.5,
                  3.5
                ],
                [
                  2.5,
                  6.0
                ]
              ]
            ]
          }
        }
      }
    ]
  }
}
```

### 使用预先索引的形状定义

构造 xy 查询时，也可以引用在另一个索引中预先索引的形状的名称。使用这种方法，你可以在索引时定义 xy 形状，然后通过名称引用它，并在 `indexed_shape` 对象中提供以下参数。

参数 | 描述
:--- | :---
`index` | 包含预先索引的形状的索引名称。
`id` | 包含预先索引的形状的文档的文档 ID。
`path` | 包含预先索引的形状的字段名称（以路径形式表示）。

以下示例演示如何引用在另一个索引中预先索引的形状的名称。在此示例中，索引 `pre-indexed-shapes` 包含定义边界的形状，索引 `testindex` 包含需要根据这些边界检查位置的形状。

首先，创建索引 `pre-indexed-shapes`，并将该索引的 `geometry` 字段映射为 `xy_shape`：

```json
PUT pre-indexed-shapes
{
  "mappings": {
    "properties": {
      "geometry": {
        "type": "xy_shape"
      }
    }
  }
}
```

索引一个指定边界的 envelope，并将其命名为 `rectangle`：

```json
PUT pre-indexed-shapes/_doc/rectangle
{
  "geometry": {
    "type": "envelope",
    "coordinates" : [ [ 0.0, 6.0], [ 4.0, 2.0] ]
  }
}
```

将一个包含点的文档和一个包含多边形的文档索引到索引 `testindex` 中：

```json
PUT testindex/_doc/1
{
  "geometry": { 
    "type": "point",
    "coordinates": [0.5, 3.0]
  }
}

PUT testindex/_doc/2
{
  "geometry" : {
    "type" : "polygon",
    "coordinates" : [
      [[2.5, 6.0],
      [0.5, 4.5], 
      [1.5, 2.0], 
      [3.5, 3.5],
      [2.5, 6.0]]
    ]
  }
}
```

使用过滤器在索引 `testindex` 中搜索形状与 `rectangle` 相交的文档：

```json
GET testindex/_search
{
  "query": {
    "bool": {
      "filter": {
        "xy_shape": {
          "geometry": {
            "indexed_shape": {
              "index": "pre-indexed-shapes",
              "id": "rectangle",
              "path": "geometry"
            }
          }
        }
      }
    }
  }
}
```

上述查询使用默认的空间关系 `INTERSECTS`，并返回点和多边形：

```json
{
  "took" : 26,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 0.0,
    "hits" : [
      {
        "_index" : "testindex",
        "_id" : "1",
        "_score" : 0.0,
        "_source" : {
          "geometry" : {
            "type" : "point",
            "coordinates" : [
              0.5,
              3.0
            ]
          }
        }
      },
      {
        "_index" : "testindex",
        "_id" : "2",
        "_score" : 0.0,
        "_source" : {
          "geometry" : {
            "type" : "polygon",
            "coordinates" : [
              [
                [
                  2.5,
                  6.0
                ],
                [
                  0.5,
                  4.5
                ],
                [
                  1.5,
                  2.0
                ],
                [
                  3.5,
                  3.5
                ],
                [
                  2.5,
                  6.0
                ]
              ]
            ]
          }
        }
      }
    ]
  }
}
```

## 查询 xy 点

你也可以使用 xy 查询搜索包含 xy 点的文档。 

创建一个映射（Mapping），将 `point` 映射为 `xy_point`：

```json
PUT testindex1
{
  "mappings": {
    "properties": {
      "point": {
        "type": "xy_point"
      }
    }
  }
}
```

索引三个点：

```json
PUT testindex1/_doc/1
{
  "point": "1.0, 1.0" 
}

PUT testindex1/_doc/2
{
  "point": "2.0, 0.0" 
}

PUT testindex1/_doc/3
{
  "point": "-2.0, 2.0" 
}
```

搜索位于以 (0, 0) 为圆心、半径为 2 的圆内的点：

```json
GET testindex1/_search
{
  "query": {
    "xy_shape": {
      "point": {
        "shape": {
          "type": "circle",
          "coordinates": [0.0, 0.0],
          "radius": 2
        }
      }
    }
  }
}
```

::: info 注意
xy point 只支持默认的 `INTERSECTS` 空间关系，因此无需提供 `relation` 参数。
:::

下图展示了该示例。点 1 和点 2 位于圆内，点 3 位于圆外。

<img src="/images/xy_query_point.png" alt="xy point query" width="300">

响应返回文档 1 和文档 2：

```json
{
  "took" : 575,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 0.0,
    "hits" : [
      {
        "_index" : "testindex1",
        "_id" : "1",
        "_score" : 0.0,
        "_source" : {
          "point" : "1.0, 1.0"
        }
      },
      {
        "_index" : "testindex1",
        "_id" : "2",
        "_score" : 0.0,
        "_source" : {
          "point" : "2.0, 0.0"
        }
      }
    ]
  }
}
```
