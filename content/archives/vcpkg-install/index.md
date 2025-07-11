---
categories:
- 默认分类
date: '2024-11-26T11:39:18'
description: ''
draft: false
image: ''
slug: vcpkg-install
tags:
- c++
title: 安装 vcpkg 进行包管理
---

下载 vcpkg 代码版本包

```shell
git clone https://github.com/Microsoft/vcpkg.git
```

进入代码根目录，执行 bat 文件，这个脚本操作实际上是下载了一个 vcpkg.exe 程序

这个 vcpkg.exe 程序是从 github 上面下载的，也可以手工下载，然后放置到 vcpkg 源代码目录下

```shell
.\bootstrap-vcpkg.bat
```

也可以使用 proxy 将 http 的请求全部都转为代理下载，在桌面增加一个 proxy.bat

```shell
set http_proxy=http://192.168.1.200:58591
set https_proxy=http://192.168.1.200:58591

start
```

双击启动 proxy.bat 文件，然后 cd 到 vcpkg 的源代码目录下，这时候在终端执行的 http 请求操作都会走代理访问

如安装包可以在该终端下执行

```shell
vcpkg install zlib
vcpkg install protobuf
```

在 vcpkg 中可以查看安装的所有包以及具体版本号

```shell
vcpkg list
```

vcpkg 中安装管理 boost，指示 full 安装完全版本

```shell
vcpkg install boost:x.y.z +full
```
