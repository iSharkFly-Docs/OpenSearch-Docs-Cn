---
title: 故障排除
---

# 故障排除

SQL 插件是无状态的，因此故障排除主要集中在某个查询为什么会失败。

最常见的错误是令人头疼的空指针异常（null pointer exception），它可能在解析出错或使用了错误的 HTTP 方法（该用 POST 却用了 GET，或者反过来）时出现。使用 POST 方法并通过 HTTP 请求体发送查询，得到的结果最为一致：

```json
POST _plugins/_sql
{
  "query": "SELECT * FROM my-index WHERE ['name.firstname']='saanvi' LIMIT 5"
}
```

如果某个查询的行为不符合预期，可以使用 `_explain` API 查看转换后的查询，然后据此排查问题。对于大多数操作，`_explain` 返回 OpenSearch Query DSL。对于 `UNION`、`MINUS` 和 `JOIN`，它返回的内容更接近 SQL 执行计划。

#### 示例请求

```json
POST _plugins/_sql/_explain
{
  "query": "SELECT * FROM my-index LIMIT  50"
}
```

#### 示例响应

```json
{
  "from": 0,
  "size": 50
}
```

## 索引映射验证异常

如果看到以下验证异常，请确保查询中的索引不是索引模式（index pattern），并且没有多个类型：

```json
{
  "error": {
    "reason": "There was internal problem at backend",
    "details": "When using multiple indices, the mappings must be identical.",
    "type": "VerificationException"
  },
  "status": 503
}
```

如果这些步骤都不起作用，请在[这里](https://github.com/opensearch-project/sql/issues)提交 GitHub issue。
