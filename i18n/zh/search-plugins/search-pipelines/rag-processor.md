---
title: 检索增强生成
---

# 检索增强生成处理器

`retrieval_augmented_generation` 处理器是一个搜索结果处理器，可以在[对话式搜索](/search-plugins/conversational-search)（conversational search）中用于检索增强生成（retrieval-augmented generation，RAG）。该处理器会拦截查询结果，从对话记忆中检索该对话之前的消息，并向大语言模型（LLM）发送提示词。处理器收到 LLM 的响应后，会将响应保存到对话记忆中，并同时返回原始的 OpenSearch 查询结果和 LLM 响应。

::: info 注意
截至 OpenSearch 2.12，`retrieval_augmented_generation` 处理器仅支持 OpenAI 和 Amazon Bedrock 模型。
:::

## 请求字段

下表列出了所有可用的请求字段。

字段 | 数据类型 | 描述
:--- | :--- | :---
`model_id` | String | 管道中使用的模型的 ID。必需。
`context_field_list` | Array | 文档 source 中所包含字段的列表，管道将这些字段用作 RAG 的上下文。必需。有关更多信息，请参阅[上下文字段列表](#context-field-list)。 
`system_prompt` | String | 发送给 LLM 的系统提示词，用于调整其行为，例如回答的语气。可以是角色设定描述或一组指令。可选。
`user_instructions` | String | 发送给 LLM 的人工编写的指令，用于引导其生成结果。 
`tag` | String | 处理器的标识符。可选。
`description` | String | 处理器的描述。可选。

### 上下文字段列表

`context_field_list` 是文档 source 中所包含字段的列表，管道将这些字段用作 RAG 的上下文。例如，假设你的 OpenSearch 索引包含一组文档，每个文档都有 `title` 和 `text`：

```json
{
  "_index": "qa_demo",
  "_id": "SimKcIoBOVKVCYpk1IL-",
  "_source": {
    "title": "Abraham Lincoln 2",
    "text": "Abraham Lincoln was born on February 12, 1809, the second child of Thomas Lincoln and Nancy Hanks Lincoln, in a log cabin on Sinking Spring Farm near Hodgenville, Kentucky.[2] He was a descendant of Samuel Lincoln, an Englishman who migrated from Hingham, Norfolk, to its namesake, Hingham, Massachusetts, in 1638. The family then migrated west, passing through New Jersey, Pennsylvania, and Virginia.[3] Lincoln was also a descendant of the Harrison family of Virginia; his paternal grandfather and namesake, Captain Abraham Lincoln and wife Bathsheba (née Herring) moved the family from Virginia to Jefferson County, Kentucky.[b] The captain was killed in an Indian raid in 1786.[5] His children, including eight-year-old Thomas, Abraham's father, witnessed the attack.[6][c] Thomas then worked at odd jobs in Kentucky and Tennessee before the family settled in Hardin County, Kentucky, in the early 1800s.[6]\n"
  }
}
```

可以在处理器中设置 `"context_field_list": ["text"]`，指定只将 `text` 的内容发送给 LLM。 

## 示例 

以下示例演示如何使用包含 `retrieval_augmented_generation` 处理器的搜索管道。 

### 创建搜索管道 

以下请求为 OpenAI 模型创建一个包含 `retrieval_augmented_generation` 处理器的搜索管道：

```json
PUT /_search/pipeline/rag_pipeline
{
  "response_processors": [
    {
      "retrieval_augmented_generation": {
        "tag": "openai_pipeline_demo",
        "description": "Demo pipeline Using OpenAI Connector",
        "model_id": "gnDIbI0BfUsSoeNT_jAw",
        "context_field_list": ["text"],
        "system_prompt": "You are a helpful assistant",
        "user_instructions": "Generate a concise and informative answer in less than 100 words for the given question"
      }
    }
  ]
}
```

### 使用搜索管道

将 OpenSearch 查询与一个 `ext` 对象组合使用，该对象存储了供 LLM 使用的生成式问答参数：

```json
GET /my_rag_test_data/_search?search_pipeline=rag_pipeline
{
  "query": {
    "match": {
      "text": "Abraham Lincoln"
    }
  },
  "ext": {
    "generative_qa_parameters": {
      "llm_model": "gpt-3.5-turbo",
      "llm_question": "Was Abraham Lincoln a good politician",
      "memory_id": "iXC4bI0BfUsSoeNTjS30",
      "context_size": 5,
      "message_size": 5,
      "timeout": 15
    }
  }
}
```

有关设置对话式搜索的更多信息，请参阅[使用对话式搜索](/search-plugins/conversational-search#using-conversational-search)。
