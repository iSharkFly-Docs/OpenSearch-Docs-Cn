---
title: Truncate hits
---

# Truncate hits 处理器

`truncate_hits` 响应处理器在达到给定的命中数后丢弃其余返回的搜索命中。`truncate_hits` 处理器设计用于配合 [`oversample` 请求处理器](/search-plugins/search-pipelines/oversample-processor)使用，但也可以单独使用。

`target_size` 参数（指定在何处截断）是可选的。如果未指定，OpenSearch 会使用 `oversample` 处理器设置的 `original_size` 变量（如果存在）。

以下是一种常见的使用模式：

1. 将 `oversample` 处理器添加到请求管道中，以获取更大的结果集。
1. 在响应管道中，应用重排序处理器（可能会把原先请求的前 N 个之外的结果提升上来）或 `collapse` 处理器（去重后可能会丢弃部分结果）。
1. 应用 `truncate` 处理器，返回（最多）原先请求数量的命中。

## 请求字段

下表列出了所有请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`target_size` | Integer | 要返回的搜索命中的最大数量（>=0）。如果未指定，处理器会尝试读取 `original_size` 变量，如果该变量不可用，处理器将失败。可选。
`context_prefix` | String | 可用于从特定作用域读取 `original_size` 变量，以避免冲突。可选。
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。
`ignore_failure` | Boolean | 如果为 `true`，OpenSearch 会[忽略该处理器的任何失败](/search-plugins/search-pipelines/creating-search-pipeline#ignoring-processor-failures)，并继续运行搜索管道中剩余的处理器。可选。默认值为 `false`。

## 示例

以下示例演示如何使用包含 `truncate` 处理器的搜索管道。

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

以下请求创建一个名为 `my_pipeline` 的搜索管道，其中包含一个 `truncate_hits` 响应处理器，该处理器会丢弃前五个之后的命中：

```json
PUT /_search/pipeline/my_pipeline 
{
  "response_processors": [
    {
      "truncate_hits" : {
        "tag" : "truncate_1",
        "description" : "This processor will discard results after the first 5.",
        "target_size" : 5
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
  "size": 8
}
```

响应包含八个命中：

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

要使用管道进行搜索，请在 `search_pipeline` 查询参数中指定管道名称：

```json
POST /my_index/_search?search_pipeline=my_pipeline
{
  "size": 8
}
```

尽管请求了 8 个命中且有 10 个可用，响应中只包含 5 个命中：

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

## 过采样、折叠与截断命中

下面是一个更贴近实际的示例：使用 `oversample` 请求大量候选文档，使用 `collapse` 移除在某个字段上重复的文档（以获得更多样化的结果），然后使用 `truncate` 返回原先请求的文档数量（以避免从集群返回过大的结果载荷）。

### 准备工作 {#setup-1}

创建多个文档，其中包含一个将用于折叠的字段：

```json
POST /_bulk
{ "create":{"_index":"my_index","_id":1}}
{ "title" : "document 1", "color":"blue" }
{ "create":{"_index":"my_index","_id":2}}
{ "title" : "document 2", "color":"blue" }
{ "create":{"_index":"my_index","_id":3}}
{ "title" : "document 3", "color":"red" }
{ "create":{"_index":"my_index","_id":4}}
{ "title" : "document 4", "color":"red" }
{ "create":{"_index":"my_index","_id":5}}
{ "title" : "document 5", "color":"yellow" }
{ "create":{"_index":"my_index","_id":6}}
{ "title" : "document 6", "color":"yellow" }
{ "create":{"_index":"my_index","_id":7}}
{ "title" : "document 7", "color":"orange" }
{ "create":{"_index":"my_index","_id":8}}
{ "title" : "document 8", "color":"orange" }
{ "create":{"_index":"my_index","_id":9}}
{ "title" : "document 9", "color":"green" }
{ "create":{"_index":"my_index","_id":10}}
{ "title" : "document 10", "color":"green" }
``` 

创建一个只按 `color` 字段折叠的管道：

```json
PUT /_search/pipeline/collapse_pipeline
{
  "response_processors": [
    {
      "collapse" : {
        "field": "color"
      }
    }
  ]
}
```

再创建一个依次进行过采样、折叠和截断结果的管道：

```json
PUT /_search/pipeline/oversampling_collapse_pipeline
{
  "request_processors": [
    {
      "oversample": {
        "sample_factor": 3
      }
    }
  ],
  "response_processors": [
    {
      "collapse" : {
        "field": "color"
      }
    },
    {
      "truncate_hits": {
        "description": "Truncates back to the original size before oversample increased it."
      }
    }
  ]
}
```

### 不过采样直接折叠

在本例中，请求在按 `color` 字段折叠之前的前三个文档。由于前两个文档的 `color` 相同，第二个文档会被丢弃，因此请求返回第一个和第三个文档：

```json
POST /my_index/_search?search_pipeline=collapse_pipeline
{
  "size": 3
}
```

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took" : 2,
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
          "title" : "document 1",
          "color" : "blue"
        }
      },
      {
        "_index" : "my_index",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "title" : "document 3",
          "color" : "red"
        }
      }
    ]
  },
  "profile" : {
    "shards" : [ ]
  }
}
```
</details>

### 过采样、折叠与截断

现在使用 `oversampling_collapse_pipeline`，它请求前 9 个文档（将 size 乘以 3），按 `color` 去重，然后返回前 3 个命中：

```json
POST /my_index/_search?search_pipeline=oversampling_collapse_pipeline
{
  "size": 3
}
```

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took" : 2,
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
          "title" : "document 1",
          "color" : "blue"
        }
      },
      {
        "_index" : "my_index",
        "_id" : "3",
        "_score" : 1.0,
        "_source" : {
          "title" : "document 3",
          "color" : "red"
        }
      },
      {
        "_index" : "my_index",
        "_id" : "5",
        "_score" : 1.0,
        "_source" : {
          "title" : "document 5",
          "color" : "yellow"
        }
      }
    ]
  },
  "profile" : {
    "shards" : [ ]
  }
}
```
</details>
