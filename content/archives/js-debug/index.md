---
categories:
- 默认分类
date: '2025-06-16T19:01:22'
description: ''
draft: false
image: ''
slug: js-debug
tags:
- ida
title: 去除前端js的反调试
cover: /archives/js-debug/uk9mqr.png
---

chrome 访问一个 web 页面，按 F12 打开开发者工具的时候没反应，尝试从菜单中进行打开开发者工具，

结果页面直接跳转到了 about:blank 变成了一片空白，可以知道页面加了反调试的逻辑

在空白页面的情况下，先打开开发者工具，然后再重新请求该 url 地址，发现页面刷新后很快又跳转到了 about:blank 空白页

在网络页面可以看到，加载了一个 disable-devtool.js 文件，很显然该文件阻止了打开开发者工具

![20250616184756](/archives/js-debug/uk9mqr.png)


在开发者工具的网络标签中，选择该文件记录，然后右键点击 “屏蔽请求网址”

![20250616185430](/archives/js-debug/uo1jjy.png)

屏蔽之后，再重新发起 url 请求，可以看到该记录变成了红色表示未加载该文件，这时候页面也可以正常显示了

![20250616185822](/archives/js-debug/uqdavu.png)
