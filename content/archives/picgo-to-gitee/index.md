---
categories:
- 建站技能
date: '2025-01-07T14:59:00'
description: ''
draft: false
image: ''
slug: picgo-to-gitee
tags:
- csdn
- gitee
- PicGo
title: 发布文章使用PicGo+Gitee作为图床
cover: /archives/picgo-to-gitee/20250107123230683.png
---

csdn 写作的时候，可以使用 markdown 进行写作，但是如果多平台发布文章的话非常麻烦

尤其是对图片的处理上，现在使用 PicGo+gitee 的方式对文章的图片进行管理

## gitee 配置

#### 新建仓库

浏览器打开 gitee 页面新建一个仓库，如果没有 gitee 用户的话需要先注册一个

![](/archives/picgo-to-gitee/20250107123230683.png)


#### 生成令牌

在用户的 `设置` 中，创建一个私人令牌，私人令牌创建的时候只会显示一次

创建好令牌后把令牌拷贝下来，后面设置 PicGo 使用

![](/archives/picgo-to-gitee/20250107124042172.png)


## PicGo 配置

PicGo 的官方地址 https://github.com/Molunerfinn/PicGo 

下载安装 PicGo 软件，还需要为其安装一个 gitee 的插件；启动 PicGo 后，在插件设置中搜索 gitee 然后点击安装

![](/archives/picgo-to-gitee/20250107123634220.png)

安装插件后，再到 `PigGo设置` 中勾选 gitee 生效，将其他不使用的图床取消勾选

![](/archives/picgo-to-gitee/20250107123738477.png)

在 `gitee图床` 中配置 gitee 的账户信息，token就是前面申请的私人令牌

![](/archives/picgo-to-gitee/20250107124850003.png)


## 图片上传

使用截图工具进行截图（图片保存在剪切板中），然后在 PicGo 的 `上传区` 的标签页中

点击 `剪切板图片` 按钮，然后界面上会显示一个上传进度条，进度条结束后，图片链接已经保存在剪切板中了

然后就可以将剪切板中的链接信息粘贴到 md 文章中了

![](/archives/picgo-to-gitee/20250107125637822.png)
