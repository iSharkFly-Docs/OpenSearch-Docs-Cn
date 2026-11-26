---
title: 对话式搜索
---

# 对话式搜索

对话式搜索（conversational search）允许你用自然语言提问，并通过追问来完善答案。这样，对话就成为你与大语言模型（large language model，LLM）之间的交流。为此，模型不能孤立地回答每个问题，而需要记住整个对话的上下文。

对话式搜索通过以下组件实现：

- [对话历史](#conversation-history)：使 LLM 能够记住当前对话的上下文并理解追问。
- [检索增强生成（RAG）](#rag)：使 LLM 能够利用专有信息或最新信息补充其静态知识库。

## 对话历史

对话历史由一个类似 CRUD 的简单 API 构成，包含两种资源：*记忆*（memory）和*消息*（message）。当前对话的所有消息都存储在一个对话*记忆*中。一条*消息*表示一个问答对：人类输入的问题和 AI 的回答。消息不能单独存在，必须添加到某个记忆中。

## RAG

RAG 从索引和历史记录中检索数据，并将所有信息作为上下文发送给 LLM。随后，LLM 使用动态检索到的数据补充其静态知识库。在 OpenSearch 中，RAG 通过包含[检索增强生成处理器](/search-plugins/search-pipelines/rag-processor)的搜索管道（search pipeline）实现。该处理器会拦截 OpenSearch 查询结果，从对话记忆中检索该对话之前的消息，并向 LLM 发送提示词（prompt）。处理器收到 LLM 的响应后，会将响应保存到对话记忆中，并同时返回原始 OpenSearch 查询结果和 LLM 响应。

::: danger 警告
截至 OpenSearch 2.11，RAG 技术仅在 OpenAI 模型和 Amazon Bedrock 上的 Anthropic Claude 模型上进行过测试。
:::

::: info 注意
启用安全插件后，所有记忆都处于 `private` 安全模式。只有创建记忆的用户才能与该记忆交互，任何用户都无法看到其他用户的记忆。
:::

## 先决条件

要开始使用对话式搜索，请启用对话记忆和 RAG 管道功能：

```json
PUT /_cluster/settings
{
  "persistent": {
    "plugins.ml_commons.memory_feature_enabled": true,
    "plugins.ml_commons.rag_pipeline_feature_enabled": true
  }
}
```

## 使用对话式搜索

要使用对话式搜索，请按以下步骤操作：

1. [创建连接到模型的连接器](#step-1-create-a-connector-to-a-model)。
1. [注册并部署模型](#step-2-register-and-deploy-the-model)
1. [创建搜索管道](#step-3-create-a-search-pipeline)。
1. [将 RAG 数据摄取到索引中](#step-4-ingest-rag-data-into-an-index)。
1. [创建对话记忆](#step-5-create-a-conversation-memory)。
1. [使用管道进行 RAG](#step-6-use-the-pipeline-for-rag)。

### 第 1 步：创建连接到模型的连接器

RAG 需要 LLM 才能工作。要连接到 LLM，请创建一个[连接器](/ml-commons-plugin/remote-models/connectors)（connector）。以下请求为 OpenAI GPT 3.5 模型创建一个连接器：

```json
POST /_plugins/_ml/connectors/_create
{
  "name": "OpenAI Chat Connector",
  "description": "The connector to public OpenAI model service for GPT 3.5",
  "version": 2,
  "protocol": "http",
  "parameters": {
    "endpoint": "api.openai.com",
    "model": "gpt-3.5-turbo",
    "temperature": 0
  },
  "credential": {
    "openAI_key": "<YOUR_OPENAI_KEY>"
  },
  "actions": [
    {
      "action_type": "predict",
      "method": "POST",
      "url": "https://${parameters.endpoint}/v1/chat/completions",
      "headers": {
        "Authorization": "Bearer ${credential.openAI_key}"
      },
      "request_body": """{ "model": "${parameters.model}", "messages": ${parameters.messages}, "temperature": ${parameters.temperature} }"""
    }
  ]
}
```

OpenSearch 会返回该连接器的连接器 ID：

```json
{
  "connector_id": "u3DEbI0BfUsSoeNTti-1"
}
```

::: tip 提示
有关连接到其他服务和模型的示例请求，请参阅[连接器蓝图](/ml-commons-plugin/remote-models/blueprints)。
:::

### 第 2 步：注册并部署模型

注册你在上一步中为其创建了连接器的 LLM。要在 OpenSearch 中注册该模型，请提供上一步返回的 `connector_id`：

```json
POST /_plugins/_ml/models/_register
{
  "name": "openAI-gpt-3.5-turbo",
  "function_name": "remote",
  "description": "test model",
  "connector_id": "u3DEbI0BfUsSoeNTti-1"
}
``` 

OpenSearch 会返回注册任务的任务 ID 和已注册模型的模型 ID：

```json
{
  "task_id": "gXDIbI0BfUsSoeNT_jAb",
  "status": "CREATED",
  "model_id": "gnDIbI0BfUsSoeNT_jAw"
}
```

要验证注册是否完成，请调用 Tasks API：

```json
GET /_plugins/_ml/tasks/gXDIbI0BfUsSoeNT_jAb
```

响应中的 `state` 会变为 `COMPLETED`：

```json
{
  "model_id": "gnDIbI0BfUsSoeNT_jAw",
  "task_type": "REGISTER_MODEL",
  "function_name": "REMOTE",
  "state": "COMPLETED",
  "worker_node": [
    "kYv-Z5-mQ4uCUy_cRC6LXA"
  ],
  "create_time": 1706927128091,
  "last_update_time": 1706927128125,
  "is_async": false
}
```

要部署模型，请向 Deploy API 提供 `model_id`：

```json
POST /_plugins/_ml/models/gnDIbI0BfUsSoeNT_jAw/_deploy
```

OpenSearch 会确认模型已部署：

```json
{
  "task_id": "cnDObI0BfUsSoeNTDzGd",
  "task_type": "DEPLOY_MODEL",
  "status": "COMPLETED"
}
```

### 第 3 步：创建搜索管道

接下来，创建一个包含 `retrieval_augmented_generation` 处理器的搜索管道：

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

有关处理器字段的信息，请参阅[检索增强生成处理器](/search-plugins/search-pipelines/rag-processor)。

### 第 4 步：将 RAG 数据摄取到索引中

RAG 会用一些补充数据来增强 LLM 的知识。

首先，创建一个用于存储这些数据的索引，并将默认搜索管道设置为上一步创建的管道：

```json
PUT /my_rag_test_data
{
  "settings": {
    "index.search.default_pipeline" : "rag_pipeline"
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text"
      }
    }
  }
}
```

接下来，将补充数据摄取到索引中：

```json
POST _bulk
{"index": {"_index": "my_rag_test_data", "_id": "1"}}
{"text": "Abraham Lincoln was born on February 12, 1809, the second child of Thomas Lincoln and Nancy Hanks Lincoln, in a log cabin on Sinking Spring Farm near Hodgenville, Kentucky.[2] He was a descendant of Samuel Lincoln, an Englishman who migrated from Hingham, Norfolk, to its namesake, Hingham, Massachusetts, in 1638. The family then migrated west, passing through New Jersey, Pennsylvania, and Virginia.[3] Lincoln was also a descendant of the Harrison family of Virginia; his paternal grandfather and namesake, Captain Abraham Lincoln and wife Bathsheba (née Herring) moved the family from Virginia to Jefferson County, Kentucky.[b] The captain was killed in an Indian raid in 1786.[5] His children, including eight-year-old Thomas, Abraham's father, witnessed the attack.[6][c] Thomas then worked at odd jobs in Kentucky and Tennessee before the family settled in Hardin County, Kentucky, in the early 1800s."}
{"index": {"_index": "my_rag_test_data", "_id": "2"}}
{"text": "Chart and table of population level and growth rate for the New York City metro area from 1950 to 2023. United Nations population projections are also included through the year 2035.\\nThe current metro area population of New York City in 2023 is 18,937,000, a 0.37% increase from 2022.\\nThe metro area population of New York City in 2022 was 18,867,000, a 0.23% increase from 2021.\\nThe metro area population of New York City in 2021 was 18,823,000, a 0.1% increase from 2020.\\nThe metro area population of New York City in 2020 was 18,804,000, a 0.01% decline from 2019."}
```

## RAG 管道

RAG 是一种技术：它从索引中检索文档，将其传递给 seq2seq 模型（例如 LLM），然后在上下文中使用动态检索到的数据补充 LLM 的静态信息。

::: danger 警告
截至 OpenSearch 2.12，RAG 技术仅在 OpenAI 模型、Amazon Bedrock 上的 Anthropic Claude 模型以及 Cohere Command 模型上进行过测试。
:::

要配置 Cohere Command 模型以启用 RAG，需要使用后处理函数来转换模型输出。有关更多信息，请参阅 [Cohere RAG 教程](https://github.com/opensearch-project/ml-commons/blob/2.x/docs/tutorials/conversational_search/conversational_search_with_Cohere_Command.md)。

### 启用 RAG

### 第 5 步：创建对话记忆

你需要创建一个对话记忆，用于存储对话中的所有消息。为了便于识别该记忆，请在可选的 `name` 字段中为其提供一个名称，如下例所示。由于 `name` 参数不可更新，这是你为对话命名的唯一机会。

```json
POST /_plugins/_ml/memory/
{
  "name": "Conversation about NYC population"
}
```

OpenSearch 会返回新建记忆的记忆 ID：

```json
{
  "memory_id": "znCqcI0BfUsSoeNTntd7"
}
```

你将使用 `memory_id` 向该记忆中添加消息。

### 第 6 步：使用管道进行 RAG

要使用 RAG 管道，请向 OpenSearch 发送查询，并在 `ext.generative_qa_parameters` 对象中提供附加参数。

`generative_qa_parameters` 对象支持以下参数。

参数 | 必需 | 描述
:--- | :--- | :---
`llm_question` | 是 | LLM 必须回答的问题。
`llm_model` | 否 | 当你希望使用其他模型时（例如使用 GPT 4 而不是 GPT 3.5），覆盖连接中设置的原始模型。如果在创建管道时未设置默认模型，则该选项为必需。
`memory_id` | 否 | 如果提供了 `memory_id`，管道会检索指定记忆中最近的 10 条消息，并将其添加到 LLM 提示词中。如果未指定 `memory_id`，则不会将之前的上下文添加到 LLM 提示词中。
`context_size` | 否 | 发送给 LLM 的搜索结果数量。通常需要设置该参数以满足词元（token）数量限制，该限制因模型而异。或者，你也可以使用 Search API 中的 `size` 参数来控制发送给 LLM 的搜索结果数量。
`message_size` | 否 | 发送给 LLM 的消息数量。与搜索结果数量类似，它会影响 LLM 接收的词元总数。未设置时，管道使用默认消息数 `10`。
`timeout` | 否 | 管道等待通过连接器访问的远程模型响应的秒数。默认值为 `30`。

::: info 注意
如果你的 LLM 设有词元限制，请在 OpenSearch 查询中设置 `size` 字段，以限制搜索响应中使用的文档数量。否则，RAG 管道会将搜索结果中的每个文档都发送给 LLM。
:::

如果你向 LLM 询问有关当下的问题，它无法给出答案，因为它是基于几年前的数据训练的。但是，如果你将最新信息作为上下文添加进来，LLM 就能生成响应。例如，你可以询问 LLM 2023 年纽约市都会区的人口。你将构造一个包含 OpenSearch match 查询和 LLM 查询的查询。请提供 `memory_id`，以便将消息存储到相应的记忆对象中：

```json
GET /my_rag_test_data/_search
{
  "query": {
    "match": {
      "text": "What's the population of NYC metro area in 2023"
    }
  },
  "ext": {
    "generative_qa_parameters": {
      "llm_model": "gpt-3.5-turbo",
      "llm_question": "What's the population of NYC metro area in 2023",
      "memory_id": "znCqcI0BfUsSoeNTntd7",
      "context_size": 5,
      "message_size": 5,
      "timeout": 15
    }
  }
}
```

由于上下文中包含一个记录纽约市人口信息的文档，LLM 能够正确回答该问题（不过答案中包含了「projected」（预计）一词，因为它是基于前几年的数据训练的）。响应中包含来自补充 RAG 数据的匹配文档以及 LLM 响应：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 5.781642,
    "hits": [
      {
        "_index": "my_rag_test_data",
        "_id": "2",
        "_score": 5.781642,
        "_source": {
          "text": """Chart and table of population level and growth rate for the New York City metro area from 1950 to 2023. United Nations population projections are also included through the year 2035.\nThe current metro area population of New York City in 2023 is 18,937,000, a 0.37% increase from 2022.\nThe metro area population of New York City in 2022 was 18,867,000, a 0.23% increase from 2021.\nThe metro area population of New York City in 2021 was 18,823,000, a 0.1% increase from 2020.\nThe metro area population of New York City in 2020 was 18,804,000, a 0.01% decline from 2019."""
        }
      },
      {
        "_index": "my_rag_test_data",
        "_id": "1",
        "_score": 0.9782871,
        "_source": {
          "text": "Abraham Lincoln was born on February 12, 1809, the second child of Thomas Lincoln and Nancy Hanks Lincoln, in a log cabin on Sinking Spring Farm near Hodgenville, Kentucky.[2] He was a descendant of Samuel Lincoln, an Englishman who migrated from Hingham, Norfolk, to its namesake, Hingham, Massachusetts, in 1638. The family then migrated west, passing through New Jersey, Pennsylvania, and Virginia.[3] Lincoln was also a descendant of the Harrison family of Virginia; his paternal grandfather and namesake, Captain Abraham Lincoln and wife Bathsheba (née Herring) moved the family from Virginia to Jefferson County, Kentucky.[b] The captain was killed in an Indian raid in 1786.[5] His children, including eight-year-old Thomas, Abraham's father, witnessed the attack.[6][c] Thomas then worked at odd jobs in Kentucky and Tennessee before the family settled in Hardin County, Kentucky, in the early 1800s."
        }
      }
    ]
  },
  "ext": {
    "retrieval_augmented_generation": {
      "answer": "The population of the New York City metro area in 2023 is projected to be 18,937,000.",
      "message_id": "x3CecI0BfUsSoeNT9tV9"
    }
  }
}
```
</details>

现在，你将在同一对话中向 LLM 提出一个追问。同样，在请求中提供 `memory_id`：

```json
GET /my_rag_test_data/_search
{
  "query": {
    "match": {
      "text": "What was it in 2022"
    }
  },
  "ext": {
    "generative_qa_parameters": {
      "llm_model": "gpt-3.5-turbo",
      "llm_question": "What was it in 2022",
      "memory_id": "znCqcI0BfUsSoeNTntd7",
      "context_size": 5,
      "message_size": 5,
      "timeout": 15
    }
  }
}
```

LLM 正确识别了对话主题，并返回了相关的响应：

```json
{
  ...
  "ext": {
    "retrieval_augmented_generation": {
      "answer": "The population of the New York City metro area in 2022 was 18,867,000.",
      "message_id": "p3CvcI0BfUsSoeNTj9iH"
    }
  }
}
```

要验证两条消息是否都已添加到记忆中，请向 Get Messages API 提供 `memory_ID`：

```json
GET /_plugins/_ml/memory/znCqcI0BfUsSoeNTntd7/messages
```

响应中包含这两条消息：

<details open markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "messages": [
    {
      "memory_id": "znCqcI0BfUsSoeNTntd7",
      "message_id": "x3CecI0BfUsSoeNT9tV9",
      "create_time": "2024-02-03T20:33:50.754708446Z",
      "input": "What's the population of NYC metro area in 2023",
      "prompt_template": """[{"role":"system","content":"You are a helpful assistant"},{"role":"user","content":"Generate a concise and informative answer in less than 100 words for the given question"}]""",
      "response": "The population of the New York City metro area in 2023 is projected to be 18,937,000.",
      "origin": "retrieval_augmented_generation",
      "additional_info": {
        "metadata": """["Chart and table of population level and growth rate for the New York City metro area from 1950 to 2023. United Nations population projections are also included through the year 2035.\\nThe current metro area population of New York City in 2023 is 18,937,000, a 0.37% increase from 2022.\\nThe metro area population of New York City in 2022 was 18,867,000, a 0.23% increase from 2021.\\nThe metro area population of New York City in 2021 was 18,823,000, a 0.1% increase from 2020.\\nThe metro area population of New York City in 2020 was 18,804,000, a 0.01% decline from 2019.","Abraham Lincoln was born on February 12, 1809, the second child of Thomas Lincoln and Nancy Hanks Lincoln, in a log cabin on Sinking Spring Farm near Hodgenville, Kentucky.[2] He was a descendant of Samuel Lincoln, an Englishman who migrated from Hingham, Norfolk, to its namesake, Hingham, Massachusetts, in 1638. The family then migrated west, passing through New Jersey, Pennsylvania, and Virginia.[3] Lincoln was also a descendant of the Harrison family of Virginia; his paternal grandfather and namesake, Captain Abraham Lincoln and wife Bathsheba (née Herring) moved the family from Virginia to Jefferson County, Kentucky.[b] The captain was killed in an Indian raid in 1786.[5] His children, including eight-year-old Thomas, Abraham's father, witnessed the attack.[6][c] Thomas then worked at odd jobs in Kentucky and Tennessee before the family settled in Hardin County, Kentucky, in the early 1800s."]"""
      }
    },
    {
      "memory_id": "znCqcI0BfUsSoeNTntd7",
      "message_id": "p3CvcI0BfUsSoeNTj9iH",
      "create_time": "2024-02-03T20:36:10.24453505Z",
      "input": "What was it in 2022",
      "prompt_template": """[{"role":"system","content":"You are a helpful assistant"},{"role":"user","content":"Generate a concise and informative answer in less than 100 words for the given question"}]""",
      "response": "The population of the New York City metro area in 2022 was 18,867,000.",
      "origin": "retrieval_augmented_generation",
      "additional_info": {
        "metadata": """["Chart and table of population level and growth rate for the New York City metro area from 1950 to 2023. United Nations population projections are also included through the year 2035.\\nThe current metro area population of New York City in 2023 is 18,937,000, a 0.37% increase from 2022.\\nThe metro area population of New York City in 2022 was 18,867,000, a 0.23% increase from 2021.\\nThe metro area population of New York City in 2021 was 18,823,000, a 0.1% increase from 2020.\\nThe metro area population of New York City in 2020 was 18,804,000, a 0.01% decline from 2019.","Abraham Lincoln was born on February 12, 1809, the second child of Thomas Lincoln and Nancy Hanks Lincoln, in a log cabin on Sinking Spring Farm near Hodgenville, Kentucky.[2] He was a descendant of Samuel Lincoln, an Englishman who migrated from Hingham, Norfolk, to its namesake, Hingham, Massachusetts, in 1638. The family then migrated west, passing through New Jersey, Pennsylvania, and Virginia.[3] Lincoln was also a descendant of the Harrison family of Virginia; his paternal grandfather and namesake, Captain Abraham Lincoln and wife Bathsheba (née Herring) moved the family from Virginia to Jefferson County, Kentucky.[b] The captain was killed in an Indian raid in 1786.[5] His children, including eight-year-old Thomas, Abraham's father, witnessed the attack.[6][c] Thomas then worked at odd jobs in Kentucky and Tennessee before the family settled in Hardin County, Kentucky, in the early 1800s."]"""
      }
    }
  ]
}
```
</details>

## 后续步骤

- 要了解有关连接外部平台上的模型的更多信息，请参阅[连接器](/ml-commons-plugin/remote-models/connectors)。
- 有关支持的 API，请参阅 [Memory API](/ml-commons-plugin/api/memory-apis/)。
- 要了解有关搜索管道和处理器的更多信息，请参阅[搜索管道](/search-plugins/search-pipelines/)。
- 有关可用的 OpenSearch 查询，请参阅 [Query DSL](/query-dsl/)。
