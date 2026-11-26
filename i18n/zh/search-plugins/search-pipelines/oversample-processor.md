---
title: Oversample
---

# Oversample 处理器

`oversample` 请求处理器将搜索请求的 `size` 参数乘以指定的 `sample_factor`（>= 1.0），并将原始值保存在 `original_size` 管道变量中。`oversample` 处理器设计用于配合 [`truncate_hits` 响应处理器](/search-plugins/search-pipelines/truncate-hits-processor)使用，但也可以单独使用。

## 请求字段

下表列出了所有请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`sample_factor` | Float | 在处理搜索请求之前应用于 `size` 参数的乘数因子（>= 1.0）。必需。
`context_prefix` | String | 可用于限定 `original_size` 变量的作用域，以避免冲突。可选。
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。
`ignore_failure` | Boolean | 如果为 `true`，OpenSearch 会[忽略该处理器的任何失败](/search-plugins/search-pipelines/creating-search-pipeline#ignoring-processor-failures)，并继续运行搜索管道中剩余的处理器。可选。默认值为 `false`。

## 示例

以下示例演示如何使用包含 `oversample` 处理器的搜索管道。

### 准备工作

创建一个名为 `my_index` 的索引，其中包含多个文档：

```json
POST /_bulk
{ "create":{"_index":"my_index","_id":1}}
{ "doc": { "title" : "document 1" }}
{ "create":{"_index":"my_index","_id":2}}
{ "doc": { "title" : "document 2" }}
{ "create":{"_index":"my_index","_id":3}}
{ "doc": { "title" : "document 3" }}
{ "create":{"_index":"my_index","_id":4}}
{ "doc": { "title" : "document 4" }}
{ "create":{"_index":"my_index","_id":5}}
{ "doc": { "title" : "document 5" }}
{ "create":{"_index":"my_index","_id":6}}
{ "doc": { "title" : "document 6" }}
{ "create":{"_index":"my_index","_id":7}}
{ "doc": { "title" : "document 7" }}
{ "create":{"_index":"my_index","_id":8}}
{ "doc": { "title" : "document 8" }}
{ "create":{"_index":"my_index","_id":9}}
{ "doc": { "title" : "document 9" }}
{ "create":{"_index":"my_index","_id":10}}
{ "doc": { "title" : "document 10" }}
```

### 创建搜索管道

以下请求创建一个名为 `my_pipeline` 的搜索管道，其中包含一个 `oversample` 请求处理器，该处理器请求的命中数比 `size` 中指定的多 50%：

```json
PUT /_search/pipeline/my_pipeline 
{
  "request_processors": [
    {
      "oversample" : {
        "tag" : "oversample_1",
        "description" : "This processor will multiply `size` by 1.5.",
        "sample_factor" : 1.5
      }
    }
  ]
}
```

### 使用搜索管道

不使用搜索管道，在 `my_index` 中搜索文档：

```json
POST /my_index/_search
{
  "size": 5
}
```

响应包含五个命中：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took" : 3,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 10,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "my_index",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 1"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 2"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 3"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "4",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 4"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "5",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 5"
          }
        }
      }
    ]
  }
}
```
</details>

要使用管道进行搜索，请在 `search_pipeline` 查询参数中指定管道名称：

```json
POST /my_index/_search?search_pipeline=my_pipeline
{
  "size": 5
}
```

响应包含 8 个文档（5 * 1.5 = 7.5，向上取整为 8）：

<details open markdown="block">
  <summary>
    响应
  </summary>
  
```json
{
  "took" : 13,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 10,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "my_index",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 1"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 2"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 3"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "4",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 4"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "5",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 5"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "6",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 6"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "7",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 7"
          }
        }
      },
      {
        "_index" : "my_index",
        "_id" : "8",
        "_score" : 1.0,
        "_source" : {
          "doc" : {
            "title" : "document 8"
          }
        }
      }
    ]
  }
}
```
</details>
