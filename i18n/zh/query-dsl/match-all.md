---
title: Match all 查询
---

# Match all 查询

`match_all` 查询返回所有文档（Document）。如果需要返回整个文档集，该查询在测试大型文档集时会很有用。

```json
GET _search
{
  "query": {
    "match_all": {}
  }
}
```

`match_all` 查询有一个对应的 `match_none` 查询，但它很少用到：

```json
GET _search
{
  "query": {
    "match_none": {}
  }
}
```
