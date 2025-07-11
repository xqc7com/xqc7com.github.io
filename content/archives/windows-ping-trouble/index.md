---
categories:
- 默认分类
date: '2025-01-11T13:50:00'
description: ''
draft: false
image: ''
slug: windows-ping-trouble
tags:
- windows
title: win10解决ping不通的问题
cover: /archives/windows-ping-trouble/20250111133613390.png
---

有时候 ping 一台目标机器为 win10 的时候，会出现 ping 不通的情况

因为 win10 默认没有开启 ICMP 回显，这个问题遇到好多次了，记录一下

在 “设置” 中选择 “更新和安全”

![](/archives/windows-ping-trouble/20250111133613390.png)

选择左侧的 “windows安全中心”，点击 “防火墙和网络保护”

![](/archives/windows-ping-trouble/20250111133744728.png)

在 “防火墙和网络保护” 页面点击 “高级设置”

![](/archives/windows-ping-trouble/20250111133833798.png)

打开 windows 防火墙的高级设置，左侧选中 “入站规则”，将下面这两个规则右键启用

![](/archives/windows-ping-trouble/20250111133943442.png)
