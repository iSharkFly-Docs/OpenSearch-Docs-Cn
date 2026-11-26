---
title: Memory APIs
---

# Memory APIs
<Badge type="tip" text="Introduced 2.12" />

Memory APIs provide operations needed to implement [conversational search](/search-plugins/conversational-search). A memory stores conversation history for the current conversation. A message represents one question/answer interaction between the user and a large language model. Messages are organized into memories.

ML Commons supports the following memory-level APIs:

- [Create or update memory](/ml-commons-plugin/api/memory-apis/create-memory)
- [Get memory](/ml-commons-plugin/api/memory-apis/get-memory)
- [Search memory](/ml-commons-plugin/api/memory-apis/search-memory)
- [Delete memory](/ml-commons-plugin/api/memory-apis/delete-memory)

ML Commons supports the following message-level APIs:

- [Create or update message](/ml-commons-plugin/api/memory-apis/create-message)
- [Get message](/ml-commons-plugin/api/memory-apis/get-message)
- [Search message](/ml-commons-plugin/api/memory-apis/search-message)
- [Get message traces](/ml-commons-plugin/api/memory-apis/get-message-traces)

::: warning IMPORTANT
When the Security plugin is enabled, all memories exist in a `private` security mode. Only the user who created a memory can interact with that memory and its messages.
:::
