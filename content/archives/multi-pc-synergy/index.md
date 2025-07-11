---
categories:
- 默认分类
date: '2025-01-09T10:02:00'
description: ''
draft: false
image: ''
slug: multi-pc-synergy
tags:
- 工具使用
- synergy
- deskflow
title: 多台PC共用同一套鼠标键盘
cover: /archives/multi-pc-synergy/20250109094657554.png
---

当环境中有多个桌面 pc 需要操作的时候，在 多台 pc 之间切换会造成很多的不方便

可以通过远程进行连接，但是有一个更好的方案是让多台机器之间共用同一套键盘鼠标

常用的解决方案 synergy 和 sharemouse，通过移动光标在不同的 pc 间切换

synergy 的社区开源版本命名为 deskflow，仓库地址 https://github.com/deskflow/deskflow

仓库右侧的 release 可以下载对应的平台版本，支持 win、mac、linux等主流平台

![](/archives/multi-pc-synergy/20250109094657554.png)

deskflow 运行需要选一台作为 server 节点，其他节点作为 client

![](/archives/multi-pc-synergy/20250109093726599.png)

client 节点启动的时候，指定前面作为 server 节点的地址

![](/archives/multi-pc-synergy/20250109093811029.png)

在 server 的配置中可以发现，deskflow 支持多达 15 台桌面 pc 共用同一套键盘鼠标

通过拖动 client 节点，来调整其相对于 server 的位置来控制方向

server 节点通常位于所有中心的节点，比如上述的 server 配置显示

使用 pc 时，当鼠标在 server 节点上向左移动

在超出 server 的屏幕时，键盘鼠标就切换到了 client 节点上

![](/archives/multi-pc-synergy/20250109094048517.png)


配置之后，多桌面的操作就和平常使用没有任何差别了
