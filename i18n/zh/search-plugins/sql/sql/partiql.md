---
title: JSON 支持
---

# JSON 支持

SQL 插件遵循 [PartiQL](https://partiql.org/) 规范来支持 JSON。PartiQL 是一种与 SQL 兼容的查询语言，可以查询任意数据格式中的半结构化数据和嵌套数据。SQL 插件仅支持 PartiQL 规范的一个子集。

## 查询嵌套集合

PartiQL 对 SQL 进行了扩展，使你可以查询并展开（unnest）嵌套集合。在 OpenSearch 中，这对于查询包含嵌套对象或嵌套字段的 JSON 索引非常有用。

要跟着示例操作，请先使用 `bulk` 操作索引一些示例数据：

```json
POST employees_nested/_bulk?refresh
{"index":{"_id":"1"}}
{"id":3,"name":"Bob Smith","title":null,"projects":[{"name":"SQL Spectrum querying","started_year":1990},{"name":"SQL security","started_year":1999},{"name":"OpenSearch security","started_year":2015}]}
{"index":{"_id":"2"}}
{"id":4,"name":"Susan Smith","title":"Dev Mgr","projects":[]}
{"index":{"_id":"3"}}
{"id":6,"name":"Jane Smith","title":"Software Eng 2","projects":[{"name":"SQL security","started_year":1998},{"name":"Hello security","started_year":2015,"address":[{"city":"Dallas","state":"TX"}]}]}
```

### 示例 1：展开嵌套集合

此示例查找字段值（`name`）满足谓词条件（包含 `security`）的嵌套文档（`projects`）。由于每个父文档可以有多个嵌套文档，匹配的嵌套文档会被展平。换句话说，最终结果是父文档与嵌套文档之间的笛卡尔积。

```sql
SELECT e.name AS employeeName,
       p.name AS projectName
FROM employees_nested AS e,
       e.projects AS p
WHERE p.name LIKE '%security%'
```

Explain：

```json
{
  "from" : 0,
  "size" : 200,
  "query" : {
    "bool" : {
      "filter" : [
        {
          "bool" : {
            "must" : [
              {
                "nested" : {
                  "query" : {
                    "wildcard" : {
                      "projects.name" : {
                        "wildcard" : "*security*",
                        "boost" : 1.0
                      }
                    }
                  },
                  "path" : "projects",
                  "ignore_unmapped" : false,
                  "score_mode" : "none",
                  "boost" : 1.0,
                  "inner_hits" : {
                    "ignore_unmapped" : false,
                    "from" : 0,
                    "size" : 3,
                    "version" : false,
                    "seq_no_primary_term" : false,
                    "explain" : false,
                    "track_scores" : false,
                    "_source" : {
                      "includes" : [
                        "projects.name"
                      ],
                      "excludes" : [ ]
                    }
                  }
                }
              }
            ],
            "adjust_pure_negative" : true,
            "boost" : 1.0
          }
        }
      ],
      "adjust_pure_negative" : true,
      "boost" : 1.0
    }
  },
  "_source" : {
    "includes" : [
      "name"
    ],
    "excludes" : [ ]
  }
}
```

结果集：

| employeeName | projectName
:--- | :---
Bob Smith | OpenSearch Security
Bob Smith | SQL security
Jane Smith | Hello security
Jane Smith | SQL security

### 示例 2：在存在性子查询中展开

在子查询中展开嵌套集合，检查其是否满足条件：

```sql
SELECT e.name AS employeeName
FROM employees_nested AS e
WHERE EXISTS (
    SELECT *
    FROM e.projects AS p
    WHERE p.name LIKE '%security%'
)
```

Explain：

```json
{
  "from" : 0,
  "size" : 200,
  "query" : {
    "bool" : {
      "filter" : [
        {
          "bool" : {
            "must" : [
              {
                "nested" : {
                  "query" : {
                    "bool" : {
                      "must" : [
                        {
                          "bool" : {
                            "must" : [
                              {
                                "bool" : {
                                  "must_not" : [
                                    {
                                      "bool" : {
                                        "must_not" : [
                                          {
                                            "exists" : {
                                              "field" : "projects",
                                              "boost" : 1.0
                                            }
                                          }
                                        ],
                                        "adjust_pure_negative" : true,
                                        "boost" : 1.0
                                      }
                                    }
                                  ],
                                  "adjust_pure_negative" : true,
                                  "boost" : 1.0
                                }
                              },
                              {
                                "wildcard" : {
                                  "projects.name" : {
                                    "wildcard" : "*security*",
                                    "boost" : 1.0
                                  }
                                }
                              }
                            ],
                            "adjust_pure_negative" : true,
                            "boost" : 1.0
                          }
                        }
                      ],
                      "adjust_pure_negative" : true,
                      "boost" : 1.0
                    }
                  },
                  "path" : "projects",
                  "ignore_unmapped" : false,
                  "score_mode" : "none",
                  "boost" : 1.0
                }
              }
            ],
            "adjust_pure_negative" : true,
            "boost" : 1.0
          }
        }
      ],
      "adjust_pure_negative" : true,
      "boost" : 1.0
    }
  },
  "_source" : {
    "includes" : [
      "name"
    ],
    "excludes" : [ ]
  }
}
```

结果集：

| employeeName |
:--- | :---
Bob Smith |
Jane Smith |
