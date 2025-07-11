---
categories:
- 默认分类
date: '2024-11-30T14:29:55'
description: ''
draft: false
image: ''
slug: win10-install
tags:
- windows
title: win10虚拟机安装
cover: /archives/win10-install/image-iaja.png
---

## 安装 vmware 软件

这个安装没有什么好说的，网上的安装教程也比较多，一路无脑操作就行

下面是我在使用 vmware 的版本，有需要可以下载获取

链接：https://pan.baidu.com/s/1FTLfjjShDDpsOu1uXLxq7g 提取码：h5sm

## 制作 win10 安装包

这里不推荐使用第三方制作的安装包，通常这些安装包都会夹带私货，可以自行制作一个 win10 的安装包，非常简单

打开微软的官方地址 [https://www.microsoft.com/zh-cn/software-download/windows10](https://www.microsoft.com/zh-cn/software-download/windows10)

下载 win10 安装媒体

![](/archives/win10-install/image-iaja.png)

下载得到一个 `MediaCreationTool_22H2.exe` 的执行文件，双击运行该文件，其中下面这步选择

“为另一台电脑创建安装截止（U 盘、DVD 或 ISO 文件）”

![](/archives/win10-install/image-peno.png)

使用的介质这一步选择 `ISO 文件`

![](/archives/win10-install/image-owqu.png)

然后再下一步选择一个路径保存 ISO 文件即可，其他的都不需要进行人工干预

![](/archives/win10-install/image-rryo.png)

稍等片刻，提示 iso 文件制作完毕

![](/archives/win10-install/image-wzun.png)

## 安装 win10 虚拟机

这个步骤就和正常的 win10 安装一样的，网上教程比较多，这里就不提供了

安装完毕后，默认 administrator 账户是没有开启的，在我的电脑右键，选择 “管理” 菜单，在弹出的窗口中选择 “用户”，

点击 “administrator” 右键属性，在打开的属性窗口中，将 “账户已禁用” 取消勾选

具体步骤如下图：

![](/archives/win10-install/image-mdib.png)

我这里也将 win10 虚拟机分享出来，有需要的童鞋可以自行获取，分享地址

链接：https://pan.baidu.com/s/1QQmqx5d7cqVmjN0IDPTyUA 提取码：ipfp
