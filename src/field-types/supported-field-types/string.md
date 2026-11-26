---
title: String field types
---

# String field types

String field types contain text values or values derived from text. The following table lists all string field types that OpenSearch supports.

Field data type | Description
:--- | :---  
[`keyword`](/field-types/supported-field-types/keyword) | A string that is not analyzed. Useful for exact-value search.
[`text`](/field-types/supported-field-types/text) | A string that is analyzed. Useful for full-text search.
[`match_only_text`](/field-types/supported-field-types/match-only-text) | A space-optimized version of a `text` field.
[`token_count`](/field-types/supported-field-types/token-count)  | Counts the number of tokens in a string.
