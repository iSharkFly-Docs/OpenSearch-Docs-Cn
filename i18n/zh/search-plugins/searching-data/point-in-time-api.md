---
title: Point in Time API
---

# Point in Time API

使用 [时间点（Point in Time，PIT）](/search-plugins/searching-data/point-in-time) API 管理 PIT。

---

#### 目录
- TOC

---

## 创建 PIT
<Badge type="tip" text="Introduced 2.4" />

创建一个 PIT。`keep_alive` 查询参数是必需的，它指定 PIT 的保留时长。

### 路径和 HTTP 方法

```json
POST /<target_indexes>/_search/point_in_time?keep_alive=1h&routing=&expand_wildcards=&preference= 
```

### 路径参数

参数 | 数据类型 | 描述
:--- | :--- | :---
target_indexes | String | PIT 的目标索引名称。可以是以逗号分隔的列表，也可以是通配符索引模式。

### 查询参数

参数 | 数据类型 | 描述
:--- | :--- | :---
keep_alive | Time |  PIT 的保留时长。每次通过 Search API 访问 PIT 时，PIT 的生命周期都会延长 `keep_alive` 参数所指定的时长。必需。
preference | String | 用于执行搜索的节点或分片（shard）。可选。默认值为随机。
routing | String | 指定将搜索请求路由到特定分片。可选。默认值为文档的 `_id`。
expand_wildcards | String | 可与通配符模式匹配的索引类型。支持以逗号分隔的多个值。有效值如下：<br>- `all`：匹配任意索引或数据流，包括隐藏的索引或数据流。<br>- `open`：匹配打开的、非隐藏的索引或非隐藏的数据流。<br>- `closed`：匹配关闭的、非隐藏的索引或非隐藏的数据流。<br>- `hidden`：匹配隐藏的索引或数据流。必须与 `open`、`closed` 或者同时与 `open` 和 `closed` 组合使用。<br>- `none`：不接受任何通配符模式。<br> 可选。默认值为 `open`。
allow_partial_pit_creation | Boolean | 指定在部分失败时是否仍创建 PIT。可选。默认值为 `true`。

#### 示例请求

```json
POST /my-index-1/_search/point_in_time?keep_alive=100m
```

#### 示例响应

```json
{
    "pit_id": "o463QQEPbXktaW5kZXgtMDAwMDAxFnNOWU43ckt3U3IyaFVpbGE1UWEtMncAFjFyeXBsRGJmVFM2RTB6eVg1aVVqQncAAAAAAAAAAAIWcDVrM3ZIX0pRNS1XejE5YXRPRFhzUQEWc05ZTjdyS3dTcjJoVWlsYTVRYS0ydwAA",
    "_shards": {
        "total": 1,
        "successful": 1,
        "skipped": 0,
        "failed": 0
    },
    "creation_time": 1658146050064
}
```

### 响应字段

字段 | 数据类型 | 描述
:--- | :--- | :---  
pit_id | [Base64 encoded binary](/field-types/supported-field-types/binary) | PIT ID。
creation_time | long | PIT 的创建时间，以自纪元（epoch）以来的毫秒数表示。

## 延长 PIT 时间

执行搜索时，可以在 `pit` 对象中提供 `keep_alive` 参数来延长 PIT 时间：

```json
GET /_search
{
  "size": 10000,
  "query": {
    "match" : {
      "user.id" : "elkbee"
    }
  },
  "pit": {
    "id":  "46ToAwMDaWR5BXV1aWQyKwZub2RlXzMAAAAAAAAAACoBYwADaWR4BXV1aWQxAgZub2RlXzEAAAAAAAAAAAEBYQADaWR5BXV1aWQyKgZub2RlXzIAAAAAAAAAAAwBYgACBXV1aWQyAAAFdXVpZDEAAQltYXRjaF9hbGw_gAAAAA==", 
    "keep_alive": "100m"
  },
  "sort": [ 
    {"@timestamp": {"order": "asc"}}
  ],
  "search_after": [  
    "2021-05-20T05:30:04.832Z"
  ]
}
```

::: info 注意
搜索请求中的 `keep_alive` 参数是可选的，它指定 PIT 保留时间的延长量。
:::

