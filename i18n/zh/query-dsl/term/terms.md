---
title: Terms
---

# Terms 查询

使用 `terms` 查询在同一字段中搜索多个词项。例如，以下查询搜索 ID 为 `61809` 和 `61810` 的行：

```json
GET shakespeare/_search
{
  "query": {
    "terms": {
      "line_id": [
        "61809",
        "61810"
      ]
    }
  }
}
```

只要文档（Document）与数组中的任一词项匹配，就会返回该文档。

默认情况下，`terms` 查询中允许的最大词项数为 65,536。要更改最大词项数，请更新 `index.max_terms_count` 设置。

::: info 注意
能否[高亮显示](/search-plugins/searching-data/highlight) terms 查询的结果无法保证，这取决于高亮器类型和查询中的词项数量。
:::

## 参数

该查询接受以下参数。所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`<field>` | String | 要搜索的字段。只有当文档的字段值与至少一个词项完全匹配（包括空格和大小写）时，才会在结果中返回该文档。
`boost` | Floating-point | 按给定的倍数提升查询权重。适用于包含多个查询的搜索。[0, 1) 范围内的值会降低相关性，大于 1 的值会提高相关性。默认值为 `1`。 

## 词项查找

词项查找（Terms Lookup）会获取单个文档的字段值，并将其用作搜索词项。你可以使用词项查找来搜索大量词项。

要使用词项查找，必须启用 `_source` 映射字段，因为词项查找会从文档中获取值。`_source` 字段默认是启用的。

词项查找会尝试从本地数据节点上的分片（Shard）获取文档字段值。因此，使用只有一个主分片、且在所有相关数据节点上都有完整副本的索引（Index），可以减少网络流量。

### 示例

例如，创建一个包含学生数据的索引，并将 `student_id` 映射为 `keyword`：

```json
PUT students
{
  "mappings": {
    "properties": {
      "student_id": { "type": "keyword" }
    }
  }
}
```

接下来，索引三个与学生对应的文档：

```json
PUT students/_doc/1
{
  "name": "Jane Doe",
  "student_id" : "111"
}
```

```json
PUT students/_doc/2
{
  "name": "Mary Major",
  "student_id" : "222"
}
```

```json
PUT students/_doc/3
{
  "name": "John Doe",
  "student_id" : "333"
}
```

再创建一个包含课程信息的独立索引，其中包括课程名称以及由选修该课程的学生 ID 组成的数组：

```json
PUT classes/_doc/101
{
  "name": "CS101",
  "enrolled" : ["111" , "222"]
}
```

要搜索选修了 `CS101` 课程的学生，请指定该课程对应文档的文档 ID、该文档所在的索引，以及词项所在字段的路径：

```json
GET students/_search
{
  "query": {
    "terms": {
      "student_id": {
        "index": "classes",
        "id": "101",
        "path": "enrolled"
      }
    }
  }
}
```

响应中包含 `students` 索引中 ID 与 `enrolled` 数组中某个值匹配的每个学生的文档：

```json
{
  "took": 13,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "students",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "Jane Doe",
          "student_id": "111"
        }
      },
      {
        "_index": "students",
        "_id": "2",
        "_score": 1,
        "_source": {
          "name": "Mary Major",
          "student_id": "222"
        }
      }
    ]
  }
}
```

### 示例：嵌套字段

第二个示例演示如何查询嵌套字段。假设一个索引包含以下文档：

```json
PUT classes/_doc/102
{
  "name": "CS102",
  "enrolled_students" : {
    "id_list" : ["111" , "333"]
  }
}
```

要搜索选修了 `CS102` 的学生，请在 `path` 参数中使用点路径表示法指定字段的完整路径：

```json
ET students/_search
{
  "query": {
    "terms": {
      "student_id": {
        "index": "classes",
        "id": "102",
        "path": "enrolled_students.id_list"
      }
    }
  }
}
```

响应中包含匹配的文档：

```json
{
  "took": 18,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "students",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "Jane Doe",
          "student_id": "111"
        }
      },
      {
        "_index": "students",
        "_id": "3",
        "_score": 1,
        "_source": {
          "name": "John Doe",
          "student_id": "333"
        }
      }
    ]
  }
}
```

### 参数 {#parameters-1}

下表列出了词项查找的参数。

参数 | 数据类型 | 描述
:--- | :--- | :---
`index` | String | 要从中获取字段值的索引名称。必需。
`id` | String | 要从中获取字段值的文档的文档 ID。必需。
`path` | String | 要从中获取字段值的字段名称。使用点路径表示法指定嵌套字段。必需。
`routing` | String | 要从中获取字段值的文档的自定义路由值。可选。如果在索引文档时提供了自定义路由值，则为必需。
