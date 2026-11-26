---
title: 监控
---

# 监控

通过统计端点，你可以收集插件（plugin）在统计间隔内的指标。注意，目前只实现了
节点级别的统计信息收集。也就是说，你只能获取当前所访问
节点的指标。集群级别的统计信息尚未
实现。

## 节点统计信息

### 说明

响应中各字段的含义如下：

|                 字段名|                                                    说明|
| ------------------------- | ------------------------------------------------------------- |
|              request_total|                                         请求总数|
|              request_count|                     统计间隔内的请求总数|
|failed_request_count_syserr|统计间隔内因系统错误而失败的请求数|
|failed_request_count_cuserr| 统计间隔内因错误请求而失败的请求数|
|    failed_request_count_cb| 表示插件在统计间隔内是否触发了熔断|

### 示例

SQL 查询：

```console
>> curl -H 'Content-Type: application/json' -X GET localhost:9200/_plugins/_sql/stats
```

结果集：

```json
{
  "failed_request_count_cb": 0,
  "failed_request_count_cuserr": 0,
  "circuit_breaker": 0,
  "request_total": 0,
  "request_count": 0,
  "failed_request_count_syserr": 0
}
```
