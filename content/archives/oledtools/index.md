---
categories:
- 默认分类
date: '2024-11-26T15:43:30'
description: ''
draft: false
image: ''
slug: oledtools
tags:
- 其他
title: OledTools扫描图片生成点阵文件
cover: /archives/oledtools/image-tzyg.png
---

OledTools是一款根据图片生成二进制点阵文件的软件，非常轻量且易于使用，下载地址

链接：[https://pan.baidu.com/s/1r920OBKecETkXLj63fsahQ](https://pan.baidu.com/s/1r920OBKecETkXLj63fsahQ) 提取码：fwko

16 x 16 点阵，根据图片生成的点阵，指定的扫描方式为竖向，扫描结果参考如下

![](/archives/oledtools/image-tzyg.png)

生成的二进制bin文件内容如下

![](/archives/oledtools/image-ymth.png)

分析可以知道，00 以及 10 的地址对应图片的第一列， 01 以及 11 对应图片的第二列，依次类推

其中 08 单元的 df 在图形上表示为左侧第一个有值的列，从上往下依次为低位到高位，写成二进制为 11011111

这里的1表示空缺，0 表示置为需要绘制，0 就是表示上述的黑色阵点

64 x 48 的扫描方式

经过分析计算得知，扫描方式为从开始位置向下取 8 位，然后以这个为单位扫描第一行

然后再向下取 8 位，接着扫描第二行，直到扫描结束，参考下面的点阵图分析所示（扭曲部分）

![](/archives/oledtools/image-hevl.png)

生成的 bin 点阵文件二进制如下

![](/archives/oledtools/image-lxtc.png)

以下是解析点阵文件的示意图，分别是两种扫描方式生成的点阵文件

![](/archives/oledtools/image-fwsq.png)
