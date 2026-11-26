---
title: 扁平对象
---

# 扁平对象字段类型

在 OpenSearch 中，索引文档（Document）之前不必先指定映射（Mapping）。如果没有指定映射，OpenSearch 会使用[动态映射](/field-types/#dynamic-mapping)自动映射文档中的每个字段及其子字段。在摄取日志之类的文档时，可能无法事先知道每个字段的子字段名称和类型。在这种情况下，动态映射所有新的子字段很快就会导致“映射爆炸”，不断增长的字段数量可能会降低集群（Cluster）的性能。 

扁平对象（flat object）字段类型通过将整个 JSON 对象视为字符串来解决这个问题。JSON 对象中的子字段可以使用标准的点路径表示法访问，但不会为了快速查找而被索引。

::: info 注意
点表示法中字段值的最大长度为 2<sup>24</sup> &minus; 1。
:::

扁平对象字段类型具有以下优点：

- 读取高效：获取性能与 keyword 字段相近。
- 内存高效：将整个复杂的 JSON 对象存储在一个字段中，而不索引其所有子字段，可以减少索引中的字段数量。 
- 空间高效：OpenSearch 不会为扁平对象中的子字段创建倒排索引，从而节省空间。 
- 迁移兼容性：可以将数据从支持类似扁平类型的系统迁移到 OpenSearch。

由于子字段不会被索引，当一个字段及其子字段主要用于读取、而不用作搜索条件时，适合将该字段映射为扁平对象。扁平对象适用于包含大量字段的对象，或者无法事先知道键名的情况。

扁平对象支持使用或不使用点路径表示法的精确匹配查询（Query）。有关支持的查询类型的完整列表，请参阅[支持的查询](#supported-queries)。

::: info 注意
在文档中搜索嵌套字段的特定值可能效率较低，因为这可能需要对索引进行全量扫描，而这是一项开销很大的操作。
:::

扁平对象不支持：

- 特定类型的解析。
- 数值运算，例如数值比较或数值排序。
- 文本分析。
- 高亮显示。
- 使用点表示法对子字段进行聚合（Aggregation）。
- 按子字段过滤。

## 支持的查询

扁平对象字段类型支持以下查询：

- [Term](/query-dsl/term/term) 
- [Terms](/query-dsl/term/terms) 
- [Terms set](/query-dsl/term/terms-set)  
- [Prefix](/query-dsl/term/prefix) 
- [Range](/query-dsl/term/range) 
- [Match](/query-dsl/full-text/match) 
- [Multi-match](/query-dsl/full-text/multi-match) 
- [Query string](/query-dsl/full-text/query-string) 
- [Simple query string](/query-dsl/full-text/simple-query-string) 
- [Exists](/query-dsl/term/exists) 

## 限制

在 OpenSearch 2.7 中，扁平对象存在以下限制：

- 扁平对象不支持开放参数。
- 不支持使用 Painless 脚本和通配符查询来检索子字段的值。

这些功能计划在未来的版本中提供。

## 使用扁平对象

以下示例演示了如何将字段映射为扁平对象、索引包含扁平对象字段的文档，以及在这些文档中搜索扁平对象的叶子值。

首先，为索引创建一个映射，其中 `issue` 的类型为 `flat_object`：

```json
PUT /test-index/
{
  "mappings": {
    "properties": {
      "issue": {
        "type": "flat_object"
      }
    }
  }
}
```

接着，索引两个包含扁平对象字段的文档：

```json
PUT /test-index/_doc/1
{
  "issue": {
    "number": "123456",
    "labels": {
      "version": "2.1",
      "backport": [
        "2.0",
        "1.3"
      ],
      "category": {
        "type": "API",
        "level": "enhancement"
      }
    }
  }
}
```

```json
PUT /test-index/_doc/2
{
  "issue": {
    "number": "123457",
    "labels": {
      "version": "2.2",
      "category": {
        "type": "API",
        "level": "bug"
      }
    }
  }
}
```

如需搜索扁平对象的叶子值，可以使用 GET 或 POST 请求。即使不知道字段名称，也可以在整个扁平对象中搜索叶子值。例如，以下请求搜索所有标记为 bug 的问题：

```json
GET /test-index/_search
{
  "query": {
    "match": {"issue": "bug"}
  }
}
```

或者，如果知道要搜索的子字段名称，可以用点表示法提供该字段的路径：

```json
GET /test-index/_search
{
  "query": {
    "match": {"issue.labels.category.level": "bug"}
  }
}
```

在这两种情况下，响应都相同，且包含文档 2：

```json
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.0303539,
    "hits": [
      {
        "_index": "test-index",
        "_id": "2",
        "_score": 1.0303539,
        "_source": {
          "issue": {
            "number": "123457",
            "labels": {
              "version": "2.2",
              "category": {
                "type": "API",
                "level": "bug"
              }
            }
          }
        }
      }
    ]
  }
}
```

使用 prefix 查询，可以搜索版本号以 `2.` 开头的所有问题：

```json
GET /test-index/_search
{
  "query": {
    "prefix": {"issue.labels.version": "2."}
  }
}
```

使用 range 查询，可以搜索版本 2.0 到 2.1 的所有问题：

```json
GET /test-index/_search
{
  "query": {
    "range": {
      "issue": {
        "gte": "2.0",
        "lte": "2.1"
      }
    }
  }
}
```

## 将子字段定义为扁平对象

可以将 JSON 对象的某个子字段定义为扁平对象。例如，使用以下查询将 `issue.labels` 定义为 `flat_object`：

```json
PUT /test-index/
{
  "mappings": {
    "properties": {
      "issue": {
        "properties": {
          "number": {
            "type": "double"
          },
          "labels": {
            "type": "flat_object"
          }
        }
      }
    }
  }
}
```

由于 `issue.number` 不属于扁平对象，因此可以用它来聚合和排序文档。
