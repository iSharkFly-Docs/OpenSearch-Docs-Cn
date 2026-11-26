---
title: Windows
---

# 在 Windows 上运行 OpenSearch Dashboards

按照以下步骤在 Windows 上安装 OpenSearch Dashboards。

::: info 注意
确保已安装 zip 解压工具。
:::

1. 下载 [`opensearch-dashboards-2.12.0-windows-x64.zip`](https://artifacts.opensearch.org/releases/bundle/opensearch-dashboards/2.12.0/opensearch-dashboards-2.12.0-windows-x64.zip) 压缩包。

1. 要解压压缩包内容，请右键单击并选择 **Extract All**（全部解压缩）。
   
   **注意**：某些版本的 Windows 操作系统会限制文件路径长度。如果解压时遇到与路径长度相关的错误，请执行以下步骤启用长路径支持：

   1. 在任务栏 **Start**（开始）旁的搜索框中输入 `powershell`，打开 Powershell。
   1. 在 Powershell 中运行以下命令：
      ```bat
      Set-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem LongPathsEnabled -Type DWORD -Value 1 -Force
      ```
   1. 重启计算机。

1. 运行 OpenSearch Dashboards。

   有两种方式可以运行 OpenSearch Dashboards：

   1. 使用 Windows 图形界面运行批处理脚本：

      1. 进入 OpenSearch Dashboards 安装的顶层目录，打开 `opensearch-dashboards-2.12.0` 文件夹。
      1. 如有需要，修改 `config` 文件夹中的 `opensearch_dashboards.yml`，以更改 OpenSearch Dashboards 的默认设置。
      1. 打开 `bin` 文件夹，双击 `opensearch-dashboards.bat` 文件运行批处理脚本。这会打开一个命令提示符窗口，其中运行着一个 OpenSearch Dashboards 实例。

   1. 从命令提示符或 Powershell 运行批处理脚本：

      1. 在任务栏 **Start**（开始）旁的搜索框中输入 `cmd` 打开命令提示符，或输入 `powershell` 打开 Powershell。
      1. 切换到 OpenSearch Dashboards 安装的顶层目录。
         ```bat
         cd \path\to\opensearch-dashboards-2.12.0
         ```
      1. 如有需要，修改 `config\opensearch_dashboards.yml`。
      1. 运行批处理脚本以启动 OpenSearch Dashboards。
         ```bat
         .\bin\opensearch-dashboards.bat
         ```

::: tip 提示
要停止 OpenSearch Dashboards，请在命令提示符或 Powershell 中按 `Ctrl+C`，或者直接关闭命令提示符或 Powershell 窗口。
:::
