---
title: Range
---

# Range 查询

你可以使用 `range` 查询在字段中搜索某个范围内的值。

要搜索 `line_id` 值 >= 10 且 <= 20 的文档（Document），请使用以下请求：

```json
GET shakespeare/_search
{
  "query": {
    "range": {
      "line_id": {
        "gte": 10,
        "lte": 20
      }
    }
  }
}
```

## 运算符

range 查询中的字段参数接受以下可选的运算符参数：

- `gte`：大于或等于
- `gt`：大于
- `lte`：小于或等于
- `lt`：小于

## 日期字段

你可以对包含日期的字段使用 range 查询。例如，假设你有一个 `products` 索引（Index），并希望查找 2019 年添加的所有产品：

```json
GET products/_search
{
  "query": {
    "range": {
      "created": {
        "gte": "2019/01/01",
        "lte": "2019/12/31"
      }
    }
  }
}
```

关于支持的日期格式的更多信息，请参阅[格式](/field-types/supported-field-types/date#formats)。

### 格式

要在查询中使用与字段映射格式不同的日期格式，请在 `format` 字段中指定该格式。

例如，如果 `products` 索引将 `created` 字段映射为 `strict_date_optional_time`，则可以按如下方式为查询日期指定不同的格式：

```json
GET /products/_search
{
  "query": {
    "range": {
      "created": {
        "gte": "01/01/2022",
        "lte": "31/12/2022",
        "format":"dd/MM/yyyy"
      }
    }
  }
}
```

### 缺失的日期部分

OpenSearch 会使用以下值填充缺失的日期部分：

- `MONTH_OF_YEAR`：`01`
- `DAY_OF_MONTH`：`01`
- `HOUR_OF_DAY`：`23`
- `MINUTE_OF_HOUR`：`59`
- `SECOND_OF_MINUTE`：`59`
- `NANO_OF_SECOND`：`999_999_999`

如果缺少年份，则不会填充年份。 

例如，以下请求在开始日期中只指定了年份：

```json
GET /products/_search
{
  "query": {
    "range": {
      "created": {
        "gte": "2022",
        "lte": "2022-12-31"
      }
    }
  }
}
```

开始日期会使用默认值填充，因此实际使用的 `gte` 参数为 `2022-01-01T23:59:59.999999999Z`。

### 相对日期

你可以使用[日期数学表达式](/field-types/supported-field-types/date#date-math)指定相对日期。

要从指定日期减去 1 年零 1 天，请使用以下查询：

```json
GET products/_search
{
  "query": {
    "range": {
      "created": {
        "gte": "2019/01/01||-1y-1d"
      }
    }
  }
}
```

在上面的示例中，`2019/01/01` 是日期数学表达式的锚定日期（起点）。在两个竖线字符（`||`）之后，指定相对于锚定日期的数学表达式。在此示例中，减去了 1 年（`-1y`）和 1 天（`-1d`）。 

你还可以在日期或时间单位后添加正斜杠，对日期进行舍入。

要查找过去一年内添加的产品（按月舍入），请使用以下查询：

```json
GET products/_search
{
  "query": {
    "range": {
      "created": {
        "gte": "now-1y/M"
      }
    }
  }
}
```

::: tip 提示
关键字 `now` 表示当前日期和时间。
:::

### 相对日期的舍入

下表说明了相对日期的舍入方式。

参数 | 舍入规则 | 示例：值 `2022-05-18||/M` 舍入后的结果
:--- | :--- | :---
`gt` | 向上舍入到不在舍入区间内的第一毫秒。 | `2022-06-01T00:00:00.000`
`gte` | 向下舍入到第一毫秒。 | `2022-05-01T00:00:00.000`
`lt` | 向下舍入到舍入后日期之前的最后一毫秒。 | `2022-04-30T23:59:59.999`
`lte` | 向上舍入到舍入区间内的最后一毫秒。 | `2022-05-31T23:59:59.999`

### 时区

默认情况下，日期被视为[协调世界时（UTC）](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)。如果在查询中指定了 `time_zone` 参数，则提供的日期值会被转换为 UTC。你可以将 `time_zone` 参数指定为 [UTC 偏移量](https://en.wikipedia.org/wiki/UTC_offset)（例如 `-04:00`），或 [IANA 时区 ID](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)（例如 `America/New_York`）。例如，以下查询指定查询中提供的 `gte` 日期位于 `-04:00` 时区：

```json
GET /products/_search
{
  "query": {
    "range": {
      "created": {
        "time_zone": "-04:00",        
        "gte": "2022-04-17T06:00:00" 
      }
    }
  }
}
```

上述查询中的 `gte` 参数会被转换为 `2022-04-17T10:00:00 UTC`，即 `2022-04-17T06:00:00-04:00` 对应的 UTC 时间。   

::: info 注意
`time_zone` 参数不会影响 `now` 值，因为 `now` 始终对应 UTC 的当前系统时间。
:::

## 参数

该查询接受字段名称（`<field>`）作为顶层参数：

```json
GET _search
{
  "query": {
    "range": {
      "<field>": {
        "gt": 10,
        ... 
      }
    }
  }
}
```

除了[运算符](#operators)之外，还可以为 `<field>` 指定以下可选参数。

参数 | 数据类型 | 描述
:--- | :--- | :---
`format` | String | 此查询中日期的[格式](/field-types/supported-field-types/date#formats)。默认值为字段的映射格式。
`relation` | String | 指示 range 查询如何匹配 [`range`](/field-types/supported-field-types/range) 字段的值。有效值为：<br> - `INTERSECTS`（默认）：匹配 `range` 字段值与查询中提供的范围相交的文档。  <br> - `CONTAINS`：匹配 `range` 字段值包含查询中提供的整个范围的文档。 <br> - `WITHIN`：匹配 `range` 字段值完全位于查询中提供的范围之内的文档。
`boost` | Floating-point | 按给定的倍数提升查询权重。适用于包含多个查询的搜索。[0, 1) 范围内的值会降低相关性，大于 1 的值会提高相关性。默认值为 `1`。 
`time_zone` | String | 在查询中将 [`date`](/field-types/supported-field-types/date) 值转换为 UTC 时所用的时区。有效值为 ISO 8601 [UTC 偏移量](https://en.wikipedia.org/wiki/List_of_UTC_offsets)和 [IANA 时区 ID](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)。更多信息，请参阅[时区](#time-zone)。

::: warning 重要
如果 [`search.allow_expensive_queries`](/query-dsl/#expensive-queries) 设置为 `false`，则不会运行针对 [`text`](/field-types/supported-field-types/text) 和 [`keyword`](/field-types/supported-field-types/keyword) 字段的 range 查询。
:::
