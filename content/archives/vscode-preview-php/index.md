---
categories:
- 默认分类
date: '2025-01-17T15:22:00'
description: ''
draft: false
image: ''
slug: vscode-preview-php
tags:
- php
- vscode
- live server
title: vscode支持实时预览php代码
cover: /archives/vscode-preview-php/20250117170358334.png
---

## vscode预览静态页面

如果是开发静态的页面，使用 vscode 的 Live Server 插件就可以了，在 vscode 的插件管理中下载

插件安装后，不需要配置，打开html文件，右键点击 `Open with live Server` 即可在浏览器中进行预览了

![](/archives/vscode-preview-php/20250117170358334.png)

另外一种启动方式可以在 vscode 的右下角，点击 Go Live 也可以同样启动预览 

![](/archives/vscode-preview-php/20250117170433526.png)

![](/archives/vscode-preview-php/20250117170451020.png)


## vscode预览php动态页面

### 下载php版本包 

如果本地没有安装 php 解析器，那么需要先提前下载安装好

php 的版本包可以到官网下载 https://windows.php.net/download

下载后解压到某路径下，如 d:\software\php-8.2.7-Win32-vs16-x64 目录下

静态页面不需要额外的解析器，页面在浏览器中就可以渲染看到效果了

但浏览器不能执行 php 代码，必须要 php 解析器执行之后，再交给浏览器进行渲染

### 安装php server插件

预览 php 代码不需要使用上述的 Live Server 插件，这里使用的是 php server 插件

在vscode的插件中心进行搜索安装，插件信息如下

![](/archives/vscode-preview-php/20250117170631484.png)

插件安装后，在vscode的settings.json中配置 php 解析器信息，比如我这里配置

```
"php.validate.executablePath": "d:\\software\\php-8.2.7-Win32-vs16-x64\\php.exe"
```

### 预览php代码文件

设置完之后，在 vscode 中打开 php 的工程

打开 php 代码文件，右键菜单选择 “PHP Server: Serve project”，就可在浏览器中显示了

![](/archives/vscode-preview-php/20250117170742788.png)
