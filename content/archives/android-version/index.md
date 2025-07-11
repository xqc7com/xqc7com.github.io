---
categories:
- 安卓开发
date: '2025-02-12T17:46:48'
description: ''
draft: false
image: ''
slug: android-version
tags:
- android
title: 安卓开发中的版本号理解
cover: /archives/android-version/ffrg9d.png
---

## android版本号

安卓开发中有几个版本号，非常重要，这里从最基础的场景理解

小米手机的 MIUI 操作系统，都是基于某一个版本的 android 内核开发的

这句话就有两个版本的概念

1、安卓的版本号，也就是底层内核的版本号，这个 android 内核是 google 提供的

2、操作系统的版本号，这是厂商定义的，这里是小米的 MIUI 版本号

![](/archives/android-version/ffrg9d.png)

做手机的有好多厂商，每个厂商也有好多款手机型号，每个型号的手机通常也会进行多批次生产

同一型号不同批次生成的手机，厂商也会进行迭代优化软/硬件

即便同一个批次的手机在售出后，当提示系统升级，也不是每个用户都愿意升级的

可以想象，这些共存的版本号是非常混乱的，如果说要开发者去适配是一件非常非常麻烦的事情

## sdk版本号

那么，开发好的应用到底能在哪些安卓手机上正常运行呢？是由什么来决定的呢？ 

这就是第三个版本号， sdk 版本号

开发安卓应用，都是基于 sdk 的基础上进行开发的，这个 sdk 也是 google 提供的

对于应用开发者而言，sdk 的版本又有 3 个值 

compileSdkVersion 指编译时使用的 SDK 版本，决定了开发时可以使用哪些 API

minSdkVersion 最低运行的 SDK 版本，决定了应用可以安装在哪些设备上

targetSdkVersion 目标运行的 SDK 版本，影响应用在不同版本上的兼容性行为

三者的关系如下

minSdkVersion <= targetSdkVersion <= compileSdkVersion

但更常见的是 targetSdkVersion 设置为 compileSdkVersion 一致 

那么这些版本号有什么关系呢？Android 和 sdk 的版本号关系如下 

https://developer.android.com/tools/releases/platforms?hl=zh-cn


比如 `Android 12（API 级别 31、32）` 的意思是说

基于 SDK 31、32 开发的应用，可以在安卓 12 及以上的手机上运行，但是不能在低于 12 的手机上运行

如果需要开发出能在 13 上运行的应用，那么可在 sdk 33 及以下 31、32 或更低的 sdk 进行开发

![](/archives/android-version/sa3yqp.png)
