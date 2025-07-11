---
categories:
- 默认分类
date: '2025-06-22T16:32:30'
description: ''
draft: false
image: ''
slug: flutter-taste
tags:
- flutter
title: 跨平台开发flutter初体验
cover: /archives/flutter-taste/ip37yv.png
---

## 前言

flutter 是 google 出品的开源的跨平台解决方案，支持主流的桌面软件以及移动端软件开发，实现一套代码无痛构建迁移

支持 win、mac、linux 桌面端以及 android、ios 移动端，使用 dark 语言进行开发

社区非常活跃，截止目前为止，commit 超过 8.4w 多次，star 超过 17w，最后一次 commit 是 3 小时前

凭借 google 强大的实力支持，flutter 无疑是跨平台开发的首选

![20250622113043](/archives/flutter-taste/ip37yv.png)


## flutter开发包安装
flutter 的版本有很多， 在 github 上直接 clone 下载也是一样的，不过 github 上版本号太多了，可能会被搞懵了

可以在 `https://docs.flutter.dev/install/archive` 这里获取到具体平台最新的稳定版本进行下载

![20250622121659](/archives/flutter-taste/k4m9r5.png)

下载后解压到安装的目录下，比如 `d:/develop/flutter` 下，并将路径 `d:/develop/flutter/bin` 添加到环境变量 path 中

之后在终端窗口中输入 flutter，就可以识别 flutter 命令了

![20250622122617](/archives/flutter-taste/ka2xe5.png)

## 构建win桌面应用

为了体现 flutter 的强大，先来创建一个 windows 的应用，在构建之前，需要保证本地的 vs2022 可以正常使用

因为 flutter 构建的时候会生成一个 vs 的工程，然后再进行 windows 桌面应用的构建

其他构建工具链也是可以的，flutter 是基于 Makefile 的基础上进行构建的，主流的还是基于 vs2022 进行构建

在项目的路径下，执行 `flutter create demo01` 命令，创建 demo01 应用

![20250622151143](/archives/flutter-taste/ozxgml.png)

执行该命令后的目录结果如下，生成的代码有 android、ios、linux、macos、windows 平台的版本，此外还有 web 的版本

![20250622151533](/archives/flutter-taste/p29188.png)

切换到 demo01 目录下，执行 `flutter run` 然后选择 `1` windows 平台，生成并运行一个 windows 的客户端应用 

![20250622152222](/archives/flutter-taste/p6e7fq.png)

![20250622152303](/archives/flutter-taste/p6twh4.png)

## 安卓应用构建

为了构建 android 的应用，需要本地配置好 android 的环境，可以通过安装 android studio 然后在此基础上进行配置

主要是模拟器的安装，如果 path 环境变量没配的话 `emulator` 命令是不能识别的，可以在 emulator.exe 文件的路径下执行，或带路径执行

通过 `emulator -list-avds` 来查看当前可用的模拟器，然后使用 `emulator.exe -avd  Medium_Phone_API_35` 启动指定的安卓模拟器

![20250622153745](/archives/flutter-taste/pff64y.png)

在模拟器启动后，通过 `adb devices` 可以查看到可用的设备，使用 `flutter run` 编译并运行安卓应用

![20250622161913](/archives/flutter-taste/qs25a2.png)

模拟器运行安卓应用后，界面如下所示

![20250622162203](/archives/flutter-taste/qtrwmw.png)


## vscode插件安装

在 flutter 开发的时候，并不一定需要安装 vscode 的 flutter 以及 dart 插件

不过安装 flutter 以及 dart 插件可以提升开发效率，如智能提示、语法高亮、自动补全、调试支持等功能

在插件市场中搜索安装即可

![20250622114342](/archives/flutter-taste/iwtesf.png)