## 列出所有 PIT
<Badge type="tip" text="Introduced 2.4" />

返回 OpenSearch 集群中的所有 PIT。

### 跨集群行为

List All PITs API 只返回本地 PIT 或混合 PIT（同时在本地集群和远程集群中创建的 PIT），不返回完全位于远程的 PIT。

#### 示例请求 {#example-request-1}

```json
GET /_search/point_in_time/_all
```

#### 示例响应 {#example-response-1}

```json
{
    "pits": [
        {
            "pit_id": "o463QQEPbXktaW5kZXgtMDAwMDAxFnNOWU43ckt3U3IyaFVpbGE1UWEtMncAFjFyeXBsRGJmVFM2RTB6eVg1aVVqQncAAAAAAAAAAAEWcDVrM3ZIX0pRNS1XejE5YXRPRFhzUQEWc05ZTjdyS3dTcjJoVWlsYTVRYS0ydwAA",
            "creation_time": 1658146048666,
            "keep_alive": 6000000
        },
        {
            "pit_id": "o463QQEPbXktaW5kZXgtMDAwMDAxFnNOWU43ckt3U3IyaFVpbGE1UWEtMncAFjFyeXBsRGJmVFM2RTB6eVg1aVVqQncAAAAAAAAAAAIWcDVrM3ZIX0pRNS1XejE5YXRPRFhzUQEWc05ZTjdyS3dTcjJoVWlsYTVRYS0ydwAA",
            "creation_time": 1658146050064,
            "keep_alive": 6000000
        }
    ]
}
```

### 响应字段 {#response-fields-1}

字段 | 数据类型 | 描述
:--- | :--- | :---  
pits | Array of JSON objects | 所有 PIT 的列表。

每个 PIT 对象包含以下字段。

字段 | 数据类型 | 描述
:--- | :--- | :---  
pit_id | [Base64 encoded binary](/field-types/supported-field-types/binary) | PIT ID。
creation_time | long | PIT 的创建时间，以自纪元以来的毫秒数表示。
keep_alive | long |  PIT 的保留时长，以毫秒为单位。

## 删除 PIT
<Badge type="tip" text="Introduced 2.4" />

删除一个、多个或全部 PIT。`keep_alive` 时间段结束后，PIT 会被自动删除。不过，为了释放资源，也可以使用 Delete PIT API 删除 PIT。Delete PIT API 支持按 ID 删除一组 PIT，或一次性删除所有 PIT。

### 跨集群行为 {#cross-cluster-behavior-1}

Delete PITs by ID API 完全支持删除跨集群 PIT。

Delete All PITs API 只删除本地 PIT 或混合 PIT（同时在本地集群和远程集群中创建的 PIT），不删除完全位于远程的 PIT。

#### 示例请求：删除所有 PIT

```json
DELETE /_search/point_in_time/_all
```

如果要删除一个或多个 PIT，请在请求正文中指定它们的 PIT ID。

### 请求字段

字段 | 数据类型 | 描述
:--- | :--- | :---
pit_id | [Base64 encoded binary](/field-types/supported-field-types/binary) or an array of binaries | 要删除的 PIT 的 ID。必需。

#### 示例请求：按 ID 删除 PIT

```json
DELETE /_search/point_in_time

{
    "pit_id": [
        "o463QQEPbXktaW5kZXgtMDAwMDAxFkhGN09fMVlPUkVPLXh6MUExZ1hpaEEAFjBGbmVEZHdGU1EtaFhhUFc4ZkR5cWcAAAAAAAAAAAEWaXBPNVJtZEhTZDZXTWFFR05waXdWZwEWSEY3T18xWU9SRU8teHoxQTFnWGloQQAA",
        "o463QQEPbXktaW5kZXgtMDAwMDAxFkhGN09fMVlPUkVPLXh6MUExZ1hpaEEAFjBGbmVEZHdGU1EtaFhhUFc4ZkR5cWcAAAAAAAAAAAIWaXBPNVJtZEhTZDZXTWFFR05waXdWZwEWSEY3T18xWU9SRU8teHoxQTFnWGloQQAA"
    ]
}
```

