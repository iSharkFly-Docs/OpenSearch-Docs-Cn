---
title: 复杂查询
---

# 复杂查询

除了简单的 SFW（`SELECT-FROM-WHERE`）查询之外，SQL 插件还支持子查询、连接（join）、并集（union）和差集（minus）等复杂查询。这些查询会作用于多个 OpenSearch 索引。要了解这些查询在后台是如何执行的，请使用 `explain` 操作。

## 连接

OpenSearch SQL 支持内连接（inner join）、交叉连接（cross join）和左外连接（left outer join）。

### 限制

连接有以下限制：

1. 只能连接两个索引。
1. 必须为索引使用别名（例如 `people p`）。
1. 在 ON 子句中只能使用 AND 条件。
1. 在 WHERE 语句中，不要组合包含多个索引的条件树。例如，下面的语句可以正常工作：

   ```
   WHERE (a.type1 > 3 OR a.type1 < 0) AND (b.type2 > 4 OR b.type2 < -1)
   ```

   而下面的语句不行：

   ```
   WHERE (a.type1 > 3 OR b.type2 < 0) AND (a.type1 > 4 OR b.type2 < -1)
   ```

1. 不能对结果使用 GROUP BY 或 ORDER BY。
1. 不支持带 OFFSET 的 LIMIT（例如 `LIMIT 25 OFFSET 25`）。

### 描述

`JOIN` 子句使用各索引共有的值，将一个或多个索引中的列组合起来。

### 语法

规则 `tableSource`：

![tableSource](/images/tableSource.png)

规则 `joinPart`：

![joinPart](/images/joinPart.png)

### 示例 1：内连接

内连接根据连接谓词组合两个索引的列，生成新的结果集。它遍历两个索引，比较每个文档，找出满足连接谓词的文档。可以选择在 `JOIN` 子句前加上 `INNER` 关键字。

连接谓词由 ON 子句指定。

SQL 查询：

```sql
SELECT
  a.account_number, a.firstname, a.lastname,
  e.id, e.name
FROM accounts a
JOIN employees_nested e
 ON a.account_number = e.id
```

Explain：

`explain` 的输出比较复杂，因为一个 `JOIN` 子句关联了两个 OpenSearch DSL 查询，它们分别在不同的查询规划器框架中执行。可以通过查看 `Physical Plan` 和 `Logical Plan` 对象来理解它。

```json
{
  "Physical Plan" : {
    "Project [ columns=[a.account_number, a.firstname, a.lastname, e.name, e.id] ]" : {
      "Top [ count=200 ]" : {
        "BlockHashJoin[ conditions=( a.account_number = e.id ), type=JOIN, blockSize=[FixedBlockSize with size=10000] ]" : {
          "Scroll [ employees_nested as e, pageSize=10000 ]" : {
            "request" : {
              "size" : 200,
              "from" : 0,
              "_source" : {
                "excludes" : [ ],
                "includes" : [
                  "id",
                  "name"
                ]
              }
            }
          },
          "Scroll [ accounts as a, pageSize=10000 ]" : {
            "request" : {
              "size" : 200,
              "from" : 0,
              "_source" : {
                "excludes" : [ ],
                "includes" : [
                  "account_number",
                  "firstname",
                  "lastname"
                ]
              }
            }
          },
          "useTermsFilterOptimization" : false
        }
      }
    }
  },
  "description" : "Hash Join algorithm builds hash table based on result of first query, and then probes hash table to find matched rows for each row returned by second query",
  "Logical Plan" : {
    "Project [ columns=[a.account_number, a.firstname, a.lastname, e.name, e.id] ]" : {
      "Top [ count=200 ]" : {
        "Join [ conditions=( a.account_number = e.id ) type=JOIN ]" : {
          "Group" : [
            {
              "Project [ columns=[a.account_number, a.firstname, a.lastname] ]" : {
                "TableScan" : {
                  "tableAlias" : "a",
                  "tableName" : "accounts"
                }
              }
            },
            {
              "Project [ columns=[e.name, e.id] ]" : {
                "TableScan" : {
                  "tableAlias" : "e",
                  "tableName" : "employees_nested"
                }
              }
            }
          ]
        }
      }
    }
  }
}
```

结果集：

| a.account_number | a.firstname | a.lastname | e.id | e.name
:--- | :--- | :--- | :--- | :---
6 | Hattie | Bond | 6 | Jane Smith

### 示例 2：交叉连接

交叉连接也称为笛卡尔连接（cartesian join），它将第一个索引中的每个文档与第二个索引中的每个文档组合起来。
结果集是两个索引中文档的笛卡尔积。
该操作类似于没有指定连接条件的 `ON` 子句的内连接。

::: danger 警告
对两个大型甚至中型索引执行交叉连接是有风险的。它可能会触发断路器，为避免内存耗尽而终止查询。
:::

SQL 查询：

```sql
SELECT
  a.account_number, a.firstname, a.lastname,
  e.id, e.name
FROM accounts a
JOIN employees_nested e
```

结果集：

