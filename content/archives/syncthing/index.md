---
categories:
- 默认分类
date: '2025-03-08T15:57:22'
description: ''
draft: false
image: ''
slug: syncthing
tags:
- ubuntu
- syncthing
title: syncthing多节点文件同步
cover: /archives/syncthing/sqecm1.png
---

## 服务安装

在官方地址 https://syncthing.net/downloads/ 下载对应平台的版本进行安装

文件同步至少要部署两个节点，然后在这两台设备上启动 syncthing 服务

在 ubuntu 下，生成的配置是在用户的 .local 目录下 /root/.local/state/syncthing

在 win10 下，生成的配置在 C:\Users\Administrator\AppData\Local\Syncthing 目录下

如果需要修改 Syncthing 的配置，但是 web 方式不方便的情况下，可以直接修改配置文件的项

如 GUI 对应 config.xml 中的 gui 区块， “选项” 对应配置文件的 options 区块

比如，将内网穿透后暴露到公网，可以添加以下类似的配置，insecureSkipHostcheck 指示证书验证失败时绕过主机名检查

```xml
    <gui enabled="true" tls="false" debugging="false" sendBasicAuthPrompt="false">
        <address>127.0.0.1:8384</address>
        <user>admin</user>
        <password>...</password>
        <apikey>...</apikey>
        <theme>default</theme>
        <insecureSkipHostcheck>true</insecureSkipHostcheck>
    </gui>
```


![](/archives/syncthing/sqecm1.png)


![](/archives/syncthing/sr451p.png)


## 添加设备

在页面上，点击 “添加远程设备”，在弹出来的窗口中进行设备添加

如果是局域网中进行文件同步，通常都可以自动识别在线设备，点击设备选择就可以

![](/archives/syncthing/p2sduq.png)

![](/archives/syncthing/p3i9y8.png)

如果这里不能识别出来，可以通过 ID 方式进行添加，在另一台设备的 web 页面上，点击 “操作” -> “显示ID”

将这里的 ID 复制回前面的页面上进行添加设备

![](/archives/syncthing/p5q5bh.png)

![](/archives/syncthing/p6ij9l.png)

点击添加后，在另外一台设备上会弹出一个提示，需要同意点击 “添加设备”

![](/archives/syncthing/p8ljv7.png)


然后，两个设备的页面上就可以显示 “已连接” 状态

![](/archives/syncthing/p9ej81.png)

## 文件同步


### 源的配置

在设备连接之后，就可以进行文件同步了，在源节点上添加要同步的文件夹

这里的 “文件夹ID” 很重要，源和目的的这个 ID 值要一致才可以进行文件同步，将 “文件夹ID” 拷贝下来，一会配置目的的时候填上

![](/archives/syncthing/owar4e.png)

设置的文件夹需要向哪些节点进行同步

![](/archives/syncthing/oyo7ll.png)

高级中设置文件夹类型，如果是单向同步的话源选择 “仅发送”，目的节点选择 “仅接收”，按需要配置

![](/archives/syncthing/ozn3cz.png)


### 目的的配置

上一步在源添加了待同步的文件夹后，在目的 web 页面上弹出提示

点击 “添加” 配置源和目的

![](/archives/syncthing/pdb78f.png)

也可以进行手动添加，点击 “添加文件夹” ，指定的 “文件夹ID” 和前面的一致，以及本地的文件夹路径

然后在 “共享” 中勾选同步的设备，以及 “高级” 中设为 “仅接收”

![](/archives/syncthing/pfbnq6.png)

如果需要在源端进行删除文件的时候，保留目的端的文件

在目的端的 “操作” -> “高级” 页面中，选择指定的文件夹 ,勾选 “Ignore Delete”

![](/archives/syncthing/pjz0uq.png)

完成后确定，一会就开始进行文件同步了

![](/archives/syncthing/phn31f.png)


## 启用中继

当两个节点无法直接建立连接时，默认会通过中继进行数据同步，中继默认是开启的，也可以手动关闭掉

![](/archives/syncthing/twqs11.png)

例如，启动后自动连接到中继节点

```log
[FUE4E] 2025/03/08 17:42:44 INFO: Completed initial scan of sendreceive folder "Default Folder" (default)
[FUE4E] 2025/03/08 17:43:04 INFO: Detected 0 NAT services
[FUE4E] 2025/03/08 17:43:59 INFO: GUI and API listening on 127.0.0.1:8384
[FUE4E] 2025/03/08 17:43:59 INFO: Access the GUI via the following URL: http://127.0.0.1:8384/
[FUE4E] 2025/03/08 17:47:18 INFO: Joined relay relay://103.197.185.50:22067
```

Syncthing 的官方这里有完整的 relay 列表，https://relays.syncthing.net/


## 组网文件同步

这里记录了怎么基于 ubuntu 服务器节点和本地的 win10 节点组成局域网 https://www.xqc7.com/archives/wireguard

组网后，两个节点的文件同步就像是局域网中的机器一样，这里需要 ufw 开启 22000 端口，这是 syncthing 同步文件需要的端口

但是这个端口不需要在云厂商的安全策略中进行配置，syncthing 走的是内网的 22000 tcp 端口（基于 wireguard udp 22 端口上的）

将本地的 win10 下的一些文件，同步给远端 ubuntu 服务节点

这是 win10 本地服务端 web 页面显示

![image-20250310164606502](/archives/syncthing/r81zve.png)

这个 ubuntu 服务端的 web 页面显示（同步之前，本地就已经删除了部分文件，这里服务端开启 Ignore Delete 来忽略删除）

在公网环境下的文件同步，除了速度略微慢一点外，Syncthing 能非常出色的完成文件的同步

![image-20250310164813093](/archives/syncthing/r9aexr.png)
