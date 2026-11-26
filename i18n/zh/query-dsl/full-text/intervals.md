---
title: Intervals
---

# Intervals 查询

intervals 查询（Query）根据匹配词项的邻近程度和顺序来匹配文档（Document）。它对指定字段中包含的词项应用一组*匹配规则*。该查询会生成跨越文本中词项的最小区间序列。可以组合这些区间，并按父级来源对其进行过滤。

假设有一个索引（Index），其中包含以下文档：

```json
PUT testindex/_doc/1 
{
  "title": "key-value pairs are efficiently stored in a hash table"
}
```

```json
PUT /testindex/_doc/2
{
  "title": "store key-value pairs in a hash map"
}
```

例如，以下查询搜索包含短语 `key-value pairs`（词项之间没有间隔）且其后跟随 `hash table` 或 `hash map` 的文档：

```json
GET /testindex/_search
{
  "query": {
    "intervals": {
      "title": {
        "all_of": {
          "ordered": true,
          "intervals": [
            {
              "match": {
                "query": "key-value pairs",
                "max_gaps": 0,
                "ordered": true
              }
            },
            {
              "any_of": {
                "intervals": [
                  {
                    "match": {
                      "query": "hash table"
                    }
                  },
                  {
                    "match": {
                      "query": "hash map"
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    }
  }
}
```

