---
title: 近似 k-NN 搜索
---

# 近似 k-NN 搜索

标准的 k-NN 搜索方法使用暴力方式计算相似度，即测量查询与若干个点之间的最近距离，从而得到精确的结果。这在许多应用中效果都很好。但是，对于维度很高的超大型数据集，这种方式会带来扩展性问题，降低搜索效率。近似 k-NN（approximate k-NN）搜索方法可以通过借助一些工具来克服这一问题：这些工具能更高效地重构索引，并降低可搜索向量（vector）的维度。使用这种方法需要牺牲一定的准确性，但可以显著提高搜索处理速度。

OpenSearch 所采用的近似 k-NN 搜索方法使用来自 [nmslib](https://github.com/nmslib/nmslib)、[faiss](https://github.com/facebookresearch/faiss) 和 [Lucene](https://lucene.apache.org/) 库的近似最近邻（approximate nearest neighbor，ANN）算法来支持 k-NN 搜索。这些搜索方法利用 ANN 来降低大型数据集的搜索延迟。在 k-NN 插件提供的三种搜索方法中，该方法为大型数据集提供了最好的搜索可扩展性。当数据集达到数十万个向量时，这是首选方法。

::: info 注意
有关插件当前支持的算法的详细信息，请参阅 [k-NN 索引文档](/search-plugins/knn/knn-index#method-definitions)。
:::

k-NN 插件在索引期间会为每个 knn-vector 字段/Lucene 段（segment）对构建一个向量的原生库索引，可在搜索期间用于高效地查找与查询向量最邻近的 k 个邻居。要了解有关 Lucene 段的更多信息，请参阅 [Apache Lucene 文档](https://lucene.apache.org/core/8_9_0/core/org/apache/lucene/codecs/lucene87/package-summary.html#package.description)。这些原生库索引会在搜索期间加载到原生内存中，并由缓存进行管理。要了解有关将原生库索引预先加载到内存中的更多信息，请参阅[预热 API](/search-plugins/knn/api#warmup-operation)。此外，你还可以查看哪些原生库索引已经加载到内存中。有关详细信息，请参阅 [stats API 部分](/search-plugins/knn/api#stats)。

由于原生库索引是在索引期间构建的，因此无法先对索引应用过滤器再使用该搜索方法。所有过滤器都会应用于近似最近邻搜索产生的结果。

## 引擎与集群节点规模的建议

近似 k-NN 搜索使用的三种引擎各有特点，因此在特定情况下，某一种引擎会比其他引擎更合适。你可以参考以下一般信息，确定哪种引擎最能满足你的需求。

一般来说，nmslib 在搜索方面的性能优于 faiss 和 Lucene。但是，如果要优化索引吞吐量，faiss 是一个不错的选择。对于相对较小的数据集（最多几百万个向量），Lucene 引擎表现出更好的延迟和召回率。同时，与其他引擎相比，它的索引体积最小，因此可以为数据节点使用规格更小的 AWS 实例。

在考虑集群节点规模时，一般做法是首先使索引在集群中均匀分布。不过，还需要考虑其他因素。为了帮助你做出这些选择，可以参考 OpenSearch 托管服务指南中的[确定域的规模](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/sizing-domains.html)一节。

## 近似 k-NN 入门

要使用 k-NN 插件的近似搜索功能，必须首先创建一个 `index.knn` 设置为 `true` 的 k-NN 索引。该设置会让插件为该索引创建原生库索引。

接下来，必须添加一个或多个 `knn_vector` 数据类型的字段。以下示例创建一个包含两个 `knn_vector` 字段的索引，其中一个使用 `faiss`，另一个使用 `nmslib`：

```json
PUT my-knn-index-1
{
  "settings": {
    "index": {
      "knn": true,
      "knn.algo_param.ef_search": 100
    }
  },
  "mappings": {
    "properties": {
        "my_vector1": {
          "type": "knn_vector",
          "dimension": 2,
          "method": {
            "name": "hnsw",
            "space_type": "l2",
            "engine": "nmslib",
            "parameters": {
              "ef_construction": 128,
              "m": 24
            }
          }
        },
        "my_vector2": {
          "type": "knn_vector",
          "dimension": 4,
          "method": {
            "name": "hnsw",
            "space_type": "innerproduct",
            "engine": "faiss",
            "parameters": {
              "ef_construction": 256,
              "m": 48
            }
          }
        }
    }
  }
}
```

在上面的示例中，两个 `knn_vector` 字段都是通过方法定义来配置的。此外，`knn_vector` 字段也可以通过模型来配置。有关详细信息，请参阅 [knn_vector 数据类型](/field-types/supported-field-types/knn-vector)一节。

`knn_vector` 数据类型支持浮点数向量，对于 NMSLIB、Faiss 和 Lucene 引擎，其维度数最多可达 16,000，由 dimension 映射参数设置。

::: tip 提示
在 OpenSearch 中，编解码器（codec）负责索引的存储和检索。k-NN 插件使用自定义编解码器将向量数据写入原生库索引，以便底层 k-NN 搜索库能够读取这些数据。
:::

创建索引后，就可以向其中添加一些数据：

```json
POST _bulk
{ "index": { "_index": "my-knn-index-1", "_id": "1" } }
{ "my_vector1": [1.5, 2.5], "price": 12.2 }
{ "index": { "_index": "my-knn-index-1", "_id": "2" } }
{ "my_vector1": [2.5, 3.5], "price": 7.1 }
{ "index": { "_index": "my-knn-index-1", "_id": "3" } }
{ "my_vector1": [3.5, 4.5], "price": 12.9 }
{ "index": { "_index": "my-knn-index-1", "_id": "4" } }
{ "my_vector1": [5.5, 6.5], "price": 1.2 }
{ "index": { "_index": "my-knn-index-1", "_id": "5" } }
{ "my_vector1": [4.5, 5.5], "price": 3.7 }
{ "index": { "_index": "my-knn-index-1", "_id": "6" } }
{ "my_vector2": [1.5, 5.5, 4.5, 6.4], "price": 10.3 }
{ "index": { "_index": "my-knn-index-1", "_id": "7" } }
{ "my_vector2": [2.5, 3.5, 5.6, 6.7], "price": 5.5 }
{ "index": { "_index": "my-knn-index-1", "_id": "8" } }
{ "my_vector2": [4.5, 5.5, 6.7, 3.7], "price": 4.4 }
{ "index": { "_index": "my-knn-index-1", "_id": "9" } }
{ "my_vector2": [1.5, 5.5, 4.5, 6.4], "price": 8.9 }

```

然后，可以使用 `knn` 查询类型对这些数据执行近似最近邻搜索：

```json
GET my-knn-index-1/_search
{
  "size": 2,
  "query": {
    "knn": {
      "my_vector2": {
        "vector": [2, 3, 5, 6],
        "k": 2
      }
    }
  }
}
```

`k` 是每个图的搜索所返回的邻居数量。你还必须包含 `size` 选项，它表示查询实际返回的结果数量。插件会为每个分片（以及每个段）返回 `k` 个结果，为整个查询返回 `size` 个结果。插件支持的 `k` 最大值为 10,000。

### 基于模型构建 k-NN 索引

对于我们支持的某些算法，原生库索引需要经过训练才能使用。对每个新创建的段都进行训练的代价很高，因此我们引入了*模型*（model）的概念，用于在创建段时初始化原生库索引。*模型*是通过调用 [Train API](/search-plugins/knn/api#train-model) 并传入训练数据来源和模型的方法定义来创建的。训练完成后，模型会被序列化到 k-NN 模型系统索引中。之后在索引期间，会从该索引中取出模型来初始化各个段。

要训练模型，首先需要一个包含训练数据的 OpenSearch 索引。训练数据可以来自任何维度与要创建的模型维度一致的 `knn_vector` 字段。训练数据可以就是你将要索引的数据，也可以是单独的数据集。下面创建一个训练索引：

```json
PUT /train-index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "train-field": {
        "type": "knn_vector",
        "dimension": 4
      }
    }
  }
}
```

注意，索引设置中没有设置 `index.knn`。这样可以确保不会为该索引创建原生库索引。

现在可以向该索引中添加一些数据：

```json
POST _bulk
{ "index": { "_index": "train-index", "_id": "1" } }
{ "train-field": [1.5, 5.5, 4.5, 6.4]}
{ "index": { "_index": "train-index", "_id": "2" } }
{ "train-field": [2.5, 3.5, 5.6, 6.7]}
{ "index": { "_index": "train-index", "_id": "3" } }
{ "train-field": [4.5, 5.5, 6.7, 3.7]}
{ "index": { "_index": "train-index", "_id": "4" } }
{ "train-field": [1.5, 5.5, 4.5, 6.4]}
```

在训练索引中完成索引后，就可以调用 Train API：

```json
POST /_plugins/_knn/models/my-model/_train
{
  "training_index": "train-index",
  "training_field": "train-field",
  "dimension": 4,
  "description": "My model description",
  "method": {
    "name": "ivf",
    "engine": "faiss",
    "space_type": "l2",
    "parameters": {
      "nlist": 4,
      "nprobes": 2
    }
  }
}
```

训练作业一启动，Train API 就会立即返回。要检查训练状态，可以使用 Get Model API：

```json
GET /_plugins/_knn/models/my-model?filter_path=state&pretty
{
  "state": "training"
}
```

当模型进入 "created" 状态后，就可以创建一个使用该模型来初始化其原生库索引的索引：

```json
PUT /target-index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "index.knn": true
  },
  "mappings": {
    "properties": {
      "target-field": {
        "type": "knn_vector",
        "model_id": "my-model"
      }
    }
  }
}
```

最后，可以将要搜索的文档添加到索引中：
```json
POST _bulk
{ "index": { "_index": "target-index", "_id": "1" } }
{ "target-field": [1.5, 5.5, 4.5, 6.4]}
{ "index": { "_index": "target-index", "_id": "2" } }
{ "target-field": [2.5, 3.5, 5.6, 6.7]}
{ "index": { "_index": "target-index", "_id": "3" } }
{ "target-field": [4.5, 5.5, 6.7, 3.7]}
{ "index": { "_index": "target-index", "_id": "4" } }
{ "target-field": [1.5, 5.5, 4.5, 6.4]}
...
```

数据摄取完成后，就可以像搜索其他任何 `knn_vector` 字段一样对其进行搜索！

### 将近似 k-NN 与过滤器结合使用

要了解如何在 k-NN 搜索中使用过滤器，请参阅[带过滤器的 k-NN 搜索](/search-plugins/knn/filter-search-knn)。

### 将近似 k-NN 与嵌套字段结合使用

要了解如何对嵌套字段使用 k-NN 搜索，请参阅[嵌套字段的 k-NN 搜索](/search-plugins/knn/nested-search-knn)。

## 空间

空间（space）对应用于测量两点之间距离的函数，以确定 k 个最近邻。从 k-NN 的角度来看，评分越低表示结果越接近、越好。这与 OpenSearch 的评分方式相反：在 OpenSearch 中，评分越高表示结果越好。为了将距离转换为 OpenSearch 评分，我们取 1 / (1 + distance)。k-NN 插件支持以下空间。

::: info 注意
并非每种方法都支持所有这些空间。请务必查看[方法文档](/search-plugins/knn/knn-index#method-definitions)，确认你需要的空间是否受支持。
:::

<table>
  <thead style="text-align: center">
  <tr>
    <th>spaceType</th>
    <th>距离函数（d）</th>
    <th>OpenSearch 评分</th>
  </tr>
  </thead>
  <tr>
    <td>l1</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = \sum_{i=1}^n |x_i - y_i| \]</td>
    <td>\[ score = {1 \over 1 + d } \]</td>
  </tr>
  <tr>
    <td>l2</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = \sum_{i=1}^n (x_i - y_i)^2 \]</td>
    <td>\[ score = {1 \over 1 + d } \]</td>
  </tr>
  <tr>
    <td>linf</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = max(|x_i - y_i|) \]</td>
    <td>\[ score = {1 \over 1 + d } \]</td>
  </tr>
  <tr>
    <td>cosinesimil</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = 1 - cos { \theta } = 1 - {\mathbf{x} &middot; \mathbf{y} \over \|\mathbf{x}\| &middot; \|\mathbf{y}\|}\]\[ = 1 - 
    {\sum_{i=1}^n x_i y_i \over \sqrt{\sum_{i=1}^n x_i^2} &middot; \sqrt{\sum_{i=1}^n y_i^2}}\]
    其中 \(\|\mathbf{x}\|\) 和 \(\|\mathbf{y}\|\) 分别表示向量 x 和 y 的范数。</td>
    <td><b>nmslib</b> 和 <b>faiss：</b>\[ score = {1 \over 1 + d } \]<br><b>Lucene：</b>\[ score = {2 - d \over 2}\]</td>
  </tr>
  <tr>
    <td>innerproduct（Lucene 不支持）</td>
    <td>\[ d(\mathbf{x}, \mathbf{y}) = - {\mathbf{x} &middot; \mathbf{y}} = - \sum_{i=1}^n x_i y_i \]</td>
    <td>\[ \text{If} d \ge 0, \] \[score = {1 \over 1 + d }\] \[\text{If} d < 0, score = &minus;d + 1\]</td>
  </tr>
</table>

::: info 注意
余弦相似度公式本身不包含 `1 -` 前缀。但是，由于相似度搜索库将较小的评分视为更接近的结果，因此对于余弦相似度空间，它们返回的是 `1 - cosineSimilarity`——这就是距离函数中包含 `1 -` 的原因。
:::
