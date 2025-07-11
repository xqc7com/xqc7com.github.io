---
categories:
- 默认分类
date: '2025-06-07T17:25:42'
description: ''
draft: false
image: ''
slug: idabindiff
tags:
- ida
title: 基于IDA的bindiff使用
cover: /archives/idabindiff/gxbwoq.png
---

## 前言

需要逆向的二进制使用静态链接的方式打包了 cryptopp 库，需要还原 cryptopp 的符号，但是不知道具体版本号

这里使用 bindiff 从已发布的 cryptopp 库中恢复函数符号

## 版本安装

逆向这里使用的 IDA 为 7.5 的版本，解压后使用 idapyswitch 指定 IDA 使用自身目录下的 python 版本

cmd 到 IDA 的安装目录，使用命令切换 `idapyswitch --force-path python38/python3.dll`

启动 IDA 后，在左下角这里可以看到 python ，说明 python 环境已经配置好了

![20250607102340](/archives/idabindiff/gxbwoq.png)

bindiff 为  google 开发的用于对比二进制的，可以使用图形界面，也可以在 IDA 中使用，github 开源地址 `https://github.com/google/bindiff`

bindiff 基于 JAVA 开发，如果需要使用 bindiff 的图形界面需要配置好 JAVA 版本

bindiff 在 IDA 下使用有两个版本，IDA8 版本需要安装 bindiff8，IDA7 版本需要安装 bindiff7

在 win 中下载对应版本的 msi 包并安装后，将下面的 4 个插件动态库拷贝到 IDA 的 plugins 目录下

![20250607103255](/archives/idabindiff/h2s0dm.png)

重新启动 IDA 后，在 Edit -> Plugins 菜单下就能看到 BinDiff 的菜单了，说明插件已经配置好了

![20250607103634](/archives/idabindiff/h51a9o.png)

## 库文件对比

官方的库下载地址在 https://cryptopp.com/index.html#download， 这里下载最新的 cryptopp890 进行分析

下载后解压使用 vs2022 打开然后编译 DLL （待逆向的二进制文件是静态链接的，这里编译 DLL 不影响分析）

![20250607154205](/archives/idabindiff/pi4q42.png)

编译该 DLL 后，使用 IDA 打开该 DLL 文件，然后退出 IDA 进行保存，这时候会生成一个 cryptopp.dll.i64 文件

使用 IDA 打开之前的逆向工程中，点击 Edit -> Plugins -> BinDiff 打开窗口，点击 Diff Database 然后选择刚生成的 cryptopp.dll.i64 文件

![20250607154943](/archives/idabindiff/pmissl.png)

稍等一会 bindiff 分析完毕后，界面上显示 bindiff 的四个子窗口，这些窗口也可以在 view -> BinDiff 菜单下进行打开

这里只关心 Matched functions，也就是显示很多绿色记录的这个窗口，可以把其他窗口先关闭掉

![20250607155548](/archives/idabindiff/pq4jim.png)


Similarity 字段表示相似度，Confidence 表示可信度，Confidence 还考虑了调用关系等上下文信息

EA Primary 和 Name Primary 当前正在分析的地址和函数名，EA Secondary 和 Name Secondary 表示 cryptopp.dll.i64 中的地址和函数名

![20250607160310](/archives/idabindiff/qihbgh.png)

在进行分析后，就可以将匹配的符号，应用到当前分析的工程中去了

在 Matched functions 窗口中选择需要应用的函数记录（可以多选），然后右键菜单中选择 `import symbols/comments` 然后生效

然后就可以看到，正在分析的工程中的函数命名被同步过来了

![20250607172042](/archives/idabindiff/sgcjee.png)

![20250607172316](/archives/idabindiff/shyhq9.png)
