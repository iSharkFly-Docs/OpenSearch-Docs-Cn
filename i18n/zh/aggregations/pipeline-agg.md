---
title: 管道聚合
---

# 管道聚合

通过管道聚合（Pipeline Aggregation），你可以把一个聚合（Aggregation）的结果作为输入传递给另一个聚合，从而将多个聚合串联起来，得到更精细的输出。

你可以使用管道聚合来计算复杂的统计和数学指标，例如导数、移动平均值、累积和等。

## 管道聚合语法

管道聚合使用 `buckets_path` 属性来访问其他聚合的结果。
`buckets_path` 属性具有特定的语法：

```
buckets_path = <AGG_NAME>[<AGG_SEPARATOR>,<AGG_NAME>]*[<METRIC_SEPARATOR>, <METRIC>];
```

其中：

- `AGG_NAME` 是聚合的名称。
- `AGG_SEPARATOR` 用于分隔聚合，用 `>` 表示。
- `METRIC_SEPARATOR` 用于分隔聚合及其指标，用 `.` 表示。
- `METRIC` 是指标的名称，适用于多值指标聚合（Metric Aggregation）。

例如，`my_sum.sum` 选择名为 `my_sum` 的聚合的 `sum` 指标。`popular_tags>my_sum.sum` 将 `my_sum.sum` 嵌套到 `popular_tags` 聚合中。

你还可以指定以下附加参数：

- `gap_policy`：真实数据中可能存在空缺或 null 值。你可以通过 `gap_policy` 属性指定处理这类缺失数据的策略。可以将 `gap_policy` 属性设置为 `skip`，跳过缺失数据并从下一个可用值继续；也可以设置为 `insert_zeros`，用零替换缺失值并继续运行。
- `format`：输出值的格式类型。例如，日期值可以使用 `yyyy-MM-dd`。

## 快速示例

对 `sum_total_memory` 聚合返回的所有桶（Bucket）求和：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "number_of_bytes": {
      "histogram": {
        "field": "bytes",
        "interval": 10000
      },
      "aggs": {
        "sum_total_memory": {
          "sum": {
            "field": "phpmemory"
          }
        }
      }
    },
    "sum_copies": {
      "sum_bucket": {
        "buckets_path": "number_of_bytes>sum_total_memory"
      }
    }
  }
}
```

#### 示例响应

```json
...
"aggregations" : {
  "number_of_bytes" : {
    "buckets" : [
      {
        "key" : 0.0,
        "doc_count" : 13372,
        "sum_total_memory" : {
          "value" : 9.12664E7
        }
      },
      {
        "key" : 10000.0,
        "doc_count" : 702,
        "sum_total_memory" : {
          "value" : 0.0
        }
      }
    ]
  },
  "sum_copies" : {
    "value" : 9.12664E7
  }
 }
}
```

## 管道聚合的类型

管道聚合分为两种类型：

### 同级聚合

同级聚合（Sibling Aggregation）接收嵌套聚合的输出，并在与嵌套桶相同的层级上生成新的桶或新的聚合。

同级聚合必须是多桶聚合（即某个字段有多个分组值），并且指标必须是数值。

`min_bucket`、`max_bucket`、`sum_bucket` 和 `avg_bucket` 是常见的同级聚合。

### 父聚合

父聚合（Parent Aggregation）接收外层聚合的输出，并在与现有桶相同的层级上生成新的桶或新的聚合。

父聚合必须将 `min_doc_count` 设置为 0（这是 `histogram` 聚合的默认值），并且指定的指标必须是数值。如果 `min_doc_count` 大于 `0`，某些桶会被省略，这可能导致结果不正确。

`derivatives` 和 `cumulative_sum` 是常见的父聚合。

## avg_bucket, sum_bucket, min_bucket, max_bucket

`avg_bucket`、`sum_bucket`、`min_bucket` 和 `max_bucket` 聚合是同级聚合，分别计算前一个聚合每个桶中某个指标的平均值、总和、最小值和最大值。

以下示例创建一个间隔为一个月的日期直方图。`sum` 子聚合计算每个月所有字节数的总和。最后，`avg_bucket` 聚合使用该总和计算每月的平均字节数：

```json
POST opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "visits_per_month": {
      "date_histogram": {
        "field": "@timestamp",
        "interval": "month"
      },
      "aggs": {
        "sum_of_bytes": {
          "sum": {
            "field": "bytes"
          }
        }
      }
    },
    "avg_monthly_bytes": {
      "avg_bucket": {
        "buckets_path": "visits_per_month>sum_of_bytes"
      }
    }
  }
}
```

#### 示例响应 {#example-response-1}

```json
...
"aggregations" : {
  "visits_per_month" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "sum_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "sum_of_bytes" : {
          "value" : 3.8880434E7
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "sum_of_bytes" : {
          "value" : 3.1445055E7
        }
      }
    ]
  },
  "avg_monthly_bytes" : {
    "value" : 2.6575229666666668E7
  }
 }
}
```

同样，你也可以计算每月字节数的 `sum_bucket`、`min_bucket` 和 `max_bucket` 值。

## stats_bucket, extended_stats_bucket {#statsbucket-extendedstatsbucket}

`stats_bucket` 聚合是一种同级聚合，它为前一个聚合的桶返回多种统计值（`count`、`min`、`max`、`avg` 和 `sum`）。

以下示例返回嵌套在 `visits_per_month` 聚合中的 `sum_of_bytes` 聚合所返回的桶的基本统计值：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "visits_per_month": {
      "date_histogram": {
        "field": "@timestamp",
        "interval": "month"
      },
      "aggs": {
        "sum_of_bytes": {
          "sum": {
            "field": "bytes"
          }
        }
      }
    },
    "stats_monthly_bytes": {
      "stats_bucket": {
        "buckets_path": "visits_per_month>sum_of_bytes"
      }
    }
  }
}
```

