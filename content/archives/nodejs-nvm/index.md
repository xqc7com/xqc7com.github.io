---
categories:
- 默认分类
date: '2025-03-30T16:36:12'
description: ''
draft: false
image: ''
slug: nodejs-nvm
tags:
- nvm
- nodejs
title: nodejs的版本管理工具NVM
cover: /archives/nodejs-nvm/ppba9v.png
---

NVM 是一个 node 的版本管理工具， windows 版本的 [下载地址](https://github.com/coreybutler/nvm-windows/releases/download/1.2.2/nvm-setup.exe)，下载完毕后双击安装

## NVM 的主要命令

`nvm list` 查看当前已经安装的 node 版本，以及正在使用的 node 版本（`*`显示），这个和 `nvm list installed` 命令是一致的

![](/archives/nodejs-nvm/ppba9v.png)


`nvm list available` 查看有哪些可用的 node 版本，需要安装的时候优先选择 LTS 版本

![](/archives/nodejs-nvm/psdcxb.png)

版本安装，根据前面列出来的可安装版本，指定安装某一个版本的 node 应用 `nvm install 20.16.0`

![](/archives/nodejs-nvm/qhc9l7.png)


版本切换，使用 use 指令切换本地的已安装版本 `nvm use 20.16.0`

切换后，查看 node 的版本号显示 20.16.0 

![](/archives/nodejs-nvm/qjn4eu.png)

## NVM 的主要原理

1、NVM 将不同版本的 node 安装到 nvm 自身的路径下

![](/archives/nodejs-nvm/qmjy2o.png)


2、将 `C:\Program Files\nodejs` 添加到 path 的环境变量

3、切换 ndoe 版本的时候， nvm 就会在 `C:\Program Files` 路径下增加一个 node 的路径快捷方式

![](/archives/nodejs-nvm/qni6cd.png)


使用 dir 可以查看快捷方式的指向 `dir "C:\Program Files\" /a` ，也可以通过快捷方式右键属性查看

显示 nodejs 指向正是 nvm 下的某个版本目录 

![](/archives/nodejs-nvm/qvomsm.png)

