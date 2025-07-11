---
categories:
- 默认分类
date: '2025-01-24T19:45:00'
description: ''
draft: false
image: ''
slug: wordpress-ceomax-deploy
tags:
- wordpress
title: 基于wordpress部署ceomax主题
cover: /archives/wordpress-ceomax-deploy/image-msgl.png
---

wordpress部署好之后，将ceomax-pro主题包放置于wordpress的 wp-content\\themes\\ 目录下

![](/archives/wordpress-ceomax-deploy/image-msgl.png)

并配置 host 文件的主机记录 192.168.10.193 www.ceotheme.com（和wordpress在同一台机器上）

win下这个文件一般位于 C:\\Windows\\System32\\drivers\\etc 目录下，linux 一般位于 /etc/hosts

![](/archives/wordpress-ceomax-deploy/image-lmyg.png)

配置好之后，接着在php study 中新建一个 https 站点，生成自签发的证书（点击https的时候会弹出来设置）

https 站点指向的目录为WWW下的ceo-auth，一会需要将 index.php 文件拷贝到该目录下

https站点设置好之后，本地会有两个站点，一个是wordpress的站点名为 ceo，一个是 ceo-auth 的 https 站点

![](/archives/wordpress-ceomax-deploy/image-iydl.png)

![](/archives/wordpress-ceomax-deploy/image-bxwc.png)

将 index.php 文件拷贝到 ceo-auth 目录下，文件内容如下，是一个请求的结果响应，用于拦截激活的真实请求

![](/archives/wordpress-ceomax-deploy/image-bmvu.png)

登录 wordpress 的后台，点击“外观”下的“主题”菜单，然后选择 “ CeoMax-Pro 主题” 进行启用

![](/archives/wordpress-ceomax-deploy/image-vani.png)

启用主题后，会显示当前主题已启用但是还没激活的页面

![](/archives/wordpress-ceomax-deploy/image-nqvp.png)

打开wodpress的代码，找到 class-wp-http.php 代码，大概在 356 行的位置，添加一行代码如下所示

这个代码主要用于绕过 ssl 的检测，添加代码后重新刷新一下页面，发现就可以正常显示主题了

![](/archives/wordpress-ceomax-deploy/image-kzuo.png)

还有最后一步，进入到“外观”下的“ceomax-pro主题授权”，随便任意文本进行激活，点击保存更改即可

回到首页刷新，就可以看到正常的 ceomax 主题页面了

![](/archives/wordpress-ceomax-deploy/image-bcbq.png)

![](/archives/wordpress-ceomax-deploy/image-yidb.png)
