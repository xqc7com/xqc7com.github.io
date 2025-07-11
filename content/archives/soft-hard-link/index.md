---
categories:
- 默认分类
date: '2024-12-29T09:51:00'
description: ''
draft: false
image: ''
slug: soft-hard-link
tags:
- linux
title: Linux下的软连接和硬连接
cover: /archives/soft-hard-link/image-wuzc.png
---

## 创建文件

磁盘分两部分：inode区块，和数据区块

inode文件在inode区块中，数据文件和目录文件在数据区块中

数据文件：就是实际的数据内容，根据内容大小，可能会出现多级索引的情况

目录文件：文件的内容就是该目录下的文件名，以及该文件名对应的inode号码

aaa 为实际文件， bbb 为软连接名称，ccc 为硬连接名称，不带参数 s 表示创建的为硬连接

原文件 aaa ，软连接 bbb ，硬连接 ccc；删除 aaa，bbb无法读取，ccc 正常读取

```shell
ln -s aaa bbb
ln    aaa ccc
```

## 实现原理

硬连接为在当前目录下，增加一条文件名记录，对Linux文件系统来说并未新增文件

该文件名和原文件名都有相同的inode号码，然后inode的计数会加1

软连接是新增了一个文件，这个文件有新的inode和数据块，但是数据块的内容为实际文件的具体路径

![](/archives/soft-hard-link/image-wuzc.png)

inode的信息可参考 [https://www.ruanyifeng.com/blog/2011/12/inode.html](https://www.ruanyifeng.com/blog/2011/12/inode.html)
