---
title: IP 范围
---

# IP 范围聚合

`ip_range` 聚合（Aggregation）用于 IP 地址。
它适用于 `ip` 类型的字段。你可以使用 [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) 表示法来定义 IP 范围和掩码。

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "access": {
      "ip_range": {
        "field": "ip",
        "ranges": [
          {
            "from": "1.0.0.0",
            "to": "126.158.155.183"
          },
          {
            "mask": "1.0.0.0/8"
          }
        ]
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "access" : {
    "buckets" : [
      {
        "key" : "1.0.0.0/8",
        "from" : "1.0.0.0",
        "to" : "2.0.0.0",
        "doc_count" : 98
      },
      {
        "key" : "1.0.0.0-126.158.155.183",
        "from" : "1.0.0.0",
        "to" : "126.158.155.183",
        "doc_count" : 7184
      }
    ]
  }
 }
}
```

如果你向一个在映射（Mapping）中将 `ip_range` 设置为 `false` 的索引（Index）添加包含格式错误字段的文档（Document），OpenSearch 会拒绝整个文档。你可以将 `ignore_malformed` 设置为 `true`，指定 OpenSearch 忽略格式错误的字段。默认值为 `false`。

```json
...
"mappings": {
  "properties": {
    "ips": {
      "type": "ip_range",
      "ignore_malformed": true
    }
  }
}
```
