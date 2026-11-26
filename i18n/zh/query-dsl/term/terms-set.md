---
title: Terms set
---

# Terms set 查询

使用 terms set 查询，可以搜索在指定字段中至少匹配指定数量精确词项的文档（Document）。`terms_set` 查询与 `terms` 查询类似，区别在于你可以指定返回文档所需的最少匹配词项数。你可以通过索引（Index）中的某个字段或通过脚本来指定这个数量。

例如，假设一个索引包含学生姓名以及这些学生选修的课程。在为该索引设置映射（Mapping）时，需要提供一个[数值](/field-types/supported-field-types/numeric)字段，用于指定返回文档所需的最少匹配词项数：

```json
PUT students
{
  "mappings": {
    "properties": {
      "name": {
        "type": "keyword"
      },
      "classes": {
        "type": "keyword"
      },
      "min_required": {
        "type": "integer"
      }
    }
  }
}
```

接下来，索引两个与学生对应的文档：

```json
PUT students/_doc/1
{
  "name": "Mary Major",
  "classes": [ "CS101", "CS102", "MATH101" ],
  "min_required": 2
}
```

```json
PUT students/_doc/2
{
  "name": "John Doe",
  "classes": [ "CS101", "MATH101", "ENG101" ],
  "min_required": 2
}
```

现在搜索至少选修了以下课程中两门的学生：`CS101`、`CS102`、`MATH101`：

```json
GET students/_search
{
  "query": {
    "terms_set": {
      "classes": {
        "terms": [ "CS101", "CS102", "MATH101" ],
        "minimum_should_match_field": "min_required"
      }
    }
  }
}
```

响应中包含这两个文档：

```json
{
  "took" : 44,
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
    "max_score" : 1.4544616,
    "hits" : [
      {
        "_index" : "students",
        "_id" : "1",
        "_score" : 1.4544616,
        "_source" : {
          "name" : "Mary Major",
          "classes" : [
            "CS101",
            "CS102",
            "MATH101"
          ],
          "min_required" : 2
        }
      },
      {
        "_index" : "students",
        "_id" : "2",
        "_score" : 0.5013843,
        "_source" : {
          "name" : "John Doe",
          "classes" : [
            "CS101",
            "MATH101",
            "ENG101"
          ],
          "min_required" : 2
        }
      }
    ]
  }
}
```

要通过脚本指定文档应匹配的最少词项数，请在 `minimum_should_match_script` 字段中提供脚本：

```json
GET students/_search
{
  "query": {
    "terms_set": {
      "classes": {
        "terms": [ "CS101", "CS102", "MATH101" ],
        "minimum_should_match_script": {
          "source": "Math.min(params.num_terms, doc['min_required'].value)"
        }
      }
    }
  }
}
```

## 参数

该查询接受字段名称（`<field>`）作为顶层参数：

```json
GET _search
{
  "query": {
    "terms_set": {
      "<field>": {
        "terms": [ "term1", "term2" ],
        ... 
      }
    }
  }
}
```

`<field>` 接受以下参数。除 `terms` 外，所有参数均为可选。

参数 | 数据类型 | 描述
:--- | :--- | :---
`terms` | Array of strings | 要在 `<field>` 指定的字段中搜索的词项数组。只有当所需数量的词项与文档的字段值完全匹配（包括空格和大小写）时，才会在结果中返回该文档。
`minimum_should_match_field` | String | [数值](/field-types/supported-field-types/numeric)字段的名称，该字段指定在结果中返回文档所需的匹配词项数。
`minimum_should_match_script` | String | 返回在结果中返回文档所需匹配词项数的脚本。
