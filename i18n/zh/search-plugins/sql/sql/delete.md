---
title: Delete
---

# Delete

`DELETE` 语句删除满足 `WHERE` 子句中谓词条件的文档。
如果不指定 `WHERE` 子句，将删除所有文档。

### 设置

`DELETE` 语句默认处于禁用状态。要在 SQL 中启用 `DELETE` 功能，需要发送以下请求来更新配置：

```json
PUT _plugins/_query/settings
{
  "transient": {
    "plugins.sql.delete.enabled": "true"
  }
}
```

### 语法

规则 `singleDeleteStatement`：

![singleDeleteStatement](/images/singleDeleteStatement.png)

### 示例

SQL 查询：

```sql
DELETE FROM accounts
WHERE age > 30
```

Explain：

```json
{
  "size" : 1000,
  "query" : {
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
  },
  "_source" : false
}
```

结果集：

```json
{
  "schema" : [
    {
      "name" : "deleted_rows",
      "type" : "long"
    }
  ],
  "total" : 1,
  "datarows" : [
    [
      3
    ]
  ],
  "size" : 1,
  "status" : 200
}
```

`datarows` 字段显示已删除的文档数量。
