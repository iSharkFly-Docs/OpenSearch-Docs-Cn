---
title: 神经搜索
---

# 神经搜索

神经搜索（Neural Search）将文本转换为向量（vector），并在摄取和搜索时为向量搜索提供支持。在摄取期间，神经搜索将文档文本转换为向量嵌入（embedding），并在向量索引中同时为文本及其向量嵌入建立索引。在搜索时使用 neural 查询，神经搜索会将查询文本转换为向量嵌入，使用向量搜索比较查询与文档的嵌入，并返回最接近的结果。

在将文档摄取到索引之前，文档会先经过机器学习（ML）模型（model）处理，由模型为文档字段生成向量嵌入。发送搜索请求时，查询文本或图像同样会经过该 ML 模型，生成对应的向量嵌入。随后，神经搜索对这些嵌入执行向量搜索并返回匹配的文档。

## 前提条件

使用神经搜索之前，必须先设置 ML 模型。选择模型时有以下几种方式：

- 使用 OpenSearch 提供的预训练模型。有关更多信息，请参阅 [OpenSearch 提供的预训练模型](/ml-commons-plugin/pretrained-models)。

- 将自己的模型上传到 OpenSearch。有关更多信息，请参阅[自定义本地模型](/ml-commons-plugin/custom-local-models)。

- 连接到托管在外部平台上的基础模型。有关更多信息，请参阅[连接远程模型](/ml-commons-plugin/remote-models/)。

## 教程

有关分步教程，请参阅[神经搜索教程](/search-plugins/neural-search-tutorial)。

## 使用 ML 模型进行神经搜索

设置好 ML 模型后，选择以下任一搜索方法，即可使用该模型进行神经搜索。

### 语义搜索

语义搜索（semantic search）使用基于文本嵌入模型的稠密检索来搜索文本数据。有关详细的设置说明，请参阅[语义搜索](/search-plugins/semantic-search)。 

### 混合搜索

混合搜索（Hybrid Search）结合关键词搜索和神经搜索来提高搜索相关性。有关详细的设置说明，请参阅[混合搜索](/search-plugins/hybrid-search)。

### 多模态搜索

多模态搜索（multimodal search）将神经搜索与多模态嵌入模型结合使用，以搜索文本和图像数据。有关详细的设置说明，请参阅[多模态搜索](/search-plugins/multimodal-search)。

### 稀疏搜索

稀疏搜索（sparse search）将神经搜索与基于稀疏嵌入模型的稀疏检索结合使用，以搜索文本数据。有关详细的设置说明，请参阅[稀疏搜索](/search-plugins/neural-sparse-search)。

### 对话式搜索

借助对话式搜索（conversational search），你可以用自然语言提问、获得文本回答，并继续提出澄清性的追问。有关详细的设置说明，请参阅[对话式搜索](/search-plugins/conversational-search)。
