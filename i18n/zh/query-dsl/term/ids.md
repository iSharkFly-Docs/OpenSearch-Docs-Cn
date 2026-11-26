---
title: IDs
---

# IDs 查询

使用 `ids` 查询可以在 `_id` 字段中搜索具有一个或多个特定文档 ID 值的文档（Document）。例如，以下查询请求 ID 为 `34229` 和 `91296` 的文档：

```json
GET shakespeare/_search
{
  "query": {
    "ids": {
      "values": [
        34229,
        91296
      ]
    }
  }
}
```

## 参数

该查询接受以下参数。

参数 | 数据类型 | 描述
:--- | :--- | :---
`values` | Array of strings | 要搜索的文档 ID。必需。
