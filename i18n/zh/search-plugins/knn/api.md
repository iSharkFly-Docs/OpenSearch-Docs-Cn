---
title: API
---

# k-NN 插件 API

k-NN 插件添加了多个 API，用于管理、监控和优化 k-NN 工作负载。

## 统计信息
<Badge type="tip" text="Introduced 1.0" />

k-NN `stats` API 提供有关 k-NN 插件当前状态的信息。该插件会跟踪集群级和节点级的统计信息。集群级统计信息对整个集群只有一个值，节点级统计信息对集群中的每个节点各有一个值。你可以按 `nodeId` 和 `statName` 过滤查询：
```
GET /_plugins/_knn/nodeId1,nodeId2/stats/statName1,statName2
```

统计项 |  描述
:--- | :---
`circuit_breaker_triggered` | 表示断路器是否已触发。该统计项仅与近似 k-NN 搜索相关。
`total_load_time` | k-NN 将原生库索引加载到缓存中所花费的时间，单位为纳秒。该统计项仅与近似 k-NN 搜索相关。
`eviction_count` | 由于内存限制或空闲时间而被逐出缓存的原生库索引数量。该统计项仅与近似 k-NN 搜索相关。<br /> **注意**：因删除索引而发生的显式逐出不计入在内。
`hit_count` | 缓存命中次数。当用户查询已加载到内存中的原生库索引时，即发生缓存命中。该统计项仅与近似 k-NN 搜索相关。
`miss_count` | 缓存未命中次数。当用户查询尚未加载到内存中的原生库索引时，即发生缓存未命中。该统计项仅与近似 k-NN 搜索相关。
`graph_memory_usage` | 节点上原生库索引使用的原生内存量，单位为 KB。
`graph_memory_usage_percentage` | 节点上原生库索引使用的原生内存量占最大缓存容量的百分比。
`graph_index_requests` | 将文档的 `knn_vector` 字段添加到原生库索引的请求数。
`graph_index_errors` | 将文档的 `knn_vector` 字段添加到原生库索引时出错的请求数。
`graph_query_requests` | 已执行的原生库索引查询数。
`graph_query_errors` | 出错的原生库索引查询数。
`knn_query_requests` | 收到的 k-NN 查询请求数。
`cache_capacity_reached` | 是否已达到 `knn.memory.circuit_breaker.limit`。该统计项仅与近似 k-NN 搜索相关。
`load_success_count` | k-NN 成功将原生库索引加载到缓存中的次数。该统计项仅与近似 k-NN 搜索相关。
`load_exception_count` | 尝试将原生库索引加载到缓存时发生异常的次数。该统计项仅与近似 k-NN 搜索相关。
`indices_in_cache` | 对于每个包含 `knn_vector` 字段并启用了近似 k-NN 的 OpenSearch 索引，该统计项提供该 OpenSearch 索引拥有的原生库索引数量，以及该 OpenSearch 索引使用的 `graph_memory_usage` 总量（单位为 KB）。
`script_compilations` | k-NN 脚本被编译的次数。该值通常应为 1 或 0，但如果存放已编译脚本的缓存已满，k-NN 脚本可能会被重新编译。该统计项仅与 k-NN 评分脚本搜索相关。
`script_compilation_errors` | 脚本编译期间发生的错误数。该统计项仅与 k-NN 评分脚本搜索相关。
`script_query_requests` | 脚本查询总数。该统计项仅与 k-NN 评分脚本搜索相关。
`script_query_errors` | 脚本查询期间发生的错误数。该统计项仅与 k-NN 评分脚本搜索相关。
`nmslib_initialized` | 布尔值，表示 *nmslib* JNI 库是否已在该节点上加载并初始化。
`faiss_initialized` | 布尔值，表示 *faiss* JNI 库是否已在该节点上加载并初始化。
`model_index_status` | 模型系统索引的状态。有效值为 "red"、"yellow"、"green"。如果该索引不存在，则为 null。
`indexing_from_model_degraded` | 布尔值，表示基于模型的索引是否已降级。当 JVM 内存不足以缓存模型时会出现这种情况。
`training_requests` | 向该节点发出的训练请求数。
`training_errors` | 该节点上发生的训练错误数。
`training_memory_usage` | 该节点上训练使用的原生内存量，单位为 KB。
`training_memory_usage_percentage` | 该节点上训练使用的原生内存量占最大缓存容量的百分比。

**注意**：某些统计项的名称中包含 *graph*。在这些情况下，*graph* 等同于*原生库索引*。*graph*（图）这一术语是历史遗留的细节，源自该插件仅支持由分层图构成的 HNSW 算法的时期。

### 用法

