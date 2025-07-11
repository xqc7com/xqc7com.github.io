---
categories:
- 默认分类
date: '2025-01-15T10:37:00'
description: ''
draft: false
image: ''
slug: windows-build-openssl
tags:
- vs2022
- openssl
title: openssl在windows下的编译
cover: /archives/windows-build-openssl/20250115093957566.png
---

编译需要预装 vs2022 以及 perl 工具，perl 下载地址 https://strawberryperl.com/ 

在 github 下载 openssl 的源码 https://github.com/openssl/openssl 

根据需要切换到对应的分支版本

在系统的开始菜单中，找到 Visual Studio 2022 下的 `x64 Native Tools Command Prompt for vs 2022` 点击运行

![](/archives/windows-build-openssl/20250115093957566.png)

在命令行中切换到 openssl 的源码目录下，输入以下命令（no-shared 表示编译静态库）

这里选的 64 位版本，默认安装目录在 C:\Program Files\OpenSSL 

```
perl Configure VC-WIN64A no-asm no-shared --debug
```

![](/archives/windows-build-openssl/20250115100033456.png)

然后输入 namke 回车，就开始编译构建了，稍等一会大约几分钟编译完成

编译完毕，运行 nmake instal 就将编译的版本安装到  C:\Program Files\OpenSSL 下，目录结构如下

bin 下是动态库和执行文件，程序运行的时候会用到动态库，静态编译就只有 openssl.exe 执行文件

html 是帮助文档

include 下是头文件，其他程序使用 openssl 库的时候需要 include 这些头文件

lib 是链接文件，其他程序使用 openssl 库的时候链接 include 这些头文件

![](/archives/windows-build-openssl/20250115100941914.png)




