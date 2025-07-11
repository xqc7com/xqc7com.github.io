---
categories:
- 默认分类
date: '2024-12-29T11:05:00'
description: ''
draft: false
image: ''
slug: console-output
tags:
- linux
title: 控制台重定向输出详细说明
---

0 表示标准输入

1 表示标准输出

2 表示标准错误输出

\> 表示重定向

一般来说，1> 通常可以省略成 > 如下：

```shell
ls a.txt b.txt 1>file.out 2>file.err
```

可省略写成

```shell
ls a.txt b.txt >file.out 2>file.err
```

另外进行分析日志时候，清空日志常用这种方式，本质上也是重定向清空

```shell
[hello@localhost ~]$ >test.log
```

2>&1 意思是把标准错误输出重定向到标准输出

& 是一个描述符，如果 1 前不加 &，> 符号后面会被当成一个名称为 1 普通文件，结果就是标准错误输出重定向到文件名称为 1 的文件中

这个命令最终标准输出以及错误输出都重定向到 file.out 文件中

```shell
ls a.txt b.txt 1>file.out 2>&1
```

&>filename 意思是把标准输出和标准错误输出都重定向到文件 filename 中，因此上述重定向的命令可以简写成

```shell
ls a.txt b.txt &>file.out
```

\>&2 等同于 1>&2，标准输出重定向到标准错误输出

因此 ls 2>file.out >&2 表示标准输出以及标准错误输出都重定向到file.out中，等同 ls 1>file.out 2>&1
