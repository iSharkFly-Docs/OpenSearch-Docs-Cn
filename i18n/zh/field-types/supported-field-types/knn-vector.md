---
title: k-NN 向量
---

# k-NN 向量字段类型

[k-NN 插件](/search-plugins/knn/)引入了一种自定义数据类型 `knn_vector`，允许用户将 k-NN 向量摄取到 OpenSearch 索引（Index）中，并执行各种 k-NN 搜索。`knn_vector` 字段的可配置性很强，能够满足多种不同的 k-NN 工作负载。通常，可以通过提供方法定义或指定模型 ID 来构建 `knn_vector` 字段。

## 示例

例如，要将 `my_vector1` 映射为 `knn_vector`，请使用以下请求：

```json
PUT test-index
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
        "dimension": 3,
        "method": {
          "name": "hnsw",
          "space_type": "l2",
          "engine": "lucene",
          "parameters": {
            "ef_construction": 128,
            "m": 24
          }
        }
      }
    }
  }
}
```

## 方法定义

当底层的[近似 k-NN](/search-plugins/knn/approximate-knn) 算法不需要训练时，使用[方法定义](/search-plugins/knn/knn-index#method-definitions)。例如，以下 `knn_vector` 字段指定使用 *nmslib* 的 *hnsw* 实现进行近似 k-NN 搜索。在索引过程中，*nmslib* 会构建相应的 *hnsw* 段文件。

```json
"my_vector": {
  "type": "knn_vector",
  "dimension": 4,
  "method": {
    "name": "hnsw",
    "space_type": "l2",
    "engine": "nmslib",
    "parameters": {
      "ef_construction": 128,
      "m": 24
    }
  }
}
```

## 模型 ID

当底层的近似 k-NN 算法需要训练步骤时，使用模型 ID。前提是必须先使用
[Train API](/search-plugins/knn/api#train-model) 创建模型。该
模型包含初始化原生库段文件所需的信息。

```json
  "type": "knn_vector",
  "model_id": "my-model"
}
```

但是，如果打算使用 Painless 脚本或 k-NN 评分脚本，则只需传入维度。
 ```json
   "type": "knn_vector",
   "dimension": 128
 }
 ```

## Lucene 字节向量

默认情况下，k-NN 向量是 `float` 向量，每个维度占 4 个字节。如果希望节省存储空间，可以在 `lucene` 引擎中使用 `byte` 向量。在 `byte` 向量中，每个维度都是取值范围为 [-128, 127] 的有符号 8 位整数。 
 

::: info 注意
只有 `lucene` 引擎支持字节向量，`nmslib` 和 `faiss` 引擎不支持。
:::

在 [k-NN 基准测试](https://github.com/opensearch-project/k-NN/tree/main/benchmarks/perf-tool)中，使用 `byte` 向量代替 `float` 向量显著降低了存储和内存占用，同时提高了索引吞吐量并降低了查询延迟。此外，召回精度没有受到太大影响（请注意，召回率可能取决于多种因素，例如[量化技术](#quantization-techniques)和数据分布）。 

::: warning 重要
与使用 `float` 向量相比，使用 `byte` 向量时召回精度会有一定损失。字节向量适用于大规模应用，以及优先考虑降低内存占用、可以接受极小召回损失的使用场景。
:::

 
k-NN 插件 2.9 版本引入了可选的 `data_type` 参数，用于定义向量的数据类型。该参数的默认值为 `float`。

如需使用 `byte` 向量，请在为索引创建映射（Mapping）时将 `data_type` 参数设置为 `byte`：

 ```json
PUT test-index
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
        "dimension": 3,
        "data_type": "byte",
        "method": {
          "name": "hnsw",
          "space_type": "l2",
          "engine": "lucene",
          "parameters": {
            "ef_construction": 128,
            "m": 24
          }
        }
      }
    }
  }
}
```

然后像往常一样摄取文档（Document）。请确保向量中的每个维度都在支持的 [-128, 127] 范围内：

```json
PUT test-index/_doc/1
{
  "my_vector1": [-126, 28, 127]
}
```

```json
PUT test-index/_doc/2
{
  "my_vector1": [100, -128, 0]
}
```

查询时，请务必使用 `byte` 向量：

```json
GET test-index/_search
{
  "size": 2,
  "query": {
    "knn": {
      "my_vector1": {
        "vector": [26, -120, 99],
        "k": 2
      }
    }
  }
}
```

### 量化技术

如果向量是 `float` 类型，需要先将其转换为 `byte` 类型，然后再摄取文档。这种转换通过*对数据集进行量化*——即降低其向量的精度——来完成。量化技术有很多种，例如标量量化，或 Faiss 引擎中使用的乘积量化（PQ）。量化技术的选择取决于所使用的数据类型，并可能影响召回值的准确性。以下各节介绍了在 [k-NN 基准测试](https://github.com/opensearch-project/k-NN/tree/main/benchmarks/perf-tool)中，针对 [L2](#scalar-quantization-for-the-l2-space-type) 和[余弦相似度](#scalar-quantization-for-the-cosine-similarity-space-type)空间类型对测试数据进行量化时所使用的标量量化算法。所提供的伪代码仅用于说明。

#### L2 空间类型的标量量化

以下示例伪代码演示了在 L2 空间类型的欧几里得数据集上进行基准测试时所使用的标量量化技术。欧几里得距离具有平移不变性。如果将 $$x$$ 和 $$y$$ 同时平移相同的 $$z$$，距离保持不变（$$\lVert x-y\rVert =\lVert (x-z)-(y-z)\rVert$$）。

```python
# 随机数据集（创建随机数据集的示例）
dataset = np.random.uniform(-300, 300, (100, 10))
# 随机查询集（创建随机查询集的示例）
queryset = np.random.uniform(-350, 350, (100, 10))
# 取值个数
B = 256

# 索引：
# 获取最小值和最大值
dataset_min = np.min(dataset)
dataset_max = np.max(dataset)
# 平移坐标，使其非负
dataset -= dataset_min
# 归一化到 [0, 1]
dataset *= 1. / (dataset_max - dataset_min)
# 分桶为 256 个值
dataset = np.floor(dataset * (B - 1)) - int(B / 2)

# 查询：
# 裁剪（如果查询集的范围超出数据集的范围）
queryset = queryset.clip(dataset_min, dataset_max)
# 平移坐标，使其非负
queryset -= dataset_min
# 归一化
queryset *= 1. / (dataset_max - dataset_min)
# 分桶为 256 个值
queryset = np.floor(queryset * (B - 1)) - int(B / 2)
```

#### 余弦相似度空间类型的标量量化

以下示例伪代码演示了在余弦相似度空间类型的角度数据集上进行基准测试时所使用的标量量化技术。余弦相似度不具有平移不变性（$$cos(x, y) \neq cos(x-z, y-z)$$）。 

以下伪代码适用于正数：

```python
# 适用于正数

# 索引和查询：

# 获取训练数据集的最大值
max = np.max(dataset)
min = 0
B = 127

# 归一化到 [0,1]
val = (val - min) / (max - min)
val = (val * B)

# 获取整数部分和小数部分
int_part = floor(val)
frac_part = val - int_part

if 0.5 < frac_part:
 bval = int_part + 1
else:
 bval = int_part

return Byte(bval)
```

以下伪代码适用于负数：

```python
# 适用于负数

# 索引和查询：

# 获取训练数据集的最小值
min = 0
max = -np.min(dataset)
B = 128

# 归一化到 [0,1]
val = (val - min) / (max - min)
val = (val * B)

# 获取整数部分和小数部分
int_part = floor(var)
frac_part = val - int_part

if 0.5 < frac_part:
 bval = int_part + 1
else:
 bval = int_part

return Byte(bval)
```
