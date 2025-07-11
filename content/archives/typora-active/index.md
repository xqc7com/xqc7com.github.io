---
categories:
- 默认分类
date: '2025-03-31T19:32:26'
description: ''
draft: false
image: ''
slug: typora-active
tags:
- typora
title: Typora亲测可用免激活版
cover: /archives/typora-active/vurcqi.png
---

## 版本安装

从官方 https://typoraio.cn/ 下载 Typora 1.8.10 历史版本，也可以 [从 csdn 这里下载](https://download.csdn.net/download/weixin_53109623/90423302)，较新的版本已经修复了该问题

![20250331192609](/archives/typora-active/vurcqi.png)

## Typora免激活

### 修改js检查

在 typora 的安装目录 Typora\resources\page-dist\static\js 下，找到 `LicenseIndex.180dd4c7.c77b6991.chunk.js` 类似的 js 文件

打开后将 `e.hasActivated="true"==e.hasActivated` 替换为 `e.hasActivated="true"=="true"`

![](/archives/typora-active/vns882.png)


### 关闭弹窗

打开 Typora\resources\page-dist\license.html 文件

将 `</body></html>` 替换为 `</body><script>window.onload=function(){setTimeout(()=>{window.close();},5);}</script></html>`

![20250331191845](/archives/typora-active/vq7ika.png)

### 去除“未激活”提示

打开 Typora\resources\locales\zh-Hans.lproj\Panel.json 文件 

将 `"UNREGISTERED":"未激活"` 替换为 `"UNREGISTERED":" "`

![20250331192202](/archives/typora-active/vsc3s7.png)

## 参考

免激活使用 typora-setup-x64-1.8.10 版本 https://blog.csdn.net/qq_56746297/article/details/141232176  



