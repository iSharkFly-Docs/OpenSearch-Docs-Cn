---
title: k-NN 搜索
---

# k-NN 搜索

k-NN 是 *k 最近邻（k-nearest neighbors）* 的缩写。借助 k-NN 插件，用户可以在由向量（Vector）组成的索引中，搜索与查询点距离最近的 k 个邻居。为了确定这些邻居，你可以指定用于度量点间距离的空间（即距离函数）。

典型用例包括推荐（例如音乐应用中的「你可能还喜欢的其他歌曲」功能）、图像识别和欺诈检测。有关 k-NN 搜索的更多背景信息，请参阅 [Wikipedia](https://en.wikipedia.org/wiki/Nearest_neighbor_search)。

该插件支持三种从向量索引中获取 k 最近邻的方法：

1. **近似 k-NN（Approximate k-NN）**

    第一种方法采用近似最近邻的思路——使用若干算法之一，返回与查询向量近似的 k 个最近邻。通常，这些算法会牺牲索引速度和搜索精度，以换取更低的延迟、更小的内存占用和更好的搜索可扩展性等性能优势。要详细了解这些算法，请参阅 [*nmslib*](https://github.com/nmslib/nmslib/blob/master/manual/README.md) 和 [*faiss*](https://github.com/facebookresearch/faiss/wiki) 的文档。

    对于需要低延迟、且数据量很大的索引（即包含数十万甚至更多向量）上的搜索，近似 k-NN 是最佳选择。如果你希望在 k-NN 搜索之前先对索引应用过滤器，从而大幅减少需要搜索的向量数量，则不应使用近似 k-NN。在这种情况下，应使用脚本评分方法或 Painless 扩展。

    有关此方法的更多详细信息（包括使用哪种引擎的建议），请参阅[近似 k-NN 搜索](/search-plugins/knn/approximate-knn)。

2. **Script Score k-NN**

    第二种方法扩展了 OpenSearch 的脚本评分功能，可在 "knn_vector" 字段或可表示二进制对象的字段上执行暴力（brute force）精确 k-NN 搜索。使用这种方法，你可以只在索引中的一部分向量上运行 k-NN 搜索（有时称为预过滤搜索）。

    当搜索的文档集合较小，或需要预过滤时，请使用这种方法。在大型索引上使用这种方法可能会导致较高的延迟。

    有关此方法的更多详细信息，请参阅[使用评分脚本的精确 k-NN](/search-plugins/knn/knn-score-script)。

3. **Painless 扩展**

    第三种方法将距离函数作为 Painless 扩展提供，你可以在更复杂的组合中使用它们。与 k-NN Script Score 类似，你可以使用这种方法在索引上执行暴力精确 k-NN 搜索，同样支持预过滤。

    与 k-NN Script Score 相比，这种方法的查询性能略慢。如果你的用例需要对最终评分进行更多自定义，则应优先使用这种方法，而不是 Script Score k-NN。

    有关此方法的更多详细信息，请参阅 [Painless 脚本函数](/search-plugins/knn/painless-functions)。

总体而言，对于较大的数据集，通常应选择近似最近邻方法，因为它的可扩展性要好得多。对于可能需要应用过滤器的较小数据集，应选择自定义评分方法。如果你的用例更复杂，需要将距离函数作为评分方法的一部分，则应使用 Painless 脚本方法。