#### 示例响应 {#example-response-2}

对于每个 PIT，响应中都包含一个 JSON 对象，其中有 PIT ID 和一个 `successful` 字段，用于表示删除是否成功。部分失败按失败处理。

```json
{
    "pits": [
        {
            "successful": true,
            "pit_id": "o463QQEPbXktaW5kZXgtMDAwMDAxFkhGN09fMVlPUkVPLXh6MUExZ1hpaEEAFjBGbmVEZHdGU1EtaFhhUFc4ZkR5cWcAAAAAAAAAAAEWaXBPNVJtZEhTZDZXTWFFR05waXdWZwEWSEY3T18xWU9SRU8teHoxQTFnWGloQQAA"
        },
        {
            "successful": false,
            "pit_id": "o463QQEPbXktaW5kZXgtMDAwMDAxFkhGN09fMVlPUkVPLXh6MUExZ1hpaEEAFjBGbmVEZHdGU1EtaFhhUFc4ZkR5cWcAAAAAAAAAAAIWaXBPNVJtZEhTZDZXTWFFR05waXdWZwEWSEY3T18xWU9SRU8teHoxQTFnWGloQQAA"
        }
    ]
}
```

### 响应字段 {#response-fields-2}

字段 | 数据类型 | 描述
:--- | :--- | :---
successful | Boolean | 删除操作是否成功。
pit_id | [Base64 encoded binary](/field-types/supported-field-types/binary)  | 要删除的 PIT 的 ID。

## PIT 段
<Badge type="tip" text="Introduced 2.4" />

与 [CAT Segments API](/api-reference/cat/cat-segments) 类似，PIT Segments API 通过描述 PIT 的 Lucene 段（segment），提供有关 PIT 磁盘使用情况的底层信息。PIT Segments API 支持按 ID 列出特定 PIT 的段信息，或一次性列出所有 PIT 的段信息。

#### 示例请求：所有 PIT 的 PIT 段

```json
GET /_cat/pit_segments/_all
```

如果要列出一个或多个 PIT 的段，请在请求正文中指定它们的 PIT ID。

### 请求字段 {#request-fields-1}

字段 | 数据类型 | 描述
:--- | :--- | :---
pit_id | [Base64 encoded binary](/field-types/supported-field-types/binary) or an array of binaries | 要列出其段的 PIT 的 ID。必需。

#### 示例请求：按 ID 列出 PIT 的段

```json
GET /_cat/pit_segments

{
    "pit_id": [
        "o463QQEPbXktaW5kZXgtMDAwMDAxFkhGN09fMVlPUkVPLXh6MUExZ1hpaEEAFjBGbmVEZHdGU1EtaFhhUFc4ZkR5cWcAAAAAAAAAAAEWaXBPNVJtZEhTZDZXTWFFR05waXdWZwEWSEY3T18xWU9SRU8teHoxQTFnWGloQQAA",
        "o463QQEPbXktaW5kZXgtMDAwMDAxFkhGN09fMVlPUkVPLXh6MUExZ1hpaEEAFjBGbmVEZHdGU1EtaFhhUFc4ZkR5cWcAAAAAAAAAAAIWaXBPNVJtZEhTZDZXTWFFR05waXdWZwEWSEY3T18xWU9SRU8teHoxQTFnWGloQQAA"
    ]
}
```

#### 示例响应 {#example-response-3}

```json
index  shard prirep ip            segment generation docs.count docs.deleted  size size.memory committed searchable version compound
index1 0     r      10.212.36.190 _0               0          4            0 3.8kb        1364 false     true       8.8.2   true
index1 1     p      10.212.36.190 _0               0          3            0 3.7kb        1364 false     true       8.8.2   true
index1 2     r      10.212.74.139 _0               0          2            0 3.6kb        1364 false     true       8.8.2   true
```

## PIT 设置

可以为 PIT 指定以下设置。

设置 | 描述 | 默认值
:--- | :--- | :---
point_in_time.max_keep_alive | 集群级设置，指定 `keep_alive` 参数的最大值。 | 24h
search.max_open_pit_context | 节点级设置，指定节点上打开的 PIT 上下文的最大数量。 | 300
