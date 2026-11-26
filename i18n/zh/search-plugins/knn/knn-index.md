---
title: k-NN 索引
---

# k-NN 索引

k-NN 插件引入了一种自定义数据类型（data type）`knn_vector`，用户可以借助它将 k-NN 向量摄取到 OpenSearch 索引中，并执行各种 k-NN 搜索。`knn_vector` 字段高度可配置，能够满足多种不同的 k-NN 工作负载。有关更多信息，请参阅 [k-NN 向量](/field-types/supported-field-types/knn-vector)。

## Lucene 字节向量

从 k-NN 插件 2.9 版本开始，你可以在 `lucene` 引擎中使用 `byte` 向量，以减少所需的存储空间。有关更多信息，请参阅 [Lucene 字节向量](/field-types/supported-field-types/knn-vector#lucene-byte-vector)。

## 方法定义

方法定义是指你要使用的近似 k-NN 算法的底层配置。方法定义可用于创建 `knn_vector` 字段（当该方法不需要训练时），也可用于[在训练期间创建模型](/search-plugins/knn/api#train-model)，之后再使用该模型[创建 `knn_vector` 字段](/search-plugins/knn/approximate-knn#building-a-k-nn-index-from-a-model)。

方法定义始终包含方法名称、该方法所针对的 space_type、要使用的引擎
（库），以及一个参数映射。

映射参数 | 必需 | 默认值 | 可更新 | 描述
:--- | :--- | :--- | :--- | :---
`name` | true | n/a | false | 最近邻方法的标识符。
`space_type` | false | l2 | false | 用于计算向量之间距离的向量空间。
`engine` | false | nmslib | false | 用于索引和搜索的近似 k-NN 库。可用的库有 faiss、nmslib 和 Lucene。
`parameters` | false | null | false | 最近邻方法所使用的参数。

### 支持的 nmslib 方法

方法名称 | 需要训练 | 支持的空间 | 描述
:--- | :--- | :--- | :---
`hnsw` | false | l2, innerproduct, cosinesimil, l1, linf | 一种用于近似 k-NN 搜索的分层邻近图方法。有关该算法的更多详细信息，请参阅这篇[摘要](https://arxiv.org/abs/1603.09320)。

#### HNSW 参数

参数名称 | 必需 | 默认值 | 可更新 | 描述
:--- | :--- | :--- | :--- | :---
`ef_construction` | false | 100 | false | 创建 k-NN 图时使用的动态列表的大小。值越大，图越精确，但索引速度越慢。
`m` | false | 16 | false | 插件为每个新元素创建的双向链接数。增大或减小此值会对内存消耗产生很大影响。请将此值保持在 2 到 100 之间。

::: info 注意
对于 nmslib，*ef_search* 在[索引设置](#index-settings)中设置。
:::

::: info 注意
在 OpenSearch 2.11 或更早版本中创建的索引仍会使用旧的 `ef_construction` 值（`512`）。
:::

### 支持的 faiss 方法

方法名称 | 需要训练 | 支持的空间 | 描述
:--- | :--- | :--- | :---
`hnsw` | false | l2, innerproduct | 一种用于近似 k-NN 搜索的分层邻近图方法。
`ivf` | true | l2, innerproduct | 一种分桶方法：根据聚类将向量分配到不同的桶中，搜索时只搜索其中一部分桶。

::: info 注意
对于 hnsw，使用 PQ 时不能使用 "innerproduct"。
:::

#### HNSW 参数 {#hnsw-parameters-1}

参数名称 | 必需 | 默认值 | 可更新 | 描述
:--- | :--- | :--- | :--- | :---
`ef_search` | false | 100 | false | k-NN 搜索时使用的动态列表的大小。值越大，搜索越精确，但速度越慢。
`ef_construction` | false | 100 | false | 创建 k-NN 图时使用的动态列表的大小。值越大，图越精确，但索引速度越慢。
`m` | false | 16 | false | 插件为每个新元素创建的双向链接数。增大或减小此值会对内存消耗产生很大影响。请将此值保持在 2 到 100 之间。
`encoder` | false | flat | false | 用于对向量进行编码的编码器定义。编码器可以减少索引的内存占用，但会牺牲搜索精度。

::: info 注意
在 OpenSearch 2.11 或更早版本中创建的索引仍会使用旧的 `ef_construction` 和 `ef_search` 值（`512`）。
:::

#### IVF 参数

参数名称 | 必需 | 默认值 | 可更新 | 描述
:--- | :--- | :--- | :--- | :---
`nlist` | false | 4 | false | 将向量划分到的桶的数量。值越大，搜索可能越精确，但会增加内存占用和训练延迟。有关如何选择合适的值的更多信息，请参阅 [Guidelines to choose an index](https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index)。
`nprobes` | false | 1 | false | 查询时要搜索的桶的数量。值越大，搜索越精确，但速度越慢。
`encoder` | false | flat | false | 用于对向量进行编码的编码器定义。编码器可以减少索引的内存占用，但会牺牲搜索精度。

有关设置这些参数的更多信息，请参阅 [Faiss 文档](https://github.com/facebookresearch/faiss/wiki/Faiss-indexes)。

#### IVF 训练要求

IVF 算法需要一个训练步骤。要创建使用 IVF 的索引，你需要使用
[Train API](/search-plugins/knn/api#train-model) 训练一个模型，并传入 IVF 方法定义。IVF 要求训练数据点的数量至少为 `nlist`
个，但[建议使用更多](https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index#how-big-is-the-dataset)。
训练数据既可以是将要摄取的相同数据，也可以是一个单独的数据集。

### 支持的 Lucene 方法

方法名称 | 需要训练 | 支持的空间 | 描述
:--- | :--- | :--- | :---
`hnsw` | false | l2, cosinesimil | 一种用于近似 k-NN 搜索的分层邻近图方法。

#### HNSW 参数 {#hnsw-parameters-2}

参数名称 | 必需 | 默认值 | 可更新 | 描述
:--- | :--- | :--- | :--- | :---
`ef_construction` | false | 100 | false | 创建 k-NN 图时使用的动态列表的大小。值越大，图越精确，但索引速度越慢。<br>Lucene 引擎使用其专有术语 "beam_width" 来描述这一功能，它与 "ef_construction" 直接对应。为了在整个 OpenSearch 文档中保持一致，我们对此参数保留 "ef_construction" 这一术语。
`m` | false | 16 | false | 插件为每个新元素创建的双向链接数。增大或减小此值会对内存消耗产生很大影响。请将此值保持在 2 到 100 之间。<br>Lucene 引擎使用其专有术语 "max_connections" 来描述这一功能，它与 "m" 直接对应。为了在整个 OpenSearch 文档中保持一致，我们保留 "m" 这一术语来命名此参数。

::: info 注意
Lucene 的 HNSW 实现会忽略 `ef_search`，并将其动态设置为搜索请求中 "k" 的值。因此，使用 Lucene 引擎时无需设置 `ef_search`。
:::

::: info 注意
在 OpenSearch 2.11 或更早版本中创建的索引仍会使用旧的 `ef_construction` 值（`512`）。
:::

```json
{
    "type": "knn_vector",
    "dimension": 100,
    "method": {
        "name":"hnsw",
        "engine":"lucene",
        "space_type": "l2",
        "parameters":{
            "m":2048,
            "ef_construction": 245
        }
    }
}
```

### 支持的 faiss 编码器

你可以使用编码器来减少 k-NN 索引的内存占用，但会牺牲搜索精度。faiss 提供了
多种编码器类型，但该插件目前只支持 *flat* 和 *pq* 编码。

以下示例方法定义指定了 `hnsw` 方法和 `pq` 编码器：

```json
"method": {
  "name":"hnsw",
  "engine":"faiss",
  "space_type": "l2",
  "parameters":{
    "encoder":{
      "name":"pq",
      "parameters":{
        "code_size": 8,
        "m": 8
      }
    }
  }
}
```

::: warning 重要
在 OpenSearch 2.10 及更高版本中，`hnsw` 方法支持 `pq` 编码器。与 `hnsw` 方法一起使用的 `pq` 编码器，其 `code_size` 参数必须为 **8**。
:::

编码器名称 | 需要训练 | 描述
:--- | :--- | :---
`flat` | false | 将向量编码为浮点数组。这种编码不会减少内存占用。
`pq` | true | 即 *乘积量化（product quantization）* 的缩写，是一种有损压缩技术，它通过聚类将向量编码为固定字节数，目标是尽量减少 k-NN 搜索精度的下降。从整体上看，向量被拆分为 `m` 个子向量，然后每个子向量用一个 `code_size` 编码表示，该编码来自训练期间生成的码本。有关乘积量化的更多信息，请参阅[这篇博客文章](https://medium.com/dotstar/understanding-faiss-part-2-79d90b1e5388)。

#### 示例

以下示例使用 `ivf` 方法，未指定编码器（默认情况下，OpenSearch 使用 `flat` 编码器）：

```json
"method": {
  "name":"ivf",
  "engine":"faiss",
  "space_type": "l2",
  "parameters":{
    "nlist": 4,
    "nprobes": 2
  }
}
```

以下示例使用 `ivf` 方法和 `pq` 编码器：

```json
"method": {
  "name":"ivf",
  "engine":"faiss",
  "space_type": "l2",
  "parameters":{
    "encoder":{
      "name":"pq",
      "parameters":{
        "code_size": 8,
        "m": 8
      }
    }
  }
}
```

以下示例使用 `hnsw` 方法，未指定编码器（默认情况下，OpenSearch 使用 `flat` 编码器）：

```json
"method": {
  "name":"hnsw",
  "engine":"faiss",
  "space_type": "l2",
  "parameters":{
    "ef_construction": 256,
    "m": 8
  }
}
```

#### PQ 参数

参数名称 | 必需 | 默认值 | 可更新 | 描述
:--- | :--- | :--- | :--- | :---
`m` | false | 1 | false |  决定将向量拆分为多少个子向量。各子向量相互独立地进行编码。向量的维度必须能被 `m` 整除。最大值为 1,024。
`code_size` | false | 8 | false | 决定将子向量编码为多少位。最大值为 8。对于 IVF，此值必须小于或等于 8。对于 HNSW，此值只能为 8。

### 选择合适的方法

构建 `knn_vector` 字段时有很多选项可供选择。要确定应选择的方法和参数，首先应了解你的工作负载有哪些要求，以及你愿意做出哪些权衡。需要考虑的因素有：(1) 查询延迟，(2) 查询质量，(3) 内存限制，(4) 索引延迟。

如果不需要考虑内存，HNSW 在查询延迟与查询质量之间的权衡非常出色。

如果你希望比 HNSW 占用更少的内存、索引更快，同时保持相近的查询质量，则应评估 IVF。

如果需要考虑内存，可以考虑为 HNSW 或 IVF 索引添加 PQ 编码器。由于 PQ 是有损编码，查询质量会有所下降。

### 内存估算

在典型的 OpenSearch 集群中，一部分 RAM 会预留给 JVM 堆。k-NN 插件会将本地库索引
分配到剩余 RAM 中的一部分。这部分的大小由
`circuit_breaker_limit` 集群设置决定。默认情况下，该限制为 50%。

::: info 注意
有一个副本会使向量总数翻倍。
:::

#### HNSW 内存估算

HNSW 所需的内存估计为 `1.1 * (4 * dimension + 8 * M)` 字节/向量。

例如，假设你有一百万个向量，维度为 256，M 为 16。所需内存可以估算如下：

```
1.1 * (4 * 256 + 8 * 16) * 1,000,000 ~= 1.267 GB
```

#### IVF 内存估算

IVF 所需的内存估计为 `1.1 * (((4 * dimension) * num_vectors) + (4 * nlist * d))` 字节。

例如，假设你有一百万个向量，维度为 256，nlist 为 128。所需内存可以估算如下：

```
1.1 * (((4 * 256) * 1,000,000) + (4 * 128 * 256))  ~= 1.126 GB

```

## 索引设置

此外，k-NN 插件还引入了若干索引设置，也可用于配置 k-NN 结构。

目前，设置中定义的若干参数正处于弃用过程中。这些参数应在映射中设置，而不是在索引设置中设置。在映射中设置的参数会覆盖在索引设置中设置的参数。在映射中设置参数，可以让一个索引拥有多个参数各不相同的 `knn_vector` 字段。

设置 | 默认值 | 可更新 | 描述
:--- | :--- | :--- | :---
`index.knn` | false | false | 是否为 `knn_vector` 字段构建本地库索引。如果设置为 false，`knn_vector` 字段将存储在 doc values 中，但近似 k-NN 搜索功能将被禁用。
`index.knn.algo_param.ef_search` | 100 | true | k-NN 搜索时使用的动态列表的大小。值越大，搜索越精确，但速度越慢。仅适用于 NMSLIB。
`index.knn.algo_param.ef_construction` | 100 | false | 已在 1.0.0 中弃用。请改用[映射参数](https://opensearch.org/docs/latest/search-plugins/knn/knn-index/#method-definitions)来设置此值。
`index.knn.algo_param.m` | 16 | false | 已在 1.0.0 中弃用。请改用[映射参数](https://opensearch.org/docs/latest/search-plugins/knn/knn-index/#method-definitions)来设置此值。
`index.knn.space_type` | l2 | false | 已在 1.0.0 中弃用。请改用[映射参数](https://opensearch.org/docs/latest/search-plugins/knn/knn-index/#method-definitions)来设置此值。

::: info 注意
在 OpenSearch 2.11 或更早版本中创建的索引仍会使用旧的 `ef_construction` 和 `ef_search` 值（`512`）。
:::
