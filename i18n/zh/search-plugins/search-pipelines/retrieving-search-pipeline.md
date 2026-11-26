---
title: 获取搜索管道
---

# 获取搜索管道

要获取现有搜索管道的详细信息，请使用 Search Pipeline API。 

要查看所有搜索管道，请使用以下请求：

```json
GET /_search/pipeline
```

响应包含你在上一节中设置的管道：
<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "my_pipeline" : {
    "request_processors" : [
      {
        "filter_query" : {
          "tag" : "tag1",
          "description" : "This processor is going to restrict to publicly visible documents",
          "query" : {
            "term" : {
              "visibility" : "public"
            }
          }
        }
      }
    ]
  }
}
```
</details>

要查看特定管道，请将管道名称指定为路径参数：

```json
GET /_search/pipeline/my_pipeline
```

也可以使用通配符模式查看部分管道，例如：

```json
GET /_search/pipeline/my*
```
