---
title: 脚本指标
---

# 脚本指标聚合

`scripted_metric` 指标是一种多值指标聚合（Metric Aggregation），返回根据指定脚本计算出的指标。

脚本分为四个阶段：初始阶段、映射（map）阶段、合并（combine）阶段和归约（reduce）阶段。

* `init_script`：（可选）设置初始状态，在收集任何文档（Document）之前执行。
* `map_script`：检查 `type` 字段的值，并对收集到的文档执行聚合。
* `combine_script`：聚合从每个分片（Shard）返回的状态，并将聚合后的值返回给协调节点。
* `reduce_script`：提供对变量状态的访问；该变量将每个分片上 `combine_script` 的结果合并为一个数组。

以下示例对 Web 日志数据中不同的 HTTP 响应类型进行聚合：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggregations": {
    "responses.counts": {
      "scripted_metric": {
        "init_script": "state.responses = ['error':0L,'success':0L,'other':0L]",
        "map_script": """
              def code = doc['response.keyword'].value;
                 if (code.startsWith('5') || code.startsWith('4')) {
                  state.responses.error += 1 ;
                  } else if(code.startsWith('2')) {
                   state.responses.success += 1;
                  } else {
                  state.responses.other += 1;
                }
             """,
        "combine_script": "state.responses",
        "reduce_script": """
            def counts = ['error': 0L, 'success': 0L, 'other': 0L];
                for (responses in states) {
                 counts.error += responses['error'];
                  counts.success += responses['success'];
                counts.other += responses['other'];
        }
        return counts;
        """
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "responses.counts" : {
    "value" : {
      "other" : 0,
      "success" : 12832,
      "error" : 1242
    }
  }
 }
}
```
