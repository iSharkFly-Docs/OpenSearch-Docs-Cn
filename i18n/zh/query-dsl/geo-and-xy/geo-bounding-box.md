---
title: 地理边界框
---

# 地理边界框查询

要搜索包含 [geopoint](/field-types/supported-field-types/geo-point) 字段的文档（Document），请使用地理边界框查询（Geo-bounding Box Query）。地理边界框查询返回 geopoint 位于查询中指定的边界框内的文档。如果一个文档包含多个 geopoint，只要至少有一个 geopoint 位于边界框内，该文档就与查询匹配。

## 示例

你可以使用地理边界框查询搜索包含 geopoint 的文档。 

创建一个映射（Mapping），将 `point` 字段映射为 `geo_point`：

```json
PUT testindex1
{
  "mappings": {
    "properties": {
      "point": {
        "type": "geo_point"
      }
    }
  }
}
```

将三个 geopoint 作为包含纬度和经度的对象进行索引：

```json
PUT testindex1/_doc/1
{
  "point": { 
    "lat": 74.00,
    "lon": 40.71
  }
}

PUT testindex1/_doc/2
{
  "point": { 
    "lat": 72.64,
    "lon": 22.62
  } 
}

PUT testindex1/_doc/3
{
  "point": { 
    "lat": 75.00,
    "lon": 28.00
  }
}
```

搜索所有文档，并过滤出点位于查询中定义的矩形内的文档：

```json
GET testindex1/_search
{
  "query": {
    "bool": {
      "must": {
        "match_all": {}
      },
      "filter": {
        "geo_bounding_box": {
          "point": {
            "top_left": {
              "lat": 75,
              "lon": 28
            },
            "bottom_right": {
              "lat": 73,
              "lon": 41
            }
          }
        }
      }
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took" : 20,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "testindex1",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "point" : {
            "lat" : 74.0,
            "lon" : 40.71
          }
        }
      }
    ]
  }
}
```

::: info 注意
上述响应不包含 geopoint 为 `"lat": 75.00, "lon": 28.00` 的文档，这是因为 geopoint 的[精度](#precision)有限。
:::

## 精度

geopoint 坐标在索引时总是向下舍入。在查询时，边界框的上边界向下舍入，下边界向上舍入。因此，由于舍入误差，位于边界框下边缘和左边缘上的 geopoint 文档可能不会包含在结果中。另一方面，位于边界框上边缘和右边缘上的 geopoint 即使在边界之外，也可能被包含在结果中。纬度的舍入误差小于 4.20 &times; 10<sup>&minus;8</sup> 度，经度的舍入误差小于 8.39 &times; 10<sup>&minus;8</sup> 度（约 1 cm）。 

## 指定边界框

你可以通过提供以下任一顶点坐标组合来指定边界框：

- `top_left` 和 `bottom_right`
- `top_right` 和 `bottom_left`
- `top`、`left`、`bottom` 和 `right`

以下示例展示了如何使用 `top`、`left`、`bottom` 和 `right` 坐标指定边界框：

```json
GET testindex1/_search
{
  "query": {
    "bool": {
      "must": {
        "match_all": {}
      },
      "filter": {
        "geo_bounding_box": {
          "point": {
            "top": 75,
            "left": 28,
            "bottom": 73,
            "right": 41            
          }
        }
      }
    }
  }
}
```

## 请求字段

地理边界框查询接受以下字段。

字段 | 数据类型 | 描述
:--- | :--- | :--- 
`_name` | String | 过滤器的名称。可选。
`validation_method` | String | 验证方法。有效值为 `IGNORE_MALFORMED`（接受坐标无效的 geopoint）、`COERCE`（尝试将坐标强制转换为有效值）和 `STRICT`（坐标无效时返回错误）。默认值为 `STRICT`。
`type` | String | 指定如何执行过滤器。有效值为 `indexed`（对过滤器建立索引）和 `memory`（在内存中执行过滤器）。默认值为 `memory`。
`ignore_unmapped` | Boolean | 指定是否忽略未映射的字段。如果设置为 `true`，查询不会返回任何包含未映射字段的文档。如果设置为 `false`，当字段未映射时会抛出异常。默认值为 `false`。

## 接受的格式

你可以使用 geopoint 字段类型接受的任意[格式](/field-types/supported-field-types/geo-point#formats)来指定边界框顶点的坐标。  

### 使用 geohash 指定边界框

如果使用 geohash 指定边界框，geohash 会被视为一个矩形。边界框的左上顶点对应 `top_left` geohash 的左上顶点，边界框的右下顶点对应 `bottom_right` geohash 的右下顶点。 

以下示例展示了如何使用 geohash 指定与前面示例相同的边界框：

```json
GET testindex1/_search
{
  "query": {
    "bool": {
      "must": {
        "match_all": {}
      },
      "filter": {
        "geo_bounding_box": {
          "point": {
            "top_left": "ut7ftjkfxm34",
            "bottom_right": "uuvpkcprc4rc"
          }
        }
      }
    }
  }
}
```

要指定覆盖某个 geohash 整个区域的边界框，请将该 geohash 同时作为边界框的 `top_left` 和 `bottom_right` 参数：

```json
GET testindex1/_search
{
  "query": {
    "bool": {
      "must": {
        "match_all": {}
      },
      "filter": {
        "geo_bounding_box": {
          "point": {
            "top_left": "ut",
            "bottom_right": "ut"
          }
        }
      }
    }
  }
}
```
