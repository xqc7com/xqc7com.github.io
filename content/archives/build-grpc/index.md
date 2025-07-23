---
categories:
- 默认分类
date: '2024-11-25T17:34:42'
description: ''
draft: false
image: ''
slug: build-grpc
tags:
- grpc
title: windows下gRPC编译记录
cover: /archives/build-grpc/image-opkx.png
---

从官方的信息来看，gRPC并没提供C++二进制包，除了C++其他语言都提供二进制版本的安装方式

对于国内的童鞋来说，因为众所周知的原因，编译gRPC还是有点麻烦的

![](/archives/build-grpc/image-opkx.png)

代码下载

```shell
> git clone -b RELEASE_TAG_HERE https://github.com/grpc/grpc
> cd grpc
> git submodule update --init
```

执行 `git submodule update --init` 的时候，如果碰到某些子模块下载异常，需要清除后重新下载

比如：我这里更新的时候，abseil-cpp子模块下载失败了，需要手工处理

（1）在 grpc\\third\_party\\abseil-cpp 目录下，将子模块目录的文件清空，删除 .git 文件以及其他文件（如有的话）

（2）在 grpc\\.git\\modules\\third\_party 目录下，删除 abseil-cpp 目录（如有点话）

清理完毕后，再重新执行 `git submodule update --init`

![](/archives/build-grpc/image-ztyo.png)

## 编译报错

按官方文档的指示，构造编译，不同版本的vs其版本号不一样，按照官方的Release号填写，比如 vs2022的Release号为17

参考地址 [https://learn.microsoft.com/en-us/visualstudio/releases/2022/release-history](https://learn.microsoft.com/en-us/visualstudio/releases/2022/release-history)

官方详细的编译指南参考 [https://github.com/grpc/grpc/blob/v1.56.0/BUILDING.md](https://github.com/grpc/grpc/blob/v1.56.0/BUILDING.md)

```shell
> @rem Run from grpc directory after cloning the repo with --recursive or updating submodules.
> md .build
> cd .build
> cmake .. -G "Visual Studio 17 2022"
> cmake --build . --config Release
```

在编译的过程中，报了大量的错误，都是找不到 stdalign.h 文件，全盘搜了下，vs2022或者系统相关的路径确实找不到这个文件

```shell
error C1083: 无法打开包括文件: “stdalign.h”: No such file or directory ... 
```

根据网上资料，需要`10.0.20348.0` 及后面的windows sdk才有该文件，可以通过官方进行下载安装，或者通过 vs 安装工具来下载

官方地址：[https://developer.microsoft.com/en-us/windows/downloads/sdk-archive/](https://developer.microsoft.com/en-us/windows/downloads/sdk-archive/)

![](/archives/build-grpc/image-cgej.png)

通过 vs 的安装工具进行安装10.0.20348.0版本的SDK，大约需要占用磁盘空间 2 G 左右

![](/archives/build-grpc/image-oach.png)

这里需要区分下windows的内核版本，和windows SDK的版本，两者是没有直接关系的（当然版本号数值上可能是相同的）

查看本地的windows 内核版本，可以通过 winver 命令来查看（还有其他的查看方式）

![](/archives/build-grpc/image-gvmm.png)

查看当前已经安装的 windows SDK版本号，可以通过vs工程中的配置属性中查看

如下表示当前vs中安装的 10.0.19041.0 和 10.0.20348.0 的SDK

![](/archives/build-grpc/image-lyfs.png)

## 重新编译

安装好10.0.20348.0 版本的SDK后，这时候需要删除原来生成的.build目录，执行cmake命令的时候，增加一个windows SDK版本的参数

对比前面的命令，多了一个指示参数 CMAKE\_SYSTEM\_VERSION，指示windows SDK的版本号

```
cmake  <path_to_source>
> @rem Run from grpc directory after cloning the repo with --recursive or updating submodules.
> md .build
> cd .build
> cmake .. -DCMAKE_SYSTEM_VERSION="10.0.20348.0" -G "Visual Studio 17 2022"
> cmake --build . --config Release
```

如果要加快编译速度，在编译的时候可以使用 -j 参数指示多进程编译，编译结果在 grpc\\.build\\Release 目录下

```
> cmake .. -DgRPC_INSTALL=ON -DCMAKE_SYSTEM_VERSION="10.0.20348.0" -G "Visual Studio 17 2022" -A Win32 
> cmake --build . --config Release -j 8 --target install
```

执行 install 之后，如果不指定路径的话，默认是安装到 C:\\Program Files (x86)\\grpc 目录下
