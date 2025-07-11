---
categories:
- 默认分类
date: '2024-12-31T10:54:00'
description: ''
draft: false
image: ''
slug: mingw-naming
tags:
- c++
- mingw
title: MinGW的命名意义
cover: /archives/mingw-naming/image-ljxg.png
---

官方提供在线安装和离线安装两种方式，离线安装包的命名规则不太常见，这里记录下

参考：[https://wiki.qt.io/MinGW-64-bit](https://wiki.qt.io/MinGW-64-bit)

```
SJLJ (setjmp/longjmp):
available for 32 bit and 64 bit
not "zero-cost": even if an exception isn't thrown, it incurs a minor performance penalty (~15% in exception heavy code) 
but sometimes the penalty can be more significant: https://bugreports.qt.io/browse/QTBUG-29653
allows exceptions to traverse through e.g. windows callbacks

DWARF (DW2, dwarf-2)
available for 32 bit only
no permanent runtime overhead
needs whole call stack to be dwarf-enabled, which means exceptions cannot be thrown over e.g. Windows system DLLs.

SEH (zero overhead exception)
will be available for 64-bit GCC 4.8.
rubenvb release is available targetting Win64/Personal Builds/rubenvb/gcc-4.8-release/x86_64-w64-mingw32-gcc-4.8.0-win64_rubenvb.7z/download
MinGW-builds release is available
```

SJLJ （setjmp / longjmp）： 可用于32位和64位

即使不抛出exception，也会造成较小的性能损失（在exception大的代码中约为15％），允许exception遍历，例如窗口callback

DWARF （DW2，dwarf-2）：只有32位版本

没有永久的运行时间开销 – 需要整个调用堆栈被启用，这意味着exception不能被抛出，例如Windows系统DLL

SEH （零开销exception）：只有64位版本，可用于 64 位 gcc 4.8（win下64位的gcc）

win32和posix指两类操作系统，正常下载 win32 的 sjlj 版本即可，下面的版本中 x86\_64 是指 64 位版本， i686 是才是指 32 位版本

![](/archives/mingw-naming/image-ljxg.png)
