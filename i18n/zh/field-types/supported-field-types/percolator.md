---
title: Percolator
---

# Percolator 字段类型

percolator 字段类型指定将该字段视为查询（Query）。任何 JSON 对象字段都可以标记为 percolator 字段。通常的做法是先索引文档（Document），然后针对这些文档执行搜索。而使用 percolator 字段时，是先存储一个搜索，之后由 percolate 查询将文档与该搜索进行匹配。 

## 示例

一位顾客正在搜索价格不超过 400 美元的桌子，并希望为该搜索创建一个提醒。 

创建一个映射（Mapping），为 query 字段指定 percolator 字段类型：

```json
PUT testindex1
{
  "mappings": {
    "properties": {
      "search": {
        "properties": {
          "query": { 
            "type": "percolator" 
          }
        }
      },
      "price": { 
        "type": "float" 
      },
      "item": { 
        "type": "text" 
      }
    }
  }
}
```

索引一个查询：

```json
PUT testindex1/_doc/1
{
  "search": {
    "query": {
      "bool": {
        "filter": [
          { 
            "match": { 
              "item": { 
                "query": "table" 
              }
            }
          },
          { 
            "range": { 
              "price": { 
                "lte": 400.00 
              } 
            } 
          }
        ]
      }
    }
  }
}
```

::: info 注意
查询中引用的字段必须已经存在于映射中。
:::

运行 percolate 查询以搜索匹配的文档：

```json
GET testindex1/_search
{
  "query" : {
    "bool" : {
      "filter" : 
        {
          "percolate" : {
            "field" : "search.query",
            "document" : {
              "item" : "Mahogany table",
              "price": 399.99
            }
          }
        }
    }
  }
}
```

响应中包含最初索引的查询：

```json
{
  "took" : 30,
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
    "max_score" : 0.0,
    "hits" : [
      {
        "_index" : "testindex1",
        "_type" : "_doc",
        "_id" : "1",
        "_score" : 0.0,
        "_source" : {
          "search" : {
            "query" : {
              "bool" : {
                "filter" : [
                  {
                    "match" : {
                      "item" : {
                        "query" : "table"
                      }
                    }
                  },
                  {
                    "range" : {
                      "price" : {
                        "lte" : 400.0
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        "fields" : {
          "_percolator_document_slot" : [
            0
          ]
        }
      }
    ]
  }
}
```
