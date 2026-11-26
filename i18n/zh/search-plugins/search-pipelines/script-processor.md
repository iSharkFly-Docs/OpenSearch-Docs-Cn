---
title: Script
---

# Script 处理器

`script` 搜索请求处理器会拦截搜索请求，并添加一个对传入请求运行的内联 Painless 脚本。该脚本只能作用于以下请求字段：

- `from` 
- `size` 
- `explain` 
- `version` 
- `seq_no_primary_term` 
- `track_scores`  
- `track_total_hits` 
- `min_score` 
- `terminate_after` 
- `profile` 

有关请求字段的定义，请参阅[搜索请求字段](/api-reference/search#request-body)。

## 请求字段

下表列出了所有可用的请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`source` | Inline script | 要运行的脚本。必需。
`lang` | String | 脚本语言。可选。仅支持 `painless`。
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。
`ignore_failure` | Boolean | 如果为 `true`，OpenSearch 会[忽略该处理器的任何失败](/search-plugins/search-pipelines/creating-search-pipeline#ignoring-processor-failures)，并继续运行搜索管道中剩余的处理器。可选。默认值为 `false`。

## 示例 

以下请求创建一个包含 `script` 请求处理器的搜索管道。由于 `explain` 是一项开销很大的操作，该脚本将评分解释限制为只针对一个文档：

```json
PUT /_search/pipeline/explain_one_result
{
  "description": "A pipeline to limit the explain operation to one result only",
  "request_processors": [
    {
      "script": {
        "lang": "painless",
        "source": "if (ctx._source['size'] > 1) { ctx._source['explain'] = false } else { ctx._source['explain'] = true }"
      }
    }
  ]
} 
```
