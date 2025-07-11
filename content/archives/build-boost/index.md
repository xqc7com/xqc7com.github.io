---
categories:
- 默认分类
date: '2024-12-30T14:46:00'
description: ''
draft: false
image: ''
slug: build-boost
tags:
- c++
- boost
title: boost的编译和安装
cover: /archives/build-boost/image-snyp.png
---

下载 boost 的源码包后解压，在代码目录下有一个 bootstrap.bat 文件，双击运行生成 b2.exe 文件

在 cmd 窗口下，可以通过 `b2 --help` 查看一些命令以及参数，如 install 指令的 `-prefix` 参数等

双击 b2.exe 进行缺省编译， 缺省编译的是 minimal，也通过 `b2 install` 进行缺省编译安装，库以及头文件安装到 `C:\\Boost` 目录下

如果需要全量编译安装，需要要带上参数 `--build-type=complete` ，这将会生成动态库和静态库文件（部分没动态库）

如果已经全量编译过了，然后再进行安装也是需要使用 `--build-type=complete` ，不然也只会安装 minimal 的部分

## thread库

对于 thread 库，完整的编译文件列表如下（默认minimal编译生成4个文件，没有s的文件和动态库文件）

![](/archives/build-boost/image-snyp.png)

## graph包

又如 graph 默认是不会编译的，完整编译后生成如下文件列表（pdb文件是提供调试使用）

![](/archives/build-boost/image-cxjb.png)

## 文件名说明

编译出来的boost库命名规则，包含完整的9部分，如库文件名称 `libboost_thread-vc143-mt-sgd-x32-1_81.lib`

1、静态库以 lib 开头，动态库开头没有 lib

2、所有的库都含有boost前缀

3、库名称，本例中为 thread

4、编译器名称及其版本，vc143 指的是 msvc-14.3，对应 Visual Studio 2022，vs的发行版本见后图

5、有 mt 代表 multi threading，没有则代表 single threading

6、有 s 代表 runtime-link=static，没有则代表 runtime-link=shared，就是表示运行时是静态链接还是动态连接

7、有 gd 代表 debug 版本，没有则代表 release 版本

8、目标位数，x32 代表 32 位，x64 代表 64 位

9、Boost 库的版本号，1\_81 代表 Boost 1.81 版本

完整的官方指导手册参考：[https://www.boost.org/doc/libs/1\_81\_0/more/getting\_started/windows.html](https://www.boost.org/doc/libs/1_81_0/more/getting_started/windows.html)

## vs的发行版本

![](/archives/build-boost/image-qbun.png)
