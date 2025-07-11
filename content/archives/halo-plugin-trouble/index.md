---
categories:
- 默认分类
date: '2025-02-14T20:09:06'
description: ''
draft: false
image: ''
slug: halo-plugin-trouble
tags:
- halo
- vscode
title: halo发布文章的插件问题分析
cover: /archives/halo-plugin-trouble/u50mzi.png
---

## 前言

在准备发文到 halo 系统的时候提示错误如下，全是乱码 

![](/archives/halo-plugin-trouble/u50mzi.png)

尝试将 halo 插件卸载后，再将插件目录下的文件全部删除

插件目录在 `C:\Users\Administrator\.vscode\extensions\halo-dev.halo-1.3.0`  

然后再重新安装插件，在进行初始化的时候依然还是报错 

![](/archives/halo-plugin-trouble/u6554v.png)

## 问题分析 

下午的时候在搞公私钥的时候，将本地的公私钥重新生成了，然后就出现问题了

估计大概率和这个相关，重装插件以及删除插件目录下的旧文件，看来并不会删除鉴权信息

vscode 中提示和 halo 插件相关的错误信息如下

![](/archives/halo-plugin-trouble/w4f1p4.png)


和 halo 相关的还有一个配置文件 run.halo.vscode.pref，在 `C:\Users\Administrator\.config\preferences` 目录下

看内容是加密了的，应该就是鉴权信息了，删掉这个文件后再次初始化 halo 插件就正常了

![](/archives/halo-plugin-trouble/w49wxb.png)


## 插件源码

翻了一下插件的源码，插件定义了一个 siteStore 对象存储 url 和 token

siteStore 是使用 node 的 preferences 模块进行存储的，preferences 模块中鉴权信息进行存取的时候，使用到了本地的公私钥

本地的公私钥变了，就会导致对原来的加密信息解密失败，得到的 json 也就是有问题的

![](/archives/halo-plugin-trouble/fqf07n.png)

![](/archives/halo-plugin-trouble/fr3cur.png)

![](/archives/halo-plugin-trouble/fs4f1f.png)