| a.account_number | a.firstname | a.lastname | e.id | e.name
:--- | :--- | :--- | :--- | :---
1 | Amber | Duke | 3 | Bob Smith
1 | Amber | Duke | 4 | Susan Smith
1 | Amber | Duke | 6 | Jane Smith
6 | Hattie | Bond | 3 | Bob Smith
6 | Hattie | Bond | 4 | Susan Smith
6 | Hattie | Bond | 6 | Jane Smith
13 | Nanette | Bates | 3 | Bob Smith
13 | Nanette | Bates | 4 | Susan Smith
13 | Nanette | Bates | 6 | Jane Smith
18 | Dale | Adams | 3 | Bob Smith
18 | Dale | Adams | 4 | Susan Smith
18 | Dale | Adams | 6 | Jane Smith

### 示例 3：左外连接

使用左外连接，可以在第一个索引中的行不满足连接谓词时仍保留这些行。关键字 `OUTER` 是可选的。

SQL 查询：

```sql
SELECT
  a.account_number, a.firstname, a.lastname,
  e.id, e.name
FROM accounts a
LEFT JOIN employees_nested e
 ON a.account_number = e.id
```

结果集：

| a.account_number | a.firstname | a.lastname | e.id | e.name
:--- | :--- | :--- | :--- | :---
1 | Amber | Duke | null | null
6 | Hattie | Bond | 6 | Jane Smith
13 | Nanette | Bates | null | null
18 | Dale | Adams | null | null

## 子查询

子查询是在另一个语句中使用、并用括号括起来的完整 `SELECT` 语句。
从 explain 输出中可以看到，有些子查询实际上会被转换为等价的连接查询来执行。

### 示例 1：表子查询

SQL 查询：

```sql
SELECT a1.firstname, a1.lastname, a1.balance
FROM accounts a1
WHERE a1.account_number IN (
  SELECT a2.account_number
  FROM accounts a2
  WHERE a2.balance > 10000
)
```

Explain：

```json
{
  "Physical Plan" : {
    "Project [ columns=[a1.balance, a1.firstname, a1.lastname] ]" : {
      "Top [ count=200 ]" : {
        "BlockHashJoin[ conditions=( a1.account_number = a2.account_number ), type=JOIN, blockSize=[FixedBlockSize with size=10000] ]" : {
          "Scroll [ accounts as a2, pageSize=10000 ]" : {
            "request" : {
              "size" : 200,
              "query" : {
                "bool" : {
                  "filter" : [
                    {
                      "bool" : {
                        "adjust_pure_negative" : true,
                        "must" : [
                          {
                            "bool" : {
                              "adjust_pure_negative" : true,
                              "must" : [
                                {
                                  "bool" : {
                                    "adjust_pure_negative" : true,
                                    "must_not" : [
                                      {
                                        "bool" : {
                                          "adjust_pure_negative" : true,
                                          "must_not" : [
                                            {
                                              "exists" : {
                                                "field" : "account_number",
                                                "boost" : 1
                                              }
                                            }
                                          ],
                                          "boost" : 1
                                        }
                                      }
                                    ],
                                    "boost" : 1
                                  }
                                },
                                {
                                  "range" : {
                                    "balance" : {
                                      "include_lower" : false,
                                      "include_upper" : true,
                                      "from" : 10000,
                                      "boost" : 1,
                                      "to" : null
                                    }
                                  }
                                }
                              ],
                              "boost" : 1
                            }
                          }
                        ],
                        "boost" : 1
                      }
                    }
                  ],
                  "adjust_pure_negative" : true,
                  "boost" : 1
                }
              },
              "from" : 0
            }
          },
          "Scroll [ accounts as a1, pageSize=10000 ]" : {
            "request" : {
              "size" : 200,
              "from" : 0,
              "_source" : {
                "excludes" : [ ],
                "includes" : [
                  "firstname",
                  "lastname",
                  "balance",
                  "account_number"
                ]
              }
            }
          },
          "useTermsFilterOptimization" : false
        }
      }
    }
  },
  "description" : "Hash Join algorithm builds hash table based on result of first query, and then probes hash table to find matched rows for each row returned by second query",
  "Logical Plan" : {
    "Project [ columns=[a1.balance, a1.firstname, a1.lastname] ]" : {
      "Top [ count=200 ]" : {
        "Join [ conditions=( a1.account_number = a2.account_number ) type=JOIN ]" : {
          "Group" : [
            {
              "Project [ columns=[a1.balance, a1.firstname, a1.lastname, a1.account_number] ]" : {
                "TableScan" : {
                  "tableAlias" : "a1",
                  "tableName" : "accounts"
                }
              }
            },
            {
              "Project [ columns=[a2.account_number] ]" : {
                "Filter [ conditions=[AND ( AND account_number ISN null, AND balance GT 10000 ) ] ]" : {
                  "TableScan" : {
                    "tableAlias" : "a2",
                    "tableName" : "accounts"
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}
```

结果集：

| a1.firstname | a1.lastname | a1.balance
:--- | :--- | :---
Amber | Duke | 39225
Nanette | Bates | 32838

### 示例 2：From 子查询

SQL 查询：

```sql
SELECT a.f, a.l, a.a
FROM (
  SELECT firstname AS f, lastname AS l, age AS a
  FROM accounts
  WHERE age > 30
) AS a
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
                "range" : {
                  "age" : {
                    "from" : 30,
                    "to" : null,
                    "include_lower" : false,
                    "include_upper" : true,
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
  "_source" : {
    "includes" : [
      "firstname",
      "lastname",
      "age"
    ],
    "excludes" : [ ]
  }
}
```

结果集：

| f | l | a
:--- | :--- | :---
Amber | Duke | 32
Dale | Adams | 33
Hattie | Bond | 36
