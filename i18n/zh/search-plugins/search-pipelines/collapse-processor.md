---
title: Collapse
---

# Collapse 处理器

`collapse` 响应处理器会丢弃这样的命中（hit）：其特定字段的值与结果集中前面某个文档的该字段值相同。这与在搜索请求中传递 `collapse` 参数类似，但该响应处理器是在从所有分片获取结果之后作用于响应的。`collapse` 响应处理器可以与 `rescore` 搜索请求参数配合使用，也可以在重排序响应处理器之后应用。

使用 `collapse` 响应处理器很可能导致返回的结果少于 `size` 个，因为命中是从一个大小已经小于或等于 `size` 的集合中丢弃的。为了提高返回 `size` 个命中的可能性，可以使用 `oversample` 请求处理器和 `truncate_hits` 响应处理器，如[此示例](/search-plugins/search-pipelines/truncate-hits-processor#oversample-collapse-and-truncate-hits)所示。

## 请求字段

下表列出了所有请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`field` | String | 从每个返回的搜索命中中读取其值的字段。对于该字段的每个值，搜索响应中只返回第一个命中。必需。
`context_prefix` | String | 可用于从特定作用域读取 `original_size` 变量，以避免冲突。可选。
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。
`ignore_failure` | Boolean | 如果为 `true`，OpenSearch 会[忽略该处理器的任何失败](/search-plugins/search-pipelines/creating-search-pipeline#ignoring-processor-failures)，并继续运行搜索管道中剩余的处理器。可选。默认值为 `false`。

## 示例

以下示例演示如何使用包含 `collapse` 处理器的搜索管道。

### 准备工作

创建多个文档，其中包含一个用于折叠的字段：

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

### 使用搜索管道

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