该查询返回了两个文档：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 1011,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 0.25,
    "hits": [
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 0.25,
        "_source": {
          "title": "store key-value pairs in a hash map"
        }
      },
      {
        "_index": "testindex",
        "_id": "1",
        "_score": 0.14285713,
        "_source": {
          "title": "key-value pairs are efficiently stored in a hash table"
        }
      }
    ]
  }
}
```
</details>

## 参数

该查询接受字段名（`<field>`）作为顶级参数：

```json
GET _search
{
  "query": {
    "intervals": {
      "<field>": {
        ... 
      }
    }
  }
}
```

`<field>` 接受以下规则对象，这些规则对象用于根据词项、顺序和邻近程度来匹配文档。

规则 | 描述
:--- | :---
[`match`](#the-match-rule) | 匹配经过分析的文本。
[`prefix`](#the-prefix-rule) | 匹配以指定字符集开头的词项。
[`wildcard`](#the-wildcard-rule) | 使用通配符模式匹配词项。
[`fuzzy`](#the-fuzzy-rule) | 匹配与所提供词项在指定编辑距离内相似的词项。 
[`all_of`](#the-all_of-rule) | 使用合取（`AND`）组合多个规则。
[`any_of`](#the-any_of-rule) | 使用析取（`OR`）组合多个规则。

## `match` 规则

`match` 规则匹配经过分析的文本。下表列出了 `match` 规则支持的所有参数。

参数 | 必需/可选 | 数据类型 | 描述
:--- | :--- | :--- | :---
`query` | 必需 | String | 要搜索的文本。 
`analyzer` | 可选 | String | 用于分析 `query` 文本的[分析器](/analyzers/)（Analyzer）。默认值为 `<field>` 指定的分析器。
[`filter`](#the-filter-rule) | 可选 | Interval filter rule object |  用于过滤返回区间的规则。  
`max_gaps` | 可选 | Integer | 匹配词项之间允许的最大位置数。间隔超过 `max_gaps` 的词项不被视为匹配。如果未指定 `max_gaps` 或将其设置为 `-1`，则无论词项位置如何都视为匹配。如果 `max_gaps` 设置为 `0`，匹配的词项必须彼此相邻。默认值为 `-1`。
`ordered` | 可选 | Boolean | 指定匹配的词项是否必须按指定顺序出现。默认值为 `false`。
`use_field` | 可选 | String | 指定搜索该字段，而不是顶级 <field>。词项使用为该字段指定的搜索分析器进行分析。通过指定 `use_field`，可以像搜索同一个字段一样跨多个字段进行搜索。例如，如果将同一文本同时索引到经过词干提取和未经词干提取的字段中，就可以搜索与未提取词干的词元（Token）相邻的已提取词干的词元。 

## `prefix` 规则

`prefix` 规则匹配以指定字符集（前缀）开头的词项。前缀最多可扩展匹配 128 个词项。如果前缀匹配超过 128 个词项，则返回错误。下表列出了 `prefix` 规则支持的所有参数。

参数 | 必需/可选 | 数据类型 | 描述
:--- | :--- | :--- | :---
`prefix` | 必需 | String | 用于匹配词项的前缀。 
`analyzer` | 可选 | String | 用于规范化 `prefix` 的[分析器](/analyzers/)。默认值为 `<field>` 指定的分析器。
`use_field` | 可选 | String | 指定搜索该字段，而不是顶级 <field>。除非指定了 `analyzer`，否则 `prefix` 会使用为该字段指定的搜索分析器进行规范化。

## `wildcard` 规则

`wildcard` 规则使用通配符模式匹配词项。通配符模式最多可扩展匹配 128 个词项。如果该模式匹配超过 128 个词项，则返回错误。下表列出了 `wildcard` 规则支持的所有参数。

参数 | 必需/可选 | 数据类型 | 描述
:--- | :--- | :--- | :---
`pattern` | 必需 | String | 用于匹配词项的通配符模式。指定 `?` 匹配任意单个字符，指定 `*` 匹配零个或多个字符。
`analyzer` | 可选 | String | 用于规范化 `pattern` 的[分析器](/analyzers/)。默认值为 `<field>` 指定的分析器。
`use_field` | 可选 | String | 指定搜索该字段，而不是顶级 <field>。除非指定了 `analyzer`，否则 `prefix` 会使用为该字段指定的搜索分析器进行规范化。

::: warning 重要
指定以 `*` 或 `?` 开头的模式可能会降低搜索性能，因为这会增加匹配词项所需的迭代次数。
:::

## `fuzzy` 规则

`fuzzy` 规则匹配与所提供词项在指定编辑距离内相似的词项。模糊模式最多可扩展匹配 128 个词项。如果该模式匹配超过 128 个词项，则返回错误。下表列出了 `fuzzy` 规则支持的所有参数。

参数 | 必需/可选 | 数据类型 | 描述
:--- | :--- | :--- | :---
`term` | 必需 | String | 要匹配的词项。 
`analyzer` | 可选 | String | 用于规范化 `term` 的[分析器](/analyzers/)。默认值为 `<field>` 指定的分析器。
`fuzziness` | 可选 | String | 在判断词项是否与某个值匹配时，将一个单词变为另一个单词所需的字符编辑（插入、删除、替换）次数。例如，`wined` 与 `wind` 之间的距离为 1。有效值为非负整数或 `AUTO`。默认值 `AUTO` 会根据每个词项的长度选择一个值，适用于大多数使用场景。
`transpositions` | 可选 | Boolean | 将 `transpositions` 设置为 `true`（默认值）时，会在 `fuzziness` 选项的插入、删除和替换操作之外，增加相邻字符交换操作。例如，如果 `transpositions` 为 true，`wind` 与 `wnid` 之间的距离为 1（交换 "n" 和 "i"）；如果为 false，则距离为 2（删除 "n"，再插入 "n"）。如果 `transpositions` 为 `false`，`rewind` 和 `wnid` 与 `wind` 的距离相同（均为 2），尽管从人的角度来看，`wnid` 明显只是一个拼写错误。默认值适用于大多数使用场景。
`prefix_length`| 可选 | Integer | 模糊匹配时保持不变的开头字符数。默认值为 0。 
`use_field` | 可选 | String | 指定搜索该字段，而不是顶级 <field>。除非指定了 `analyzer`，否则 `term` 会使用为该字段指定的搜索分析器进行规范化。

## `all_of` 规则 {#the-allof-rule}

`all_of` 规则使用合取（`AND`）组合多个规则。下表列出了 `all_of` 规则支持的所有参数。

参数 | 必需/可选 | 数据类型 | 描述
:--- | :--- | :--- | :---
`intervals` | 必需 | Array of rule objects | 要组合的规则数组。文档必须匹配所有规则才能在结果中返回。 
[`filter`](#the-filter-rule) | 可选 | Interval filter rule object | 用于过滤返回区间的规则。 
`max_gaps` | 可选 | Integer | 匹配词项之间允许的最大位置数。间隔超过 `max_gaps` 的词项不被视为匹配。如果未指定 `max_gaps` 或将其设置为 `-1`，则无论词项位置如何都视为匹配。如果 `max_gaps` 设置为 `0`，匹配的词项必须彼此相邻。默认值为 `-1`。
`ordered` | 可选 | Boolean | 如果为 `true`，规则生成的区间应按指定顺序出现。默认值为 `false`。 

## `any_of` 规则 {#the-anyof-rule}

`any_of` 规则使用析取（`OR`）组合多个规则。下表列出了 `any_of` 规则支持的所有参数。

参数 | 必需/可选 | 数据类型 | 描述
:--- | :--- | :--- | :---
`intervals` | 必需 | Array of rule objects | 要组合的规则数组。文档必须至少匹配一个规则才能在结果中返回。 
[`filter`](#the-filter-rule) | 可选 | Interval filter rule object | 用于过滤返回区间的规则。 

## `filter` 规则

`filter` 规则用于限制结果。下表列出了 `filter` 规则支持的所有参数。

参数 | 必需/可选 | 数据类型 | 描述
:--- | :--- | :--- | :---
`after` | 可选 | Query object | 用于返回位于 filter 规则所指定区间之后的区间的查询。 
`before` | 可选 | Query object |  用于返回位于 filter 规则所指定区间之前的区间的查询。 
`contained_by` | 可选 | Query object |  用于返回被 filter 规则所指定区间包含的区间的查询。 
`containing` | 可选 | Query object |  用于返回包含 filter 规则所指定区间的区间的查询。 
`not_contained_by` | 可选 | Query object |  用于返回未被 filter 规则所指定区间包含的区间的查询。 
`not_containing` | 可选 | Query object |  用于返回不包含 filter 规则所指定区间的区间的查询。 
`not_overlapping` | 可选 | Query object |  用于返回与 filter 规则所指定区间不重叠的区间的查询。 
`overlapping` | 可选 | Query object |  用于返回与 filter 规则所指定区间重叠的区间的查询。 
`script` | 可选 | Script object |  用于匹配文档的脚本。该脚本必须返回 `true` 或 `false`。 

#### 示例：过滤器

以下查询搜索包含单词 `pairs` 和 `hash`、两者相距不超过五个位置且中间不包含单词 `efficiently` 的文档：

```json
POST /testindex/_search
{
  "query": {
    "intervals" : {
      "title" : {
        "match" : {
          "query" : "pairs hash",
          "max_gaps" : 5,
          "filter" : {
            "not_containing" : {
              "match" : {
                "query" : "efficiently"
              }
            }
          }
        }
      }
    }
  }
}
```

响应中只包含文档 2：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.25,
    "hits": [
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 0.25,
        "_source": {
          "title": "store key-value pairs in a hash map"
        }
      }
    ]
  }
}
```
</details>

