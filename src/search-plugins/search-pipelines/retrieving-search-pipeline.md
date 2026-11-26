---
title: Retrieving search pipelines
---

# Retrieving search pipelines

To retrieve the details of an existing search pipeline, use the Search Pipeline API. 

To view all search pipelines, use the following request:

```json
GET /_search/pipeline
```

The response contains the pipeline that you set up in the previous section:
<details open markdown="block">
  <summary>
    Response
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

To view a particular pipeline, specify the pipeline name as a path parameter:

```json
GET /_search/pipeline/my_pipeline
```

You can also use wildcard patterns to view a subset of pipelines, for example:

```json
GET /_search/pipeline/my*
```
