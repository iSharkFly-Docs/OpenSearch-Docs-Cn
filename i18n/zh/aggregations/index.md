---
title: 聚合
---

# 聚合

OpenSearch 不只是用于搜索。借助聚合（Aggregation），你可以利用 OpenSearch 强大的分析引擎来分析数据并从中提取统计信息。

聚合的用例多种多样，从实时分析数据以便采取行动，到使用 OpenSearch Dashboards 创建可视化仪表板，不一而足。

OpenSearch 可以在几毫秒内对海量数据集执行聚合。与查询（Query）相比，聚合会消耗更多的 CPU 周期和内存。

## 对 text 字段执行聚合

默认情况下，OpenSearch 不支持对 text 字段执行聚合。由于 text 字段会被分词，对 text 字段执行聚合时必须先逆转分词过程、还原出原始字符串，然后再基于该字符串进行聚合。这类操作会消耗大量内存并降低集群性能。

虽然你可以在映射（Mapping）中将 `fielddata` 参数设置为 `true` 来启用对 text 字段的聚合，但聚合仍然基于分词后的单词，而不是原始文本。

我们建议将 text 字段的原始版本保留为一个 `keyword` 字段，以便对其执行聚合。

在这种情况下，你可以对 `title.raw` 字段而不是 `title` 字段执行聚合：

```json
PUT movies
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fielddata": true,
        "fields": {
          "raw": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

## 聚合的通用结构

聚合查询的结构如下：

```json
GET _search
{
  "size": 0,
  "aggs": {
    "NAME": {
      "AGG_TYPE": {}
    }
  }
}
```

如果你只关心聚合结果而不关心查询结果，请将 `size` 设置为 0。

在 `aggs` 属性中（也可以使用 `aggregations`），你可以定义任意数量的聚合。每个聚合都由其名称和 OpenSearch 所支持的某种聚合类型来定义。

聚合名称可以帮助你在响应中区分不同的聚合。`AGG_TYPE` 属性用于指定聚合的类型。

## 聚合示例

本节使用 OpenSearch Dashboards 的电子商务示例数据和 Web 日志示例数据。要添加示例数据，请登录 OpenSearch Dashboards，选择 **Home**，然后选择 **Try our sample data**。对于 **Sample eCommerce orders** 和 **Sample web logs**，选择 **Add data**。

### avg

查找 `taxful_total_price` 字段的平均值：

```json
GET opensearch_dashboards_sample_data_ecommerce/_search
{
  "size": 0,
  "aggs": {
    "avg_taxful_total_price": {
      "avg": {
        "field": "taxful_total_price"
      }
    }
  }
}
```

#### 示例响应

```json
{
  "took" : 1,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 4675,
      "relation" : "eq"
    },
    "max_score" : null,
    "hits" : [ ]
  },
  "aggregations" : {
    "avg_taxful_total_price" : {
      "value" : 75.05542864304813
    }
  }
}
```

响应中的聚合块显示了 `taxful_total_price` 字段的平均值。

## 聚合类型

聚合主要有三种类型：

- 指标聚合（Metric Aggregation）——对数值字段计算 `sum`、`min`、`max` 和 `avg` 等指标。
- 桶聚合（Bucket Aggregation）——根据某些条件将查询结果分组。
- 管道聚合（Pipeline Aggregation）——将一个聚合的输出作为另一个聚合的输入。

## 嵌套聚合

聚合中的聚合称为嵌套聚合或子聚合（subaggregation）。

指标聚合产生简单的结果，不能包含嵌套聚合。

桶聚合会产生由文档（Document）组成的桶（Bucket），你可以将其嵌套在其他聚合中。通过在桶聚合中嵌套指标聚合和桶聚合，你可以对数据执行复杂的分析。

### 嵌套聚合的通用语法

```json
{
  "aggs": {
    "name": {
      "type": {
        "data"
      },
      "aggs": {
        "nested": {
          "type": {
            "data"
          }
        }
      }
    }
  }
}
```

内层的 `aggs` 关键字开始一个新的嵌套聚合。父聚合和嵌套聚合的语法相同。嵌套聚合在其前面的父聚合的上下文中运行。

你还可以将聚合与搜索查询结合使用，在聚合之前缩小要分析的范围。如果你不添加查询，OpenSearch 会隐式使用 `match_all` 查询。

## 限制

由于聚合器对所有值都使用 `double` 数据类型进行处理，因此大于等于 2<sup>53</sup> 的 `long` 值是近似值。
