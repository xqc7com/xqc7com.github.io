---
categories:
- 默认分类
date: '2025-01-17T15:37:00'
description: ''
draft: false
image: ''
slug: terminal-encode
tags:
- vs2022
- windows编码
- 终端编码
title: 命令行终端的编码
cover: /archives/terminal-encode/20250117151430544.png
---

## 编码设置

查看当前系统的编码，可以通过 cmd 命令行终端，运行 chcp 命令查看

![](/archives/terminal-encode/20250117151430544.png)

常见的有以下几种（ GBK 通常是中文系统的默认编码）

936 GBK

437 美国英语

65001 utf-8

对于中文系统来说，GBK 经常会导致一些终端窗口的乱码问题，可以设置全局的编码为 65001

打开注册表路径 `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Command Processor`

在当前位置增加一个 `autorun` 的项，值为 `chcp 65001`，表示每个终端启动的时候都会设置编码

![](/archives/terminal-encode/20250117152033355.png)

再次运行 cmd 终端，就会自动的设置编码为 65001 了，打印出 `Active code page: 65001` 的提示

![](/archives/terminal-encode/20250117152149235.png)

## VS控制台的编码错误

打开 `visual studio`， 通过菜单 “工具” -> “命令行” -> “开发者命令提示”

可以打开有着 vs 环境的终端窗口，对于 vs 的终端操作来说，有着巨大的方便

![](/archives/terminal-encode/20250117151349637.png)

但是，如果设置了上面 `chcp 65001` 的话，这里的终端窗口将会提示错误如下

![](/archives/terminal-encode/20250117152513869.png)

这就是前面设置了 65001 编导致的问题

那么要恢复正常，把上面的配置删除就可以了，删除后再次打开就显示正常了

![](/archives/terminal-encode/20250117153122035.png)
