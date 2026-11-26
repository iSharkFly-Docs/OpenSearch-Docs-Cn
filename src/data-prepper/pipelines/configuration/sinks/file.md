---
title: file
---

# file

Use the `file` sink to create a flat file output, usually a `.log` file.

## Configuration options

The following table describes options you can configure for the `file` sink.

Option | Required | Type | Description
:--- | :--- | :--- | :---
path | Yes | String | Path for the output file (e.g. `logs/my-transformed-log.log`).

## Usage

The following example shows basic usage of the `file` sink:

```
sample-pipeline:
  sink:
    - file:
        path: path/to/output-file
```
