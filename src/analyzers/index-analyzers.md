---
title: Index analyzers
---

# Index analyzers

Index analyzers are specified at indexing time and are used to analyze [text](/field-types/supported-field-types/text) fields when indexing a document.

## Determining which index analyzer to use

To determine which analyzer to use for a field when a document is indexed, OpenSearch examines the following parameters in order:

1. The `analyzer` mapping parameter of the field
1. The `analysis.analyzer.default` index setting
1. The `standard` analyzer (default)

::: warning IMPORTANT
When specifying an index analyzer, keep in mind that in most cases, specifying an analyzer for each `text` field in an index works best. Analyzing both the text field (at indexing time) and the query string (at query time) with the same analyzer ensures that the search uses the same terms as those that are stored in the index. 
:::

For information about verifying which analyzer is associated with which field, see [Verifying analyzer settings](/analyzers/#verifying-analyzer-settings).

## Specifying an index analyzer for a field

When creating index mappings, you can supply the `analyzer` parameter for each [text](/field-types/supported-field-types/text) field. For example, the following request specifies the `simple` analyzer for the `text_entry` field:

```json
PUT testindex
{
  "mappings": {
    "properties": {
      "text_entry": {
        "type": "text",
        "analyzer": "simple"
      }
    }
  }
}
```

## Specifying a default index analyzer for an index

If you want to use the same analyzer for all text fields in an index, you can specify it in the `analysis.analyzer.default` setting as follows:

```json
PUT testindex
{
  "settings": {
    "analysis": {
      "analyzer": {
        "default": {
          "type": "simple"
        }
      }
    }
  }
}
```

::: info NOTE
If you don't specify a default analyzer, the `standard` analyzer is used.
:::
