---
title: Querqy
---

# Querqy

Querqy 是一个用于查询改写的社区插件，可帮助解决相关性问题，使搜索引擎在匹配和评分方面更加精确。

::: danger 警告
Querqy 目前仅支持 OpenSearch 2.3。
:::

## 安装 Querqy 插件

Querqy 插件现已支持 OpenSearch 2.3.0。运行以下命令安装 Querqy 插件。

````bash
./bin/opensearch-plugin install \
   "https://repo1.maven.org/maven2/org/querqy/opensearch-querqy/1.0.os2.3.0/opensearch-querqy-1.0.os2.3.0.zip"
````

安装过程中出现安全提示时请回答 `yes`，因为 Querqy 需要额外的权限来加载查询改写器。

安装 Querqy 插件后，可以在 Querqy.org 网站上找到完整的文档：[Querqy](https://docs.querqy.org/querqy/index.html)

## 路径和 HTTP 方法

```
POST /myindex/_search
```

## 示例查询

````json
{
   "query": {
       "querqy": {
           "matching_query": {
               "query": "books"
           },
           "query_fields": [ "title^3.0", "words^2.1", "shortSummary"]
       }
   }
}
````