#### 示例：脚本过滤器

此外，也可以使用以下变量编写自己的脚本过滤器，并将其包含在 `intervals` 查询中：

- `interval.start`：区间开始的位置（词项编号）。
- `interval.end`：区间结束的位置（词项编号）。
- `interval.gap`：词项之间的单词数。 

例如，以下查询在指定区间内搜索彼此相邻的单词 `map` 和 `hash`。词项从 0 开始编号，因此在文本 `store key-value pairs in a hash map` 中，`store` 位于位置 0，`key` 位于位置 `1`，依此类推。指定的区间应在 `a` 之后开始，并在字符串末尾之前结束：

```json
POST /testindex/_search
{
  "query": {
    "intervals" : {
      "title" : {
        "match" : {
          "query" : "map hash",
          "filter" : {
            "script" : {
              "source" : "interval.start > 5 && interval.end < 8 && interval.gaps == 0"
            }
          }
        }
      }
    }
  }
}
```

响应中包含文档 2：

<details markdown="block">
  <summary>
    响应
  </summary>

```json
{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.5,
    "hits": [
      {
        "_index": "testindex",
        "_id": "2",
        "_score": 0.5,
        "_source": {
          "title": "store key-value pairs in a hash map"
        }
      }
    ]
  }
}
```
</details>

## 区间最小化

为了确保查询以线性时间运行，`intervals` 查询会对区间进行最小化。例如，假设某个文档包含文本 `a b c d c`。可以使用以下查询搜索被 `a` 和 `c` 包含的 `d`：

```json
POST /testindex/_search
{
  "query": {
    "intervals" : {
      "my_text" : {
        "match" : {
          "query" : "d",
          "filter" : {
            "contained_by" : {
              "match" : {
                "query" : "a c"
              }
            }
          }
        }
      }
    }
  }
}
```

该查询不会返回任何结果，因为它匹配了前两个词项 `a c`，而在这两个词项之间找不到 `d`。