```json
GET /_plugins/_knn/stats?pretty
{
    "_nodes" : {
        "total" : 1,
        "successful" : 1,
        "failed" : 0
    },
    "cluster_name" : "my-cluster",
    "circuit_breaker_triggered" : false,
    "model_index_status" : "YELLOW",
    "nodes" : {
      "JdfxIkOS1-43UxqNz98nw" : {
        "graph_memory_usage_percentage" : 3.68,
        "graph_query_requests" : 1420920,
        "graph_memory_usage" : 2,
        "cache_capacity_reached" : false,
        "load_success_count" : 179,
        "training_memory_usage" : 0,
        "indices_in_cache" : {
            "myindex" : {
                "graph_memory_usage" : 2,
                "graph_memory_usage_percentage" : 3.68,
                "graph_count" : 2
            }
        },
        "script_query_errors" : 0,
        "hit_count" : 1420775,
        "knn_query_requests" : 147092,
        "total_load_time" : 2436679306,
        "miss_count" : 179,
        "training_memory_usage_percentage" : 0.0,
        "graph_index_requests" : 656,
        "faiss_initialized" : true,
        "load_exception_count" : 0,
        "training_errors" : 0,
        "eviction_count" : 0,
        "nmslib_initialized" : false,
        "script_compilations" : 0,
        "script_query_requests" : 0,
        "graph_query_errors" : 0,
        "indexing_from_model_degraded" : false,
        "graph_index_errors" : 0,
        "training_requests" : 17,
        "script_compilation_errors" : 0
    }
  }
}
```

```json
GET /_plugins/_knn/HYMrXXsBSamUkcAjhjeN0w/stats/circuit_breaker_triggered,graph_memory_usage?pretty
{
    "_nodes" : {
        "total" : 1,
        "successful" : 1,
        "failed" : 0
    },
    "cluster_name" : "my-cluster",
    "circuit_breaker_triggered" : false,
    "nodes" : {
        "HYMrXXsBSamUkcAjhjeN0w" : {
            "graph_memory_usage" : 1
        }
    }
}
```

## 预热操作
<Badge type="tip" text="Introduced 1.0" />

用于执行近似 k 最近邻（k-NN）搜索的原生库索引以特殊文件的形式与其他 Apache Lucene 段文件存储在一起。为了使用 k-NN 插件对这些索引执行搜索，插件需要将这些文件加载到原生内存中。

如果插件尚未将这些文件加载到原生内存中，它会在收到搜索请求时加载。加载时间可能导致初始查询出现较高的延迟。为了避免这种情况，用户通常会在预热期间运行随机查询。预热期结束后，文件已加载到原生内存中，即可开始生产工作负载。这种加载过程是间接的，需要额外的工作。

作为替代方案，你可以对想要搜索的索引运行 k-NN 插件的预热（warmup）API 操作来避免这一延迟问题。该操作会将请求中指定的所有索引的所有分片（主分片和副本分片）的全部原生库文件加载到原生内存中。

该过程完成后，你就可以开始搜索这些索引，而不会产生初始延迟。预热 API 操作是幂等的，因此如果某个段的原生库文件已经加载到内存中，该操作不会产生任何影响。它只会加载当前不在内存中的文件。

### 用法 {#usage-1}

以下请求对三个索引执行预热：

```json
GET /_plugins/_knn/warmup/index1,index2,index3?pretty
{
  "_shards" : {
    "total" : 6,
    "successful" : 6,
    "failed" : 0
  }
}
```

`total` 表示 k-NN 插件尝试预热的分片数量。响应中还包含插件预热成功和失败的分片数量。

在预热操作完成或请求超时之前，该调用不会返回结果。如果请求超时，该操作仍会在集群上继续执行。要监控预热操作，请使用 OpenSearch `_tasks` API：

```json
GET /_tasks
```

