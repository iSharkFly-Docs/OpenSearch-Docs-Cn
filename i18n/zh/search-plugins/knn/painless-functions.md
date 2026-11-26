---
title: k-NN Painless 扩展
---

# k-NN Painless 脚本扩展

借助 k-NN 插件的 Painless 脚本扩展，你可以在 Painless 脚本中直接使用 k-NN 距离函数，对 `knn_vector` 字段执行操作。Painless 针对每个上下文都有严格的允许使用的函数和类列表，以确保脚本的安全性。k-NN 插件为 [k-NN 评分脚本](/search-plugins/knn/knn-score-script)中使用的部分距离函数添加了 Painless 脚本扩展，因此你可以使用它们来自定义 k-NN 工作负载。

## k-NN Painless 脚本函数入门 {#get-started-with-k-nns-painless-scripting-functions}

要使用 k-NN 的 Painless 脚本函数，首先按照 [k-NN 评分脚本](/search-plugins/knn/knn-score-script#getting-started-with-the-score-script-for-vectors)中的方法创建一个包含 `knn_vector` 字段的索引。创建索引并摄取一些数据后，就可以使用 Painless 扩展了：

```json
GET my-knn-index-2/_search
{
  "size": 2,
  "query": {
    "script_score": {
      "query": {
        "bool": {
          "filter": {
            "term": {
              "color": "BLUE"
            }
          }
        }
      },
      "script": {
        "source": "1.0 + cosineSimilarity(params.query_value, doc[params.field])",
        "params": {
          "field": "my_vector",
          "query_value": [9.9, 9.9]
        }
      }
    }
  }
}
```

`field` 必须映射到一个 `knn_vector` 字段，`query_value` 必须是一个与 `field` 维度相同的浮点数组。

## 函数类型
下表介绍了 k-NN 插件提供的可用 Painless 函数：

函数名称 | 函数签名 | 描述
:--- | :---
l2Squared | `float l2Squared (float[] queryVector, doc['vector field'])` | 此函数计算给定查询向量与文档向量之间 L2 距离（欧氏距离）的平方。距离越短，文档的相关性越高，因此本示例对 l2Squared 函数的返回值取倒数。如果文档向量与查询向量相同，结果为 0，因此本示例还会给距离加 1，以避免除以零的错误。
l1Norm | `float l1Norm (float[] queryVector, doc['vector field'])` | 此函数计算给定查询向量与文档向量之间 L2 距离（欧氏距离）的平方。距离越短，文档的相关性越高，因此本示例对 l2Squared 函数的返回值取倒数。如果文档向量与查询向量相同，结果为 0，因此本示例还会给距离加 1，以避免除以零的错误。
cosineSimilarity | `float cosineSimilarity (float[] queryVector, doc['vector field'])` | 余弦相似度是查询向量与文档向量在都归一化为长度 1 之后的内积。如果查询向量的模在整个查询过程中不变，你可以传入查询向量的模来提高性能，而不必针对每个过滤后的文档每次都计算一遍：<br /> `float cosineSimilarity (float[] queryVector, doc['vector field'], float normQueryVector)` <br />一般来说，余弦相似度的取值范围是 [-1, 1]。但在信息检索中，由于 tf-idf 统计量不可能为负，两个文档的余弦相似度范围是 0 到 1。因此，k-NN 插件会加上 1.0，以确保始终得到正的余弦相似度评分。

## 约束

1. 如果文档的 `knn_vector` 字段与查询的维度不同，函数会抛出 `IllegalArgumentException`。

2. 如果向量字段没有值，函数会抛出 <code>IllegalStateException</code>。

   你可以先检查文档的该字段是否有值，以避免这种情况：

   ```
   "source": "doc[params.field].size() == 0 ? 0 : 1 / (1 + l2Squared(params.query_value, doc[params.field]))",
   ```

   由于评分只能为正数，此脚本会将有向量字段的文档排在没有向量字段的文档之前。