#### 示例响应 {#example-response-2}

```json
...
"stats_monthly_bytes" : {
  "count" : 3,
  "min" : 9400200.0,
  "max" : 3.8880434E7,
  "avg" : 2.6575229666666668E7,
  "sum" : 7.9725689E7
  }
 }
}
```

`extended_stats` 聚合是 `stats` 聚合的扩展版本。除了基本统计值之外，`extended_stats` 还提供 `sum_of_squares`、`variance` 和 `std_deviation` 等统计值。

#### 示例响应 {#example-response-3}

```json
"stats_monthly_visits" : {
  "count" : 3,
  "min" : 9400200.0,
  "max" : 3.8880434E7,
  "avg" : 2.6575229666666668E7,
  "sum" : 7.9725689E7,
  "sum_of_squares" : 2.588843392021381E15,
  "variance" : 1.5670496550438025E14,
  "variance_population" : 1.5670496550438025E14,
  "variance_sampling" : 2.3505744825657038E14,
  "std_deviation" : 1.251818539183616E7,
  "std_deviation_population" : 1.251818539183616E7,
  "std_deviation_sampling" : 1.5331583357780447E7,
  "std_deviation_bounds" : {
    "upper" : 5.161160045033899E7,
    "lower" : 1538858.8829943463,
    "upper_population" : 5.161160045033899E7,
    "lower_population" : 1538858.8829943463,
    "upper_sampling" : 5.723839638222756E7,
    "lower_sampling" : -4087937.0488942266
   }
  }
 }
}
```

## bucket_script, bucket_selector

`bucket_script` 聚合是一种父聚合，它执行脚本，对前一个聚合的每个桶进行计算。请确保指标是数值类型，并且返回值也是数值。

使用 `script` 参数添加脚本。脚本可以是内联脚本，也可以存放在文件或索引（Index）中。要启用内联脚本，请在 `config` 文件夹下的 `opensearch.yml` 文件中添加以下行：

```yaml
script.inline: on
```

`buckets_path` 属性由多个条目组成。每个条目是一个键和一个值。键是可以在脚本中使用的值的名称。

基本语法如下：

```json
{
  "bucket_script": {
    "buckets_path": {
    "my_var1": "the_sum",
    "my_var2": "the_value_count"
  },
 "script": "params.my_var1 / params.my_var2"
  }
}
```

