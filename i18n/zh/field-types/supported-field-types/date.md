---
title: Date
---

# Date 字段类型

在 OpenSearch 中，日期可以用以下任意一种形式表示：

- 一个 long 值，对应自纪元（epoch）以来的毫秒数（该值必须为非负数）。日期在内部以这种形式存储。
- 一个格式化的字符串。
- 一个整数值，对应自纪元以来的秒数（该值必须为非负数）。

::: info 注意
如需表示日期范围，可以使用日期[范围字段类型](/field-types/supported-field-types/range)。
:::

## 示例

创建一个包含日期字段和两种日期格式的映射（Mapping）：

```json
PUT testindex
{
  "mappings" : {
    "properties" :  {
      "release_date" : {
        "type" : "date",
        "format" : "strict_date_optional_time||epoch_millis"
      }
    }
  }
}
```

## 参数

下表列出了日期字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`boost` | 一个浮点值，指定该字段对相关性评分（Relevance Score）的权重。大于 1.0 的值会提高该字段的相关性，介于 0.0 和 1.0 之间的值会降低该字段的相关性。默认值为 1.0。
`doc_values` | 一个布尔值，指定是否将该字段存储到磁盘上，以便用于聚合、排序或脚本。默认值为 `false`。
`format` | 用于解析日期的格式。默认值为 `strict_date_time_no_millis||strict_date_optional_time||epoch_millis`。
`ignore_malformed` | 一个布尔值，指定忽略格式错误的值而不抛出异常。默认值为 `false`。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。
`locale` | 一种与地区和语言相关的日期表示方式。默认值为 [`ROOT`](https://docs.oracle.com/javase/8/docs/api/java/util/Locale.html#ROOT)（与地区和语言无关的区域设置）。
`meta` | 接受该字段的元数据。
[`null_value`](/field-types/supported-field-types/#null-value) | 用于替代 `null` 的值，必须与字段类型相同。如果未指定此参数，当字段值为 `null` 时，该字段会被视为缺失。默认值为 `null`。
`store` | 一个布尔值，指定是否存储字段值，以便能独立于 _source 字段单独检索。默认值为 `false`。 

## 格式

OpenSearch 内置了多种日期格式，也可以创建自定义格式。可以指定多个日期格式，用 `||` 分隔。

## 默认格式

从 OpenSearch 2.12 开始，默认日期格式为 `strict_date_time_no_millis||strict_date_optional_time||epoch_millis`。如需将默认格式恢复为 `strict_date_optional_time||epoch_millis`（OpenSearch 2.11 及更早版本的默认格式），请将 `opensearch.experimental.optimization.datetime_formatter_caching.enabled` 功能标志设置为 `false`。有关启用和禁用功能标志的更多信息，请参阅[启用实验性功能](/install-and-configure/configuring-opensearch/experimental)。

## 内置格式

大多数日期格式都有一个对应的 `strict_` 版本。当格式以 `strict_` 开头时，日期的位数必须与格式中指定的位数完全一致。例如，如果格式设置为 `strict_year_month_day`（`"yyyy-MM-dd"`），则月和日都必须是两位数字。因此，`"2020-06-09"` 是有效的，而 `"2020-6-9"` 是无效的。

::: info 注意
纪元（epoch）定义为 1970 年 1 月 1 日 00:00:00 UTC。
:::

::: info 注意
y：年<br>
Y：[基于周的年份](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)<br>
M：月<br>
w：[一年中的第几周](https://en.wikipedia.org/wiki/ISO_8601#Week_dates)，从 01 到 53<br> 
d：日<br>
D：一年中的第几天，从 001 到 365（闰年为 366）<br>
e：一周中的第几天，从 1（星期一）到 7（星期日）<br>
H：小时，从 0 到 23<br>
m：分钟<br>
s：秒<br>
S：秒的小数部分<br>
Z：时区偏移（例如 +0400、-0400、-04:00）<br>
:::

### 数值日期格式

格式名称及描述 | 示例
:--- | :---
`epoch_millis` <br> 自纪元以来的毫秒数。最小值为 -2<sup>63</sup>，最大值为 2<sup>63</sup> &minus; 1。 | 1553391286000
`epoch_second` <br> 自纪元以来的秒数。最小值为 -2<sup>63</sup> &divide; 1000，最大值为 (2<sup>63</sup> &minus; 1) &divide; 1000。 | 1553391286

### 基本日期格式

基本日期格式的各组成部分之间没有分隔符。例如 "20190323"。

格式名称及描述 | 模式及示例
:--- | :---
**日期**| 
`basic_date_time` <br> 以 `T` 分隔的基本日期和时间。 | `"yyyyMMdd`T`HHmmss.SSSZ"`<br>`"20190323T213446.123-04:00"`
`basic_date_time_no_millis` <br> 不含毫秒、以 `T` 分隔的基本日期和时间。 | `"yyyyMMdd`T`HHmmssZ"`<br>`"20190323T213446-04:00"`
`basic_date` <br> 由四位数年份、两位数月份和两位数日期组成的日期。 | `"yyyyMMdd"<br>"20190323"` 
**时间** |
`basic_time` <br> 由两位数小时、两位数分钟、两位数秒、三位数毫秒和时区偏移组成的时间。 |`"HHmmss.SSSZ"` <br> `"213446.123-04:00"`
`basic_time_no_millis` <br> 不含毫秒的基本时间。 | `"HHmmssZ"` <br> `"213446-04:00"`
**T 时间** | 
`basic_t_time` <br> 以 `T` 开头的基本时间。 | `"`T`HHmmss.SSSZ"` <br> `"T213446.123-04:00"`
`basic_t_time_no_millis` <br> 不含毫秒、以 `T` 开头的基本时间。 | `"`T`HHmmssZ"` <br> `"T213446-04:00"`
**序数日期** |
`basic_ordinal_date_time` <br> 完整的序数日期和时间。 | `"yyyyDDD`T`HHmmss.SSSZ"`<br>`"2019082T213446.123-04:00"`
`basic_ordinal_date_time_no_millis` <br> 不含毫秒的完整序数日期和时间。 | `"yyyyDDD`T`HHmmssZ"`<br>`"2019082T213446-04:00"`
`basic_ordinal_date` <br> 由四位数年份和三位数的年内序数日组成的日期。 | `"yyyyDDD"` <br> `"2019082"`
**基于周的日期** | 
`basic_week_date_time` <br> `strict_basic_week_date_time` <br> 以 `T` 分隔的完整的基于周的日期和时间。 | `"YYYY`W`wwe`T`HHmmss.SSSZ"` <br> `"2019W126213446.123-04:00"`
`basic_week_date_time_no_millis` <br> `strict_basic_week_date_time_no_millis` <br> 不含毫秒、以 `T` 分隔的基本的基于周的年份日期和时间。 | `"YYYY`W`wwe`T`HHmmssZ"` <br> "2019W126213446-04:00"
`basic_week_date` <br> `strict_basic_week_date` <br> 完整的基于周的日期，由四位数的基于周的年份、两位数的年内序数周和一位数的周内序数日组成，以 `W` 分隔。 | `"YYYY`W`wwe"` <br> `"2019W126"`

### 完整日期格式

完整日期格式的各组成部分中，日期使用 `-` 分隔，时间使用 `:` 分隔。例如 `"2019-03-23T21:34"`。

格式名称及描述 | 模式及示例
:--- | :---
**日期** |
`date_optional_time`<br>`strict_date_optional_time` <br> 通用的完整日期和时间。年份必需，月、日和时间可选。时间与日期之间以 `T` 分隔。 | 多种模式。<br>`"2019--03--23T21:34:46.123456789--04:00"` <br> `"2019-03-23T21:34:46"` <br> `"2019-03-23T21:34"` <br> `"2019"`
`strict_date_optional_time_nanos` <br>通用的完整日期和时间。年份必需，月、日和时间可选。如果指定了时间，则必须包含小时、分钟和秒，秒的小数部分可选。秒的小数部分为一到九位数，精度为纳秒。时间与日期之间以 `T` 分隔。 | 多种模式。<br> `"2019-03-23T21:34:46.123456789-04:00"` <br> `"2019-03-23T21:34:46"` <br> `"2019"` 
`date_time` <br> `strict_date_time` <br> 以 `T` 分隔的完整日期和时间。 | `"yyyy-MM-dd`T`HH:mm:ss.SSSZ"` <br> `"2019-03-23T21:34:46.123-04:00"`
`date_time_no_millis` <br> `strict_date_time_no_millis` <br> 不含毫秒、以 `T` 分隔的完整日期和时间。 | `"yyyy-MM-dd'T'HH:mm:ssZ"` <br> `"2019-03-23T21:34:46-04:00"` 
`date_hour_minute_second_fraction` <br> `strict_date_hour_minute_second_fraction` <br> 由完整日期、两位数小时、两位数分钟、两位数秒和一到九位数的秒小数部分组成，以 `T` 分隔。 | `"yyyy-MM-dd`T`HH:mm:ss.SSSSSSSSS"`<br>`"2019-03-23T21:34:46.123456789"` <br> `"2019-03-23T21:34:46.1"`
`date_hour_minute_second_millis` <br> `strict_date_hour_minute_second_millis` <br> 由完整日期、两位数小时、两位数分钟、两位数秒和三位数毫秒组成，以 `T` 分隔。 | `"yyyy-MM-dd`T`HH:mm:ss.SSS"` <br> `"2019-03-23T21:34:46.123"` 
`date_hour_minute_second` <br> `strict_date_hour_minute_second` <br> 由完整日期、两位数小时、两位数分钟和两位数秒组成，以 `T` 分隔。| `"yyyy-MM-dd`T`HH:mm:ss"`<br>`"2019-03-23T21:34:46"`
`date_hour_minute` <br> `strict_date_hour_minute` <br> 由完整日期、两位数小时和两位数分钟组成。 | `"yyyy-MM-dd`T`HH:mm"` <br> `"2019-03-23T21:34"`
`date_hour` <br> `strict_date_hour` <br> 由完整日期和两位数小时组成，以 `T` 分隔。 | `"yyyy-MM-dd`T`HH"` <br> `"2019-03-23T21"` 
`date` <br> `strict_date` <br> 由四位数年份、两位数月份和两位数日期组成。 | `"yyyy-MM-dd"` <br> `"2019-03-23"` 
`year_month_day` <br> `strict_year_month_day` <br> 由四位数年份、两位数月份和两位数日期组成。 | `"yyyy-MM-dd"` <br> `"2019-03-23"` 
`year_month` <br> `strict_year_month` <br> 由四位数年份和两位数月份组成。 | `"yyyy-MM"` <br> `"2019-03"` 
`year` <br> `strict_year` <br> 四位数年份。 | `"yyyy"` <br> `"2019"` 
`rfc3339_lenient` <br>一个兼容 RFC3339 的 DateTimeFormatter，比 `strict_date_optional_time` 等其他宽松的完整日期格式快得多 | `"YYYY"` <br> `"2019"` <br> `"YYYY-MM"` <br> `"2019-03"` <br> `"YYYY-MM-DD"` <br> `"2019-03-23"` <br> `"YYYY-MM-DDThh:mmTZD"` <br> `"2019-03-23T21:34Z"` <br> `"YYYY-MM-DDThh:mm:ssTZD"` <br> `"2019-03-23T21:34:46Z"` <br> `"YYYY-MM-DDThh:mm:ss.sTZD"` <br> `"2019-03-23T21:34:46.123456789-04:00"` <br> `"YYYY-MM-DDThh:mm:ss,sTZD"` <br> `"2019-03-23T21:34:46,123456789-04:00"`
**时间** | 
`time` <br> `strict_time` <br> 由两位数小时、两位数分钟、两位数秒、一到九位数的秒小数部分和时区偏移组成。 | `"HH:mm:ss.SSSSSSSSSZ"` <br> `"21:34:46.123456789-04:00"` <br> `"21:34:46.1-04:00"`
`time_no_millis` <br> `strict_time_no_millis` <br> 由两位数小时、两位数分钟、两位数秒和时区偏移组成。 | `"HH:mm:ssZ"` <br> `"21:34:46-04:00"` 
`hour_minute_second_fraction` <br> `strict_hour_minute_second_fraction` <br> 由两位数小时、两位数分钟、两位数秒和一到九位数的秒小数部分组成。 | `"HH:mm:ss.SSSSSSSSS"` <br> `"21:34:46.1"` <br> `"21:34:46.123456789"` 
`hour_minute_second_millis` <br> `strict_hour_minute_second_millis` <br> 由两位数小时、两位数分钟、两位数秒和三位数毫秒组成。 | `"HH:mm:ss.SSS"` <br> `"21:34:46.123"` 
`hour_minute_second` <br> `strict_hour_minute_second` <br> 由两位数小时、两位数分钟和两位数秒组成。 | `"HH:mm:ss"` <br> `"21:34:46"` 
`hour_minute` <br> `strict_hour_minute` <br> 由两位数小时和两位数分钟组成。 | `"HH:mm"` <br> `"21:34"` 
`hour` <br> `strict_hour` <br> 两位数小时。 | `"HH"` <br> `"21"` 
**T 时间** |
`t_time` <br> `strict_t_time` <br> 由两位数小时、两位数分钟、两位数秒、一到九位数的秒小数部分和时区偏移组成，以 `T` 开头。 | `"`T`HH:mm:ss.SSSSSSSSSZ"<br>"T21:34:46.123456789-04:00"` <br> `"T21:34:46.1-04:00"`
`t_time_no_millis` <br> `strict_t_time_no_millis` <br> 由两位数小时、两位数分钟、两位数秒和时区偏移组成，以 `T` 开头。 | `"`T`HH:mm:ssZ"` <br> `"T21:34:46-04:00"`
**序数日期** |
`ordinal_date_time` <br> `strict_ordinal_date_time` <br> 以 `T` 分隔的完整序数日期和时间。 | `"yyyy-DDD`T`HH:mm:ss.SSSZ"` <br> `"2019-082T21:34:46.123-04:00"` 
`ordinal_date_time_no_millis` <br> `strict_ordinal_date_time_no_millis` <br> 不含毫秒、以 `T` 分隔的完整序数日期和时间。 | `"yyyy-DDD`T`HH:mm:ssZ"` <br> `"2019-082T21:34:46-04:00"`
`ordinal_date` <br> `strict_ordinal_date`<br> 由四位数年份和三位数的年内序数日组成的完整序数日期。 | `"yyyy-DDD"` <br> `"2019-082"`
**基于周的日期** |
`week_date_time` <br> `strict_week_date_time` <br> 以 `T` 分隔的完整的基于周的日期和时间。周日期由四位数的基于周的年份、两位数的年内序数周和一位数的周内序数日组成。时间由两位数小时、两位数分钟、两位数秒、一到九位数的秒小数部分和时区偏移组成。 | `"YYYY-`W`ww-e`T`HH:mm:ss.SSSSSSSSSZ"` <br> `"2019-W12-6T21:34:46.1-04:00"` <br> `"2019-W12-6T21:34:46.123456789-04:00"`
`week_date_time_no_millis` <br> `strict_week_date_time_no_millis` <br> 不含毫秒、以 `T` 分隔的完整的基于周的日期和时间。周日期由四位数的基于周的年份、两位数的年内序数周和一位数的周内序数日组成。时间由两位数小时、两位数分钟、两位数秒和时区偏移组成。 | `"YYYY-`W`ww-e`T`HH:mm:ssZ"` <br> `"2019-W12-6T21:34:46-04:00"`
`week_date` <br> `strict_week_date` <br> 完整的基于周的日期，由四位数的基于周的年份、两位数的年内序数周和一位数的周内序数日组成。 | `"YYYY-`W`ww-e"` <br> `"2019-W12-6"`
`weekyear_week_day` <br> `strict_weekyear_week_day` <br> 由四位数的基于周的年份、两位数的年内序数周和一位数的周内日组成。 | `"YYYY-'W'ww-e"` <br> `"2019-W12-6"` 
`weekyear_week` <br> `strict_weekyear_week` <br> 由四位数的基于周的年份和两位数的年内序数周组成。 | `"YYYY-`W`ww"` <br> `"2019-W12"` 
`weekyear` <br> `strict_weekyear` <br> 四位数的基于周的年份。 | `"YYYY"` <br> `"2019"` 

## 自定义格式

可以为日期字段创建自定义格式。例如，以下请求以常见的 `"MM/dd/yyyy"` 格式指定日期：

```json
PUT testindex
{
  "mappings" : {
    "properties" :  {
      "release_date" : {
        "type" : "date",
        "format" : "MM/dd/yyyy"
      }
    }
  }
}
```

索引一个包含日期的文档（Document）：

```json
PUT testindex/_doc/21 
{
  "release_date" : "03/21/2019"
}
```

搜索精确日期时，需以相同格式提供该日期：

```json
GET testindex/_search
{
  "query" : {
    "match": {
      "release_date" : {
        "query": "03/21/2019"
      }
    }
  }
}
```

范围查询默认使用字段映射中的格式。也可以通过提供 `format` 参数，以不同的格式指定日期范围：

```json
GET testindex/_search
{
  "query": {
    "range": {
      "release_date": {
        "gte": "2019-01-01",
        "lte": "2019-12-31",
        "format": "yyyy-MM-dd"
      }
    }
  }
}
```

## 日期计算

日期字段类型支持在查询（Query）中使用日期计算（date math）来指定时间段。例如，[range 查询](/query-dsl/term/range)中的 `gt`、`gte`、`lt` 和 `lte` 参数，以及[日期范围聚合](/aggregations/bucket/date-range)中的 `from` 和 `to` 参数，都接受日期计算表达式。

日期计算表达式包含一个固定日期，后面可以跟一个或多个数学表达式。固定日期可以是 `now`（当前日期和时间，以自纪元以来的毫秒数表示），也可以是以 `||` 结尾的日期字符串（例如 `2022-05-18||`）。该日期必须采用[默认格式](#default-format)（默认为 `strict_date_time_no_millis||strict_date_optional_time||epoch_millis`）。

::: info 注意
如果在字段映射中指定了多个日期格式，OpenSearch 会使用第一个格式将自纪元以来的毫秒值转换为字符串。<br>
如果字段映射中没有指定格式，OpenSearch 会使用 `strict_date_optional_time` 格式将纪元值转换为字符串。
:::

日期计算支持以下数学运算符。

运算符 | 描述 | 示例
:--- | :--- | :---
`+` | 加法 | `+1M`：加 1 个月。
`-` | 减法 | `-1y`：减 1 年。
`/` | 向下取整 | `/h`：取整到该小时的开始。

日期计算支持以下时间单位：

::: info 注意
`y`：年<br>
`M`：月<br>
`w`：周<br>
`d`：天<br>
`h` 或 `H`：小时<br>
`m`：分钟<br>
`s`：秒
:::

### 表达式示例

以下示例表达式演示了日期计算的用法：

- `now+1M`：当前日期和时间（以自纪元以来的毫秒数表示）加 1 个月。
- `2022-05-18||/M`：`05/18/2022`，取整到该月的开始。解析结果为 `2022-05-01`。
- `2022-05-18T15:23||/h`：`05/18/2022` 的 `15:23`，取整到该小时的开始。解析结果为 `2022-05-18T15`。
- `2022-05-18T15:23:17.789||+2M-1d/d`：`05/18/2022` 的 `15:23:17.789` 加 2 个月再减 1 天，取整到当天的开始。解析结果为 `2022-07-17`。

### 在 range 查询中使用日期计算

以下示例演示了如何在 [range 查询](/query-dsl/term/range)中使用日期计算。

创建一个索引，将 `release_date` 映射为 `date`：

```json
PUT testindex 
{
  "mappings" : {
    "properties" :  {
      "release_date" : {
        "type" : "date"
      }
    }
  }
}
```

向该索引中索引两个文档：

```json
PUT testindex/_doc/1
{
  "release_date": "2022-09-14"
}
```

```json
PUT testindex/_doc/2
{
  "release_date": "2022-11-15"
}
```

以下查询搜索 `release_date` 在 `09/14/2022` 之后 2 个月零 1 天之内的文档。范围的下限会取整到 `09/14/2022` 当天的开始：

```json
GET testindex/_search
{
  "query": {
    "range": {
      "release_date": {
        "gte": "2022-09-14T15:23||/d",
        "lte": "2022-09-14||+2M+1d"
      }
    }
  }
}
```

响应包含这两个文档：

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
      "value" : 2,
      "relation" : "eq"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "testindex",
        "_id" : "2",
        "_score" : 1.0,
        "_source" : {
          "release_date" : "2022-11-14"
        }
      },
      {
        "_index" : "testindex",
        "_id" : "1",
        "_score" : 1.0,
        "_source" : {
          "release_date" : "2022-09-14"
        }
      }
    ]
  }
}
```
