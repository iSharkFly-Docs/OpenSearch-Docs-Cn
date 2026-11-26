---
title: Create connector
---

# Create a connector

Creates a standalone connector. For more information, see [Connectors](/ml-commons-plugin/remote-models/connectors).

## Path and HTTP methods

```json
POST /_plugins/_ml/connectors/_create
```

## Request fields

For a list of request fields, see [Blueprint configuration parameters](/ml-commons-plugin/remote-models/blueprints#configuration-parameters).

#### Example request

To create a standalone connector, send a request to the `connectors/_create` endpoint and provide all of the parameters described in [Connector blueprints](/ml-commons-plugin/remote-models/blueprints):

```json
POST /_plugins/_ml/connectors/_create
{
    "name": "OpenAI Chat Connector",
    "description": "The connector to public OpenAI model service for GPT 3.5",
    "version": 1,
    "protocol": "http",
    "parameters": {
        "endpoint": "api.openai.com",
        "model": "gpt-3.5-turbo"
    },
    "credential": {
        "openAI_key": "..."
    },
    "actions": [
        {
            "action_type": "predict",
            "method": "POST",
            "url": "https://${parameters.endpoint}/v1/chat/completions",
            "headers": {
                "Authorization": "Bearer ${credential.openAI_key}"
            },
            "request_body": "{ \"model\": \"${parameters.model}\", \"messages\": ${parameters.messages} }"
        }
    ]
}
```

#### Example response

```json
{
  "connector_id": "a1eMb4kBJ1eYAeTMAljY"
}
```