以下示例对日期直方图生成的桶使用 `sum` 聚合。根据所得的桶值，在 zip 扩展名的上下文中，以 10,000 字节为间隔计算 RAM 百分比：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "histogram": {
        "field": "bytes",
        "interval": "10000"
      },
      "aggs": {
        "total_ram": {
          "sum": {
            "field": "machine.ram"
          }
        },
        "ext-type": {
          "filter": {
            "term": {
              "extension.keyword": "zip"
            }
          },
          "aggs": {
            "total_ram": {
              "sum": {
                "field": "machine.ram"
              }
            }
          }
        },
        "ram-percentage": {
          "bucket_script": {
            "buckets_path": {
              "machineRam": "ext-type>total_ram",
              "totalRam": "total_ram"
            },
            "script": "params.machineRam / params.totalRam"
          }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-4}

```json
"aggregations" : {
  "sales_per_month" : {
    "buckets" : [
      {
        "key" : 0.0,
        "doc_count" : 13372,
        "os-type" : {
          "doc_count" : 1558,
          "total_ram" : {
            "value" : 2.0090783268864E13
          }
        },
        "total_ram" : {
          "value" : 1.7214228922368E14
        },
        "ram-percentage" : {
          "value" : 0.11671032934131736
        }
      },
      {
        "key" : 10000.0,
        "doc_count" : 702,
        "os-type" : {
          "doc_count" : 116,
          "total_ram" : {
            "value" : 1.622423896064E12
          }
        },
        "total_ram" : {
          "value" : 9.015136354304E12
        },
        "ram-percentage" : {
          "value" : 0.17996665078608862
        }
      }
    ]
  }
 }
}
```

RAM 百分比计算完成后会追加到每个桶的末尾。

`bucket_selector` 聚合是一种基于脚本的聚合，用于选择 `histogram`（或 `date_histogram`）聚合返回的桶。当你希望根据自己提供的条件从输出中排除某些桶时，可以使用它。

`bucket_selector` 聚合执行脚本，以决定某个桶是否保留在父多桶聚合中。

基本语法如下：

```json
{
  "bucket_selector": {
    "buckets_path": {
    "my_var1": "the_sum",
    "my_var2": "the_value_count"
  },
  "script": "params.my_var1 / params.my_var2"
  }
}
```

以下示例计算字节数总和，然后判断该总和是否大于 20,000。如果是，则该桶保留在桶列表中；否则，会从最终输出中删除。

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "bytes_per_month": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "month"
      },
      "aggs": {
        "total_bytes": {
          "sum": {
            "field": "bytes"
          }
        },
        "bytes_bucket_filter": {
          "bucket_selector": {
            "buckets_path": {
              "totalBytes": "total_bytes"
            },
            "script": "params.totalBytes > 20000"
          }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-5}

```json
"aggregations" : {
  "bytes_per_month" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "total_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "total_bytes" : {
          "value" : 3.8880434E7
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "total_bytes" : {
          "value" : 3.1445055E7
        }
      }
    ]
  }
 }
}
```

## bucket_sort {#bucketsort}

`bucket_sort` 聚合是一种父聚合，用于对前一个聚合的桶进行排序。

你可以同时指定多个排序字段及其对应的排序顺序。此外，还可以根据每个桶的键、计数或其子聚合对桶进行排序。你也可以通过设置 `from` 和 `size` 参数来截断桶。

语法

```json
{
  "bucket_sort": {
    "sort": [
    {"sort_field_1": {"order": "asc"}},
    {"sort_field_2": {"order": "desc"}},
    "sort_field_3"
    ],
 "from":1,
 "size":3
 }
}
```

以下示例根据计算出的 `total_sum` 值对 `date_histogram` 聚合的桶进行排序。我们按降序对桶进行排序，使字节数最多的桶最先返回。

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "month"
      },
      "aggs": {
        "total_bytes": {
          "sum": {
            "field": "bytes"
          }
        },
        "bytes_bucket_sort": {
          "bucket_sort": {
            "sort": [
              { "total_bytes": { "order": "desc" } }
            ],
            "size": 3                                
          }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-6}

```json
"aggregations" : {
  "sales_per_month" : {
    "buckets" : [
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "total_bytes" : {
          "value" : 3.8880434E7
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "total_bytes" : {
          "value" : 3.1445055E7
        }
      },
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "total_bytes" : {
          "value" : 9400200.0
        }
      }
    ]
  }
 }
}
```

你也可以使用此聚合在不排序的情况下截断结果桶。为此，只需使用 `from` 和/或 `size` 参数，而不使用 `sort`。

## cumulative_sum {#cumulativesum}

`cumulative_sum` 聚合是一种父聚合，用于计算前一个聚合中每个桶的累积和。

累积和是给定序列的部分和所组成的序列。例如，序列 `{a,b,c,…}` 的累积和为 `a`、`a+b`、`a+b+c`，依此类推。你可以使用累积和来可视化某个字段随时间的变化率。

以下示例按月计算累积字节数：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "month"
      },
      "aggs": {
        "no-of-bytes": {
          "sum": {
            "field": "bytes"
          }
        },
        "cumulative_bytes": {
          "cumulative_sum": {
            "buckets_path": "no-of-bytes"
          }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-7}

```json
...
"aggregations" : {
  "sales_per_month" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "no-of-bytes" : {
          "value" : 9400200.0
        },
        "cumulative_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "no-of-bytes" : {
          "value" : 3.8880434E7
        },
        "cumulative_bytes" : {
          "value" : 4.8280634E7
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "no-of-bytes" : {
          "value" : 3.1445055E7
        },
        "cumulative_bytes" : {
          "value" : 7.9725689E7
        }
      }
    ]
  }
 }
}
```

## derivative

`derivative` 聚合是一种父聚合，用于计算前一个聚合中每个桶的一阶导数和二阶导数。

在数学中，函数的导数衡量函数对变化的敏感程度。换句话说，导数评估的是某个函数相对于某个变量的变化率。要了解有关导数的更多信息，请参阅 [Wikipedia](https://en.wikipedia.org/wiki/Derivative)。

你可以使用导数来计算数值相对于之前时间段的变化率。

一阶导数表示某个指标是在增加还是减少，以及增加或减少了多少。

以下示例计算每月字节数总和的一阶导数。一阶导数是当月字节数与上月字节数之差：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "month"
      },
      "aggs": {
        "number_of_bytes": {
          "sum": {
            "field": "bytes"
          }
        },
        "bytes_deriv": {
          "derivative": {
            "buckets_path": "number_of_bytes"
          }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-8}

```json
...
"aggregations" : {
  "sales_per_month" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "number_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "number_of_bytes" : {
          "value" : 3.8880434E7
        },
        "bytes_deriv" : {
          "value" : 2.9480234E7
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "number_of_bytes" : {
          "value" : 3.1445055E7
        },
        "bytes_deriv" : {
          "value" : -7435379.0
        }
      }
    ]
  }
 }
}
```

二阶导数是二重导数，即导数的导数。
它表示某个量的变化率本身是如何变化的，即相邻桶的一阶导数之差。

要计算二阶导数，请将一个导数聚合串联到另一个导数聚合上：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "sales_per_month": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "month"
      },
      "aggs": {
        "number_of_bytes": {
          "sum": {
            "field": "bytes"
          }
        },
        "bytes_deriv": {
          "derivative": {
            "buckets_path": "number_of_bytes"
          }
        },
        "bytes_2nd_deriv": {
          "derivative": {
            "buckets_path": "bytes_deriv"
          }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-9}

```json
...
"aggregations" : {
  "sales_per_month" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "number_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "number_of_bytes" : {
          "value" : 3.8880434E7
        },
        "bytes_deriv" : {
          "value" : 2.9480234E7
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "number_of_bytes" : {
          "value" : 3.1445055E7
        },
        "bytes_deriv" : {
          "value" : -7435379.0
        },
        "bytes_2nd_deriv" : {
          "value" : -3.6915613E7
        }
      }
    ]
  }
 }
}
```

第一个桶没有一阶导数，因为导数至少需要两个点才能进行比较。第一个和第二个桶没有二阶导数，因为二阶导数至少需要两个一阶导数数据点。

"2020-11-01" 桶的一阶导数为 2.9480234E7，"2020-12-01" 桶的一阶导数为 -7435379。因此，“2020-12-01” 桶的二阶导数为 -3.6915613E7（-7435379-2.9480234E7）。

理论上，你可以继续串联导数聚合来计算三阶、四阶乃至更高阶的导数。但对于大多数数据集来说，这样做几乎没有任何价值。

## moving_avg {#movingavg}

`moving_avg` 聚合是一种父聚合，用于计算移动平均指标。

`moving_avg` 聚合求出数据集中不同窗口（子集）的一系列平均值。窗口大小表示每次迭代中窗口覆盖的数据点数量（由 `window` 属性指定，默认为 5）。每次迭代时，算法计算落入窗口的所有数据点的平均值，然后向前滑动：排除上一个窗口的第一个成员，并纳入下一个窗口的第一个成员。

例如，给定数据 `[1, 5, 8, 23, 34, 28, 7, 23, 20, 19]`，可以按如下方式计算窗口大小为 5 的简单移动平均值：

```
(1 + 5 + 8 + 23 + 34) / 5 = 14.2
(5 + 8 + 23 + 34+ 28) / 5 = 19.6
(8 + 23 + 34 + 28 + 7) / 5 = 20
so on...
```

更多信息，请参阅 [Wikipedia](https://en.wikipedia.org/wiki/Moving_average)。

你可以使用 `moving_avg` 聚合来平滑时间序列数据中的短期波动，或突出其中的长期趋势或周期。

指定一个较小的窗口大小（例如 `window`: 10），使其紧密跟随数据，从而平滑小规模波动。
或者，指定一个较大的窗口大小（例如 `window`: 100），使其明显滞后于实际数据，从而平滑所有较高频率的波动或随机噪声，让较低频率的趋势更加明显。

以下示例将 `moving_avg` 聚合嵌套到 `date_histogram` 聚合中：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "my_date_histogram": {                                
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "month"
      },
      "aggs": {
        "sum_of_bytes": {
          "sum": { "field": "bytes" }                 
        },
        "moving_avg_of_sum_of_bytes": {
          "moving_avg": { "buckets_path": "sum_of_bytes" }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-10}

```json  
...
"aggregations" : {
  "my_date_histogram" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "sum_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "sum_of_bytes" : {
          "value" : 3.8880434E7
        },
        "moving_avg_of_sum_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "sum_of_bytes" : {
          "value" : 3.1445055E7
        },
        "moving_avg_of_sum_of_bytes" : {
          "value" : 2.4140317E7
        }
      }
    ]
  }
 }
}
```

你还可以使用 `moving_avg` 聚合来预测未来的桶。
要预测桶，请添加 `predict` 属性，并将其设置为你希望看到的预测数量。

以下示例在前面的查询中添加了五个预测值：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "my_date_histogram": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "month"
      },
      "aggs": {
        "sum_of_bytes": {
          "sum": {
            "field": "bytes"
          }
        },
        "moving_avg_of_sum_of_bytes": {
          "moving_avg": {
            "buckets_path": "sum_of_bytes",
            "predict": 5
          }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-11}

```json
"aggregations" : {
  "my_date_histogram" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "sum_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "sum_of_bytes" : {
          "value" : 3.8880434E7
        },
        "moving_avg_of_sum_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "sum_of_bytes" : {
          "value" : 3.1445055E7
        },
        "moving_avg_of_sum_of_bytes" : {
          "value" : 2.4140317E7
        }
      },
      {
        "key_as_string" : "2021-01-01T00:00:00.000Z",
        "key" : 1609459200000,
        "doc_count" : 0,
        "moving_avg_of_sum_of_bytes" : {
          "value" : 2.6575229666666668E7
        }
      },
      {
        "key_as_string" : "2021-02-01T00:00:00.000Z",
        "key" : 1612137600000,
        "doc_count" : 0,
        "moving_avg_of_sum_of_bytes" : {
          "value" : 2.6575229666666668E7
        }
      },
      {
        "key_as_string" : "2021-03-01T00:00:00.000Z",
        "key" : 1614556800000,
        "doc_count" : 0,
        "moving_avg_of_sum_of_bytes" : {
          "value" : 2.6575229666666668E7
        }
      },
      {
        "key_as_string" : "2021-04-01T00:00:00.000Z",
        "key" : 1617235200000,
        "doc_count" : 0,
        "moving_avg_of_sum_of_bytes" : {
          "value" : 2.6575229666666668E7
        }
      },
      {
        "key_as_string" : "2021-05-01T00:00:00.000Z",
        "key" : 1619827200000,
        "doc_count" : 0,
        "moving_avg_of_sum_of_bytes" : {
          "value" : 2.6575229666666668E7
        }
      }
    ]
  }
 }
}
```

`moving_avg` 聚合支持五种模型：`simple`、`linear`、`exponentially weighted`、`holt-linear` 和 `holt-winters`。这些模型的区别在于对窗口中各值的加权方式。随着数据点变得“更旧”（即窗口逐渐滑离这些数据点），它们的权重可能会有所不同。你可以通过设置 `model` 属性来指定所需的模型。`model` 属性包含模型名称和 `settings` 对象，你可以使用该对象提供模型属性。有关这些模型的更多信息，请参阅 [Wikipedia](https://en.wikipedia.org/wiki/Moving_average)。

`simple` 模型首先计算窗口中所有数据点的总和，然后将该总和除以窗口大小。换句话说，`simple` 模型为数据集中的每个窗口计算一个简单的算术平均值。

以下示例使用窗口大小为 30 的 simple 模型：

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "my_date_histogram": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "month"
      },
      "aggs": {
        "sum_of_bytes": {
          "sum": {
            "field": "bytes"
          }
        },
        "moving_avg_of_sum_of_bytes": {
          "moving_avg": {
            "buckets_path": "sum_of_bytes",
            "window": 30,
            "model": "simple"
          }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-12}

```json
...
"aggregations" : {
  "my_date_histogram" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "sum_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "sum_of_bytes" : {
          "value" : 3.8880434E7
        },
        "moving_avg_of_sum_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "sum_of_bytes" : {
          "value" : 3.1445055E7
        },
        "moving_avg_of_sum_of_bytes" : {
          "value" : 2.4140317E7
        }
      }
    ]
  }
 }
}
```

以下示例使用 `holt` 模型。你可以通过 `alpha` 和 `beta` 设置来控制重要性衰减的速度。`alpha` 的默认值为 0.3，`beta` 的默认值为 0.1。你可以指定 0 到 1（含）之间的任意浮点值。

```json
GET opensearch_dashboards_sample_data_logs/_search
{
  "size": 0,
  "aggs": {
    "my_date_histogram": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "month"
      },
      "aggs": {
        "sum_of_bytes": {
          "sum": {
            "field": "bytes"
          }
        },
        "moving_avg_of_sum_of_bytes": {
          "moving_avg": {
            "buckets_path": "sum_of_bytes",
            "model": "holt",
            "settings": {
              "alpha": 0.6,
              "beta": 0.4
            }
          }
        }
      }
    }
  }
}
```

#### 示例响应 {#example-response-13}

```json
...
"aggregations" : {
  "my_date_histogram" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "sum_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "sum_of_bytes" : {
          "value" : 3.8880434E7
        },
        "moving_avg_of_sum_of_bytes" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "sum_of_bytes" : {
          "value" : 3.1445055E7
        },
        "moving_avg_of_sum_of_bytes" : {
          "value" : 2.70883404E7
        }
      }
    ]
  }
 }
}
```

## serial_diff {#serialdiff}

`serial_diff` 聚合是一种父管道聚合，用于计算前一个聚合中相隔一定时间滞后的桶之间的一系列值差。

你可以使用 `serial_diff` 聚合来求出不同时间段之间的数据变化，而不是求出整个值。

通过 `lag` 参数（一个非零正整数值），你可以指定要从当前桶中减去哪个之前的桶。如果没有指定 `lag` 参数，OpenSearch 会将其设置为 1。

假设某个城市的人口随时间增长。如果你使用周期为一天的序列差分聚合，就可以看到每天的增长量。例如，你可以计算总价的每周平均变化量的一系列差值。

```json
GET opensearch_dashboards_sample_data_logs/_search
{
   "size": 0,
   "aggs": {
      "my_date_histogram": {                  
         "date_histogram": {
            "field": "@timestamp",
            "calendar_interval": "month"
         },
         "aggs": {
            "the_sum": {
               "sum": {
                  "field": "bytes"     
               }
            },
            "thirtieth_difference": {
               "serial_diff": {                
                  "buckets_path": "the_sum",
                  "lag" : 30
               }
            }
         }
      }
   }
}
```

#### 示例响应 {#example-response-14}

```json
...
"aggregations" : {
  "my_date_histogram" : {
    "buckets" : [
      {
        "key_as_string" : "2020-10-01T00:00:00.000Z",
        "key" : 1601510400000,
        "doc_count" : 1635,
        "the_sum" : {
          "value" : 9400200.0
        }
      },
      {
        "key_as_string" : "2020-11-01T00:00:00.000Z",
        "key" : 1604188800000,
        "doc_count" : 6844,
        "the_sum" : {
          "value" : 3.8880434E7
        }
      },
      {
        "key_as_string" : "2020-12-01T00:00:00.000Z",
        "key" : 1606780800000,
        "doc_count" : 5595,
        "the_sum" : {
          "value" : 3.1445055E7
        }
      }
    ]
  }
 }
}
```
