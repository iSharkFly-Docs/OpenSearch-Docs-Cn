---
title: JNI 库
---

# JNI 库

为了将 [nmslib](https://github.com/nmslib/nmslib/) 和 [faiss](https://github.com/facebookresearch/faiss/) 的近似 k-NN 功能（使用 C++ 实现）集成到 k-NN 插件（使用 Java 实现）中，我们创建了一个 Java 本地接口（Java Native Interface，JNI），使 k-NN 插件能够调用本地库。该接口包括三个库：`libopensearchknn_nmslib`，即与 nmslib 交互的 JNI 库；`libopensearchknn_faiss`，即与 faiss 交互的 JNI 库；以及 `libopensearchknn_common`，即包含各本地库之间共享的通用功能的库。

::: info 注意
Lucene 库不是通过本地库实现的。
:::

`libopensearchknn_faiss` 和 `libopensearchknn_nmslib` 这两个库采用延迟加载，在插件中首次调用时才会加载。这意味着，如果你只打算使用其中一个库，插件永远不会加载另一个库。

要从源代码构建这些库，请参阅 [DEVELOPER_GUIDE](https://github.com/opensearch-project/k-NN/blob/main/DEVELOPER_GUIDE.md)。

有关 JNI 的更多信息，请参阅 Wikipedia 上的 [Java Native Interface](https://en.wikipedia.org/wiki/Java_Native_Interface)。
