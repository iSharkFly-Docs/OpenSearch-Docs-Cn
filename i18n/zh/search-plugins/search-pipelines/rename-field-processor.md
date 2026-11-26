---
title: Rename field
---

# Rename field 处理器

`rename_field` 搜索响应处理器会拦截搜索响应并重命名指定的字段。当索引和应用对同一字段使用不同名称时，这个处理器非常有用。例如，如果你在索引中重命名了某个字段，`rename_field` 处理器可以在将响应发送给应用之前，把新名称改回旧名称。

## 请求字段

下表列出了所有可用的请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`field` | String | 要重命名的字段。必需。
`target_field` | String | 新的字段名称。必需。
`tag` | String | 处理器的标识符。 
`description` | String | 处理器的描述。 
`ignore_failure` | Boolean | 如果为 `true`，OpenSearch 会[忽略该处理器的任何失败](/search-plugins/search-pipelines/creating-search-pipeline#ignoring-processor-failures)，并继续运行搜索管道中剩余的处理器。可选。默认值为 `false`。

## 示例 

以下示例演示如何使用包含 `rename_field` 处理器的搜索管道。

### 准备工作

创建一个名为 `my_index` 的索引，并索引一个包含 `message` 字段的文档：

```json
POST /my_index/_doc/1
{
  "message": "This is a public message", 
  "visibility":"public"
}
```

### 创建搜索管道 

以下请求创建一个包含 `rename_field` 响应处理器的搜索管道，该处理器将字段 `message` 重命名为 `notification`：

```json
PUT /_search/pipeline/my_pipeline
{
  "response_processors": [
    {
      "rename_field": {
        "field": "message",
        "target_field": "notification"
      }
    }
  ]
}
```

### 使用搜索管道

不使用搜索管道，在 `my_index` 中搜索文档：

```json
GET /my_index/_search
```

响应包含字段 `message`：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took" : 1,
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
        "_index" : "my_index",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "message" : "This is a public message",
          "visibility" : "public"
        }
      }
    ]
  }
}
```
</details>

要使用管道进行搜索，请在 `search_pipeline` 查询参数中指定管道名称：

```json
GET /my_index/_search?search_pipeline=my_pipeline
```

`message` 字段已被重命名为 `notification`：

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
      "value" : 1,
      "relation" : "eq"
    },
    "max_score" : 0.0,
    "hits" : [
      {
        "_index" : "my_index",
        "_id" : "1",
        "_score" : 0.0,
        "_source" : {
          "visibility" : "public",
          "notification" : "This is a public message"
        }
      }
    ]
  }
}
```
</details>

也可以使用 `fields` 选项搜索文档中的特定字段：

```json
POST /my_index/_search?pretty&search_pipeline=my_pipeline
{
    "fields":["visibility", "message"]
}
``` 

在响应中，字段 `message` 已被重命名为 `notification`：

<details open markdown="block">
  <summary>
    响应
  </summary>

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
    "max_score" : 0.0,
    "hits" : [
      {
        "_index" : "my_index",
        "_id" : "1",
        "_score" : 0.0,
        "_source" : {
          "visibility" : "public",
          "notification" : "This is a public message"
        },
        "fields" : {
          "visibility" : [
            "public"
          ],
          "notification" : [
            "This is a public message"
          ]
        }
      }
    ]
  }
}

```
</details>
