---
title: Join
---

# Join 字段类型

join 字段类型用于在同一索引（Index）中的文档（Document）之间建立父/子关系。 

## 示例

创建一个映射（Mapping），在产品与其品牌之间建立父子关系：

```json
PUT testindex1
{
  "mappings": {
    "properties": {
      "product_to_brand": { 
        "type": "join",
        "relations": {
          "brand": "product" 
        }
      }
    }
  }
}
```

然后，索引一个包含 join 字段类型的父文档：

```json
PUT testindex1/_doc/1
{
  "name": "Brand 1",
  "product_to_brand": {
    "name": "brand" 
  }
}
```

也可以使用不带对象表示法的简写形式来索引父文档：

```json
PUT testindex1/_doc/1
{
  "name": "Brand 1",
  "product_to_brand" : "brand" 
}
```

索引子文档时，必须指定 `routing` 查询参数，因为同一关系中的父文档和子文档必须索引到同一个分片（Shard）上。每个子文档都在 `parent` 字段中引用其父文档的 ID。

索引两个子文档，每个父文档各对应一个：

```json
PUT testindex1/_doc/3?routing=1
{
  "name": "Product 1",
  "product_to_brand": {
    "name": "product", 
    "parent": "1" 
  }
}
```

```json
PUT testindex1/_doc/4?routing=1
{
  "name": "Product 2",
  "product_to_brand": {
    "name": "product", 
    "parent": "1" 
  }
}
```

## 查询 join 字段

查询 join 字段时，响应中会包含子字段，用于说明返回的文档是父文档还是子文档。对于子对象，还会返回父文档 ID。

### 搜索所有文档

```json
GET testindex1/_search
{
  "query": {
    "match_all": {}
  }
}
```

响应会指明文档是父文档还是子文档：

```json
{
  "took" : 4,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 3,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "Brand 1",
          "product_to_brand" : {
            "name" : "brand"
          }
        }
      },
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "3",
        "_score" : 1.0,
        "_routing" : "1",
        "_source" : {
          "name" : "Product 1",
          "product_to_brand" : {
            "name" : "product",
            "parent" : "1"
          }
        }
      },
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "4",
        "_score" : 1.0,
        "_routing" : "1",
        "_source" : {
          "name" : "Product 2",
          "product_to_brand" : {
            "name" : "product",
            "parent" : "1"
          }
        }
      }
    ]
  }
}
```

### 搜索某个父文档的所有子文档 

查找与 Brand 1 关联的所有产品：

```json
GET testindex1/_search
{
  "query" : {
    "has_parent": {
      "parent_type":"brand",
      "query": {
        "match" : {
          "name": "Brand 1"
        }
      }
    }
  }
}
```

响应包含与 Brand 1 关联的 Product 1 和 Product 2：

```json
{
  "took" : 7,
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
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "3",
        "_score" : 1.0,
        "_routing" : "1",
        "_source" : {
          "name" : "Product 1",
          "product_to_brand" : {
            "name" : "product",
            "parent" : "1"
          }
        }
      },
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "4",
        "_score" : 1.0,
        "_routing" : "1",
        "_source" : {
          "name" : "Product 2",
          "product_to_brand" : {
            "name" : "product",
            "parent" : "1"
          }
        }
      }
    ]
  }
}
```

### 搜索某个子文档的父文档

查找 Product 1 的父文档：

```json
GET testindex1/_search
{
  "query" : {
    "has_child": {
      "type":"product",
      "query": {
        "match" : {
            "name": "Product 1"
        }
      }
    }
  }
}
```

响应返回 Brand 1 作为 Product 1 的父文档：

```json
{
  "took" : 4,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "name" : "Brand 1",
          "product_to_brand" : {
            "name" : "brand"
          }
        }
      }
    ]
  }
}
```

## 具有多个子文档的父文档

一个父文档可以有多个子文档。创建一个包含多个子关系的映射：

```json
PUT testindex1
{
  "mappings": {
    "properties": {
      "parent_to_child": {
        "type": "join",
        "relations": {
          "parent": ["child 1", "child 2"]  
        }
      }
    }
  }
}
```

## Join 字段类型注意事项 

- 一个索引中只能有一个 join 字段映射。
- 检索、更新或删除子文档时，需要提供 routing 参数。这是因为同一关系中的父文档和子文档必须索引到同一个分片上。
- 不支持多个父文档。 
- 只有当现有文档已被标记为父文档时，才能为其添加子文档。
- 可以向现有的 join 字段添加新的关系。
