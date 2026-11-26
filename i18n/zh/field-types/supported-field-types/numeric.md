---
title: 数值字段类型
---

# 数值字段类型

下表列出了 OpenSearch 支持的所有数值字段类型。

字段数据类型 | 描述  
:--- | :--- 
`byte` | 有符号 8 位整数。最小值为 &minus;128，最大值为 127。
`double` | 双精度 64 位 IEEE 754 浮点值。最小绝对值为 2<sup>&minus;1074 </sup>，最大绝对值为 (2 &minus; 2<sup>&minus;52</sup>) &middot; 2<sup>1023</sup>。有效位数为 53 位，有效数字为 15.95 位。
`float` | 单精度 32 位 IEEE 754 浮点值。最小绝对值为 2<sup>&minus;149 </sup>，最大绝对值为 (2 &minus; 2<sup>&minus;23</sup>) &middot; 2<sup>127</sup>。有效位数为 24 位，有效数字为 7.22 位。
`half_float` | 半精度 16 位 IEEE 754 浮点值。最小绝对值为 2<sup>&minus;24 </sup>，最大绝对值为 65504。有效位数为 11 位，有效数字为 3.31 位。
`integer` | 有符号 32 位整数。最小值为 &minus;2<sup>31</sup>，最大值为 2<sup>31</sup> &minus; 1。
`long` | 有符号 64 位整数。最小值为 &minus;2<sup>63</sup>，最大值为 2<sup>63</sup> &minus; 1。
[`unsigned_long`](/field-types/supported-field-types/unsigned-long) | 无符号 64 位整数。最小值为 0，最大值为 2<sup>64</sup> &minus; 1。
`short` | 有符号 16 位整数。最小值为 &minus;2<sup>15</sup>，最大值为 2<sup>15</sup> &minus; 1。 
[`scaled_float`](#scaled-float-field-type) | 一个浮点值，乘以 double 类型的缩放因子后以 long 值存储。

::: info 注意
integer、long、float 和 double 字段类型都有对应的[范围字段类型](/field-types/supported-field-types/range)。
:::

::: tip 提示
如果数值字段包含 ID 之类的标识符，可以将该字段映射为 [keyword](/field-types/supported-field-types/keyword)，以优化词项级查询（Term-level Query）的速度。如果还需要对该字段使用范围查询，可以在 keyword 字段类型之外，再将该字段映射为数值字段类型。
:::

## 示例

创建一个映射（Mapping），其中 integer_value 是一个 integer 字段：

```json
PUT testindex 
{
  "mappings" : {
    "properties" :  {
      "integer_value" : {
        "type" : "integer"
      }
    }
  }
}
```

索引一个包含整数值的文档（Document）：

```json
PUT testindex/_doc/1 
{
  "integer_value" : 123
}
```

## 缩放浮点字段类型

缩放浮点（scaled float）字段类型是一个浮点值，乘以缩放因子后以 long 值存储。它接受数值字段类型的所有可选参数，另外还有一个 scaling_factor 参数。创建缩放浮点字段时必须指定缩放因子。 

::: info 注意
缩放浮点有助于节省磁盘空间。scaling_factor 值越大，精度越高，但空间开销也越大。  
:::

## 缩放浮点示例

创建一个映射，其中 `scaled` 是一个 scaled_float 字段：

```json
PUT testindex 
{
  "mappings" : {
    "properties" :  {
      "scaled" : {
        "type" : "scaled_float",
        "scaling_factor" : 10
      }
    }
  }
}
```

索引一个包含 scaled_float 值的文档：

```json
PUT testindex/_doc/1 
{
  "scaled" : 2.3
}
```

`scaled` 值将存储为 23。

## 参数

下表列出了数值字段类型接受的参数。所有参数均为可选。

参数 | 描述 
:--- | :--- 
`boost` | 一个浮点值，指定该字段对相关性评分（Relevance Score）的权重。大于 1.0 的值会提高该字段的相关性，介于 0.0 和 1.0 之间的值会降低该字段的相关性。默认值为 1.0。
`coerce` | 一个布尔值，表示对整数值截断小数部分，并将字符串转换为数值。默认值为 `true`。
`doc_values` | 一个布尔值，指定是否将该字段存储到磁盘上，以便用于聚合、排序或脚本。默认值为 `true`。
`ignore_malformed` | 一个布尔值，指定忽略格式错误的值而不抛出异常。默认值为 `false`。
`index` | 一个布尔值，指定该字段是否可搜索。默认值为 `true`。 
`meta` | 接受该字段的元数据。
[`null_value`](/field-types/supported-field-types/#null-value) | 用于替代 `null` 的值，必须与字段类型相同。如果未指定此参数，当字段值为 `null` 时，该字段会被视为缺失。默认值为 `null`。
`store` | 一个布尔值，指定是否存储字段值，以便能独立于 _source 字段单独检索。默认值为 `false`。 

缩放浮点还有一个必需参数：`scaling_factor`。

参数 | 描述 
:--- | :--- 
`scaling_factor` | 一个 double 值，与字段值相乘后四舍五入为最接近的 long 值。必需。
