---
title: 断路器设置
---

# 断路器设置

断路器（Circuit Breaker）可以防止 OpenSearch 引发 Java OutOfMemoryError。父断路器指定所有子断路器可用的内存总量。子断路器指定其自身可用的内存总量。

要了解有关静态设置和动态设置的更多信息，请参阅[配置 OpenSearch](/install-and-configure/configuring-opensearch/)。

## 父断路器设置

OpenSearch 支持以下父断路器设置：

- `indices.breaker.total.use_real_memory`（静态，Boolean）：如果为 `true`，父断路器会考虑实际内存使用量。否则，父断路器会考虑子断路器预留的内存量。默认值为 `true`。

- `indices.breaker.total.limit`（动态，percentage）：指定父断路器的初始内存限制。如果 `indices.breaker.total.use_real_memory` 为 `true`，默认值为 JVM 堆的 95%。如果 `indices.breaker.total.use_real_memory` 为 `false`，默认值为 JVM 堆的 70%。

## 字段数据断路器设置

字段数据断路器限制将字段加载到字段数据缓存中所需的堆内存。OpenSearch 支持以下字段数据断路器设置：

- `indices.breaker.fielddata.limit`（动态，percentage）：指定字段数据断路器的内存限制。默认值为 JVM 堆的 40%。

- `indices.breaker.fielddata.overhead`（动态，double）：一个常数，字段数据估算值乘以该常数即得到最终估算值。默认值为 1.03。

## 请求断路器设置

请求断路器限制构建请求所需数据结构（例如计算聚合时）所需的内存。OpenSearch 支持以下请求断路器设置：

- `indices.breaker.request.limit`（动态，percentage）：指定请求断路器的内存限制。默认值为 JVM 堆的 60%。

- `indices.breaker.request.overhead`（动态，double）：一个常数，请求估算值乘以该常数即得到最终估算值。默认值为 1。

## 传输中请求断路器设置

传输中请求断路器限制传输层和 HTTP 层上当前正在运行的所有传入请求的内存使用量。请求的内存使用量基于请求的内容长度，包括原始请求以及表示该请求的结构化对象所需的内存。OpenSearch 支持以下传输中请求断路器设置：

- `network.breaker.inflight_requests.limit`（动态，percentage）：指定传输中请求断路器的内存限制。默认值为 JVM 堆的 100%（因此，传输中请求的内存使用限制由父断路器的内存限制决定）。

- `network.breaker.inflight_requests.overhead`（动态，double）：一个常数，传输中请求估算值乘以该常数即得到最终估算值。默认值为 2。

## 脚本编译断路器设置

脚本编译断路器限制在一个时间间隔内内联脚本的编译次数。OpenSearch 支持以下脚本编译断路器设置：

- `script.max_compilations_rate`（动态，rate）：对于给定上下文，在一个时间间隔内编译的唯一动态脚本的最大数量。默认值为每 5 分钟 150 个（`150/5m`）。

## 正则表达式断路器设置

正则表达式断路器用于启用或禁用正则表达式，并限制其复杂度。OpenSearch 支持以下正则表达式断路器设置：

- `script.painless.regex.enabled`（静态，string）：在 Painless 脚本中启用正则表达式。
    有效值为：
    - `limited`：启用正则表达式，并使用 `script.painless.regex.limit-factor` 设置限制其复杂度。
    - `true`：启用正则表达式。关闭正则表达式断路器，不限制正则表达式的复杂度。
    - `false`：禁用正则表达式。如果 Painless 脚本包含正则表达式，则返回错误。

    默认值为 `limited`。

- `script.painless.regex.limit-factor`（静态，integer）：仅当 `script.painless.regex.enabled` 设置为 `limited` 时才适用。限制 Painless 脚本中正则表达式的字符数。字符数上限的计算方式为：脚本输入中的字符数乘以 `script.painless.regex.limit-factor`。默认值为 6（因此，如果输入有 5 个字符，则正则表达式中的最大字符数为 5 &middot; 6 = 30）。
