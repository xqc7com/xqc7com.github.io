---
categories:
- 采集工具
date: '2024-12-30T15:55:00'
description: ''
draft: false
image: ''
slug: download-pexels
tags:
- 资源
title: 免费资源pexels的批量下载
cover: /archives/download-pexels/image-ebcp.png
---

## 下载思路

pexels 是一个免费的图库视频资源网站，里面有大量的可用资源，但是一个一个下载太麻烦了

这里提供一种批量下载的实现方式

打开 pexels 地址后，搜索出来自己感兴趣的资源，每个资源上面都有一个 “下载” 按钮，这里有资源的下载地址，点击就可以直接下载了

在浏览器的 console 窗口，通过脚本的方式将每一个资源的地址都提取出来，然后就可以进行批量下载

![](/archives/download-pexels/image-ebcp.png)

从前端的代码看，没有什么特别的标识符，class 应该都是动态生成的，因此这里通过 title="下载" 的 a 标签来获取

![](/archives/download-pexels/image-dusz.png)

## 实现脚本

脚本通过提取 url 地址，然后通过拼凑每一个 curl 的下载命令，然后将这些命令输出到屏幕

文件名采用 url 的后面的数字串来表示，因为我这里搜索出来的是视频资源，加上了 mp4 后缀，图片的话可以加上 jpg 后缀

```js
var downInfo = '';
var elements = document.getElementsByTagName('a');
for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var title = element.getAttribute('title');
    if (title == '下载') {
        var downUrl = element.href;
        const newUrl = downUrl.endsWith('/') ? downUrl.slice(0, -1) : downUrl; 
        var filename = newUrl.substring(newUrl.lastIndexOf('/')+1); 
        downInfo = downInfo + 'curl -L -o ' + filename + '.mp4 ' + downUrl + "\r\n";         
    }
}
console.log(downInfo)
```

![](/archives/download-pexels/image-lgtv.png)

## 资源下载

将这些输出到命令拷贝到一个 bat 脚本，然后双击运行就可以了，前提是你的机器需要有 curl 命令才行，没有的话就装一个

没一会就下载了很多的资源

![](/archives/download-pexels/image-zald.png)