操作完成后，使用 [k-NN `_stats` API 操作](#stats)查看 k-NN 插件已将哪些内容加载到图中。

### 最佳实践

为了让预热操作正常工作，请遵循以下最佳实践：

* 不要对想要预热的索引运行合并操作。在合并期间，k-NN 插件会创建新的段，旧的段有时会被删除。例如，你可能会遇到这样的情况：预热 API 操作将原生库索引 A 和 B 加载到原生内存中，但随后段 A 和 B 合并生成了段 C。此时 A 和 B 的原生库索引将不再位于内存中，而原生库索引 C 也不在内存中。在这种情况下，加载原生库索引 C 的初始开销依然存在。

* 确认想要预热的所有原生库索引都能放入原生内存中。有关原生内存限制的更多信息，请参阅 [knn.memory.circuit_breaker.limit 统计项](/search-plugins/knn/settings#cluster-settings)。较高的图内存使用量会导致缓存抖动，从而可能使操作不断失败并反复尝试重新运行。

* 不要索引任何想要加载到缓存中的文档。向段中写入新信息会使预热 API 操作在原生库索引变为可搜索之前无法加载它们。这意味着在索引完成后，你必须再次运行预热操作。

## 获取模型
<Badge type="tip" text="Introduced 1.2" />

用于检索集群中现有模型的信息。某些原生库索引配置需要在开始索引和查询之前执行训练步骤。训练的输出是一个模型，可在索引期间用于初始化原生库索引文件。该模型会被序列化并存储在 k-NN 模型系统索引中。

```
GET /_plugins/_knn/models/{model_id}
```

响应字段 |  描述
:--- | :---
`model_id` | 所获取模型的 ID。
`model_blob` | 序列化模型的 base64 编码字符串。
`state` | 模型的当前状态，取值为 "created"、"failed"、"training" 之一。
`timestamp` | 模型的创建时间。
`description` | 用户提供的模型描述。
`error` | 说明模型为何处于失败状态的错误消息。
`space_type` | 训练该模型所针对的空间类型。
`dimension` | 该模型所针对的维度。
`engine` | 用于创建模型的原生库，取值为 "faiss" 或 "nmslib"。

### 用法 {#usage-2}

```json
GET /_plugins/_knn/models/test-model?pretty
{
  "model_id" : "test-model",
  "model_blob" : "SXdGbIAAAAAAAAAAAA...",
  "state" : "created",
  "timestamp" : "2021-11-15T18:45:07.505369036Z",
  "description" : "Default",
  "error" : "",
  "space_type" : "l2",
  "dimension" : 128,
  "engine" : "faiss" 
}
```

```json
GET /_plugins/_knn/models/test-model?pretty&filter_path=model_id,state
{
  "model_id" : "test-model",
  "state" : "created"
}
```

## 搜索模型
<Badge type="tip" text="Introduced 1.2" />

使用 OpenSearch 查询在索引中搜索模型。

### 用法 {#usage-3}
```json
GET/POST /_plugins/_knn/models/_search?pretty&_source_excludes=model_blob
{
    "query": {
         ...
     }
}

{
    "took" : 0,
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
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : ".opensearch-knn-models",
        "_id" : "test-model",
        "_score" : 1.0,
        "_source" : {
          "engine" : "faiss",
          "space_type" : "l2",
          "description" : "Default",
          "model_id" : "test-model",
          "state" : "created",
          "error" : "",
          "dimension" : 128,
          "timestamp" : "2021-11-15T18:45:07.505369036Z"
        }
      }
    ]
  }
}
```

## 删除模型
<Badge type="tip" text="Introduced 1.2" />

用于删除集群中的特定模型。

### 用法 {#usage-4}

```json
DELETE /_plugins/_knn/models/{model_id}
{
  "model_id": {model_id},
  "acknowledged": true
}
```

## 训练模型
<Badge type="tip" text="Introduced 1.2" />

创建并训练一个模型，该模型可在索引期间用于初始化 k-NN 原生库索引。该 API 会从训练索引的 `knn_vector` 字段中提取训练数据，然后创建并训练模型，再将其序列化到模型系统索引中。训练数据必须与请求体中传入的维度一致。该请求会在训练开始时返回。要监控模型的状态，请使用[获取模型 API](#get-model)。

查询参数 |  描述
:--- | :---
`model_id` | （可选）所获取模型的 ID。如果未指定，将生成一个随机 ID。
`node_id` | （可选）执行训练的首选节点。如果设置了该参数，并且该节点被认为有能力执行训练，则使用该节点执行训练。

请求参数 |  描述
:--- | :---
`training_index` | 训练数据来源的索引。
`training_field` | 从 `training_index` 中获取训练数据的 `knn_vector` 字段。该字段的维度必须与传入该请求的 `dimension` 一致。
`dimension` | 该模型所针对的维度。
`max_training_vector_count` | （可选）训练时从训练索引中使用的最大向量数。默认使用索引中的全部向量。
`search_size` | （可选）训练数据通过滚动查询从训练索引中提取。该参数定义每次滚动查询返回的结果数。默认为 10,000。
`description` | （可选）用户提供的模型描述。
`method` | 用于搜索的 ANN 方法的配置。有关可用方法的更多信息，请参阅[方法文档](/search-plugins/knn/knn-index#method-definitions)。该方法必须是需要训练的方法，才视为有效。
   

### 用法 {#usage-5}

```json
POST /_plugins/_knn/models/{model_id}/_train?preference={node_id}
{
    "training_index": "train-index-name",
    "training_field": "train-field-name",
    "dimension": 16,
    "max_training_vector_count": 1200,
    "search_size": 100,
    "description": "My model",
    "method": {
        "name":"ivf",
        "engine":"faiss",
        "space_type": "l2",
        "parameters":{
            "nlist":128,
            "encoder":{
                "name":"pq",
                "parameters":{
                    "code_size":8
                }
            }
        }
    }
}

{
    "model_id": "model_x"
}
```

```json
POST /_plugins/_knn/models/_train?preference={node_id}
{
    "training_index": "train-index-name",
    "training_field": "train-field-name",
    "dimension": 16,
    "max_training_vector_count": 1200,
    "search_size": 100,
    "description": "My model",
    "method": {
        "name":"ivf",
        "engine":"faiss",
        "space_type": "l2",
        "parameters":{
            "nlist":128,
            "encoder":{
                "name":"pq",
                "parameters":{
                    "code_size":8
                }
            }
        }
    }
}

{
    "model_id": "dcdwscddscsad"
}
```
