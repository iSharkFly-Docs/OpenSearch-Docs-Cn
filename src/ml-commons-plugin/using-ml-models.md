---
title: Using ML models within OpenSearch
---

# Using ML models within OpenSearch
<Badge type="tip" text="Generally available 2.9" />

To integrate machine learning (ML) models into your OpenSearch cluster, you can upload and serve them locally. Choose one of the following options:

- **Pretrained models provided by OpenSearch**: To learn more, see [OpenSearch-provided pretrained models](/ml-commons-plugin/pretrained-models). For a list of supported models, see [Supported pretrained models](/ml-commons-plugin/pretrained-models#supported-pretrained-models). 

- **Custom models** such as PyTorch deep learning models: To learn more, see [Custom models](/ml-commons-plugin/custom-local-models).

::: warning IMPORTANT
Running local models on the CentOS 7 operating system is not supported. Moreover, not all local models can run on all hardware and operating systems.
:::

## GPU acceleration

For better performance, you can take advantage of GPU acceleration on your ML node. For more information, see [GPU acceleration](/ml-commons-plugin/gpu-acceleration).
