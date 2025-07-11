---
categories:
- 默认分类
date: '2025-01-11T15:35:00'
description: ''
draft: false
image: ''
slug: trunoff-windows-update
tags:
- windows
title: 关闭windows系统的自动更新
cover: /archives/trunoff-windows-update/20250111141257500.png
---

windows 有一个体验很糟糕的问题，就是经常会进行系统自动更新

特别是一些旧机器上更新大概率会出现失败的情况，极端情况下无法进行回滚

windows 自动更新这个问题遇到了好多次，这里记录下怎么关闭

## 关闭Windows Update服务
在桌面 “我的电脑” 右键菜单，然后选择 “管理”，出现下面的窗口

定位到 “服务” 菜单项，选择右边的项 “Windows Update” 然后右键 “属性”

![](/archives/trunoff-windows-update/20250111141257500.png)

在常规标签页中，将启动类型设置为 “禁用”

![](/archives/trunoff-windows-update/20250111141553389.png)

在恢复标签页中，将失败的后续操作设置为 “无操作”

![](/archives/trunoff-windows-update/20250111141701280.png)

## 本地组策略设置

按 `Windows + R` 然后输入 gpedit.msc 运行，打开 “本地组策略编辑器”

依次单击左边的菜单 “计算机配置” -> “管理模板” -> “Windows组件” -> “Windows更新”

然后在右边找到 “配置自动更新” ，双击打开配置窗口，设置为 “已禁用” 然后确定

![](/archives/trunoff-windows-update/20250111143414443.png)

![](/archives/trunoff-windows-update/20250111143526767.png)

在下方找到 “删除使用所有 Windows 更新功能的访问权限”，双击打开配置窗口，设置为 “已启用” 然后确定

![](/archives/trunoff-windows-update/20250111143620958.png)

![](/archives/trunoff-windows-update/20250111152111431.png)
