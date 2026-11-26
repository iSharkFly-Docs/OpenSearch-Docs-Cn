---
title: Search Relevance Stats API
---

# Search Relevance Stats API
<Badge type="tip" text="Introduced 2.7" />

Search Relevance Stats API 提供有关 [Search Relevance 插件](https://github.com/opensearch-project/dashboards-search-relevance)操作的信息。Search Relevance 插件负责处理由 Dashboards 工具 [Compare Search Results](/search-plugins/search-relevance/) 发送的操作。

Search Relevance Stats API 会采集收到请求时所在的一分钟时间间隔内的统计信息。例如，如果请求在 23:59:59.004 收到，则采集 23:58:00.000--23:58:59.999 这一时间间隔的统计信息。

要更改采集统计信息的默认时间间隔，请在 `opensearch_dashboards.yml` 文件中将 `searchRelevanceDashboards.metrics.metricInterval` 设置更新为新的时间间隔（以毫秒为单位）。`opensearch_dashboards.yml` 文件位于 OpenSearch Dashboards 安装目录的 `config` 文件夹中。例如，以下设置将时间间隔设为一秒：

```yml
searchRelevanceDashboards.metrics.metricInterval: 1000 
```

#### 示例请求

可以通过以下格式的 URL 地址访问 Search Relevance Stats API：

```
<opensearch-dashboards-endpoint-address>/api/relevancy/stats
```

::: info 注意
如果在 OpenSearch 配置文件中指定了端口号，OpenSearch Dashboards 的端点地址中可能会包含该端口号。具体的 URL 格式取决于 OpenSearch 的部署类型及其所在的网络环境。
:::

可以通过以下两种方式查询该端点：
  
  - 在浏览器中访问端点地址（例如 `http://localhost:5601/api/relevancy/stats`）

  - 在终端中使用 `curl` 命令：
    ```bash
    curl -X GET http://localhost:5601/api/relevancy/stats
    ```

#### 示例响应

以下是上述请求的响应：

```json
{
  "data": {
    "search_relevance": {
      "fetch_index": {
        "200": {
          "response_time_total": 28.79286289215088,
          "count": 1
        }
      },
      "single_search": {
        "200": {
          "response_time_total": 29.817723274230957,
          "count": 1
        }
      },
      "comparison_search": {
        "200": {
          "response_time_total": 13.265346050262451,
          "count": 2
        }
      }
    }
  },
  "overall": {
    "response_time_avg": 17.968983054161072,
    "requests_per_second": 0.06666666666666667
  },
  "counts_by_component": {
    "search_relevance": 4
  },
  "counts_by_status_code": {
    "200": 4
  }
}
```

## 响应字段

下表列出了所有响应字段。

| 字段 | 数据类型 | 描述 |
| :--- | :--- | :--- | 
| [`data.search_relevance`](#the-datasearch_relevance-object) | Object | 与 Search Relevance 操作相关的统计信息。 |
| `overall` | Object | 所有操作的平均统计信息。 |
| `overall.response_time_avg` | Double | 所有操作的平均响应时间，以毫秒为单位。 |
| `overall.requests_per_second` | Double | 所有操作的平均每秒请求数。 |
| `counts_by_component` | Object | `data` 对象所有子对象的 `count` 值之和。 |
| `counts_by_component.search_relevance` | `search_relevance` 对象中所有操作的响应总数。 |
| `counts_by_status_code` | Object | 包含所有 Search Relevance 操作的响应码及其计数的列表。 |

### `data.search_relevance` 对象 {#the-datasearchrelevance-object}

`data.search_relevance` 对象包含下表所述的字段。

| 字段 | 数据类型 | 描述 |
| :--- | :--- | :--- |
| `comparison_search` | Object | 与比较搜索操作相关的统计信息。比较搜索操作是指在 Compare Search Results 工具中同时输入 Query 1 和 Query 2 时，比较这两个查询的请求。 |
| `single_search` | Object | 与单次搜索操作相关的统计信息。单次搜索操作是指在 Compare Search Results 工具中只输入了 Query 1 或 Query 2（而非两者都输入）时，运行单个查询的请求。 |
| `fetch_index` | Object | 与为比较搜索或单次搜索获取一个或多个索引的操作相关的统计信息。 |

`comparison_search`、`single_search` 和 `fetch_index` 对象都包含一个 HTTP 响应码列表。下表列出了每个响应码的字段。

| 字段 | 数据类型 | 描述 |
| :--- | :--- | :--- |
| `response_time_total` | Double | 具有该 HTTP 状态码的响应的响应时间之和，以毫秒为单位。 |
| `count` | Integer | 具有该 HTTP 状态码的响应总数。  |
