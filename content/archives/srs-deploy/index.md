---
categories:
- 默认分类
date: '2025-09-25 09:11:24+08:00'
description: ''
draft: false
image: ''
slug: srs-deploy
cover: /archives/srs-deploy/rj2nuj.png
tags:
- SRS
- 流媒体
title: 流媒体服务SRS环境的搭建
---


## 服务部署

SRS 是一款开源的流媒体服务器工具，源码地址 https://github.com/ossrs/srs

这里以 ubuntu 作为服务器，下载源码后切换到 src/trunk 目录，使用以下命令进行安装

```
cd srs/trunk
./configure
make -j4
```

编译完毕后，启动服务器进行测试 

```
./objs/srs -c conf/srs.conf
```

从服务端监听端口来看，启动的进程开启了 3 个端口监听，其中：

8080 是 web 页面的监听

1935 是 rmtp 的监听，基于 tcp 协议之上

1985 是 提供 api 接口的 http 端口监听

![](/archives/srs-deploy/uju630.png)

## 媒体直播

### RTMP直播推流

准备 mp4 文件，然后运行以下命令，将视频流推到服务器上

```
ffmpeg -re -i mvmusic.mp4 -c copy -f flv rtmp://localhost/live/livestream
```

也可以使用 OBS 进行推流，配置直播中的服务器地址为 `rtmp://192.168.1.160/live/livestream` 

点击确定保存直播配置后，就可以点击开始直播流（在直播之前需要配置下 OBS 的视频输出源）

![](/archives/srs-deploy/wzra77.png)

### RTMP直播拉流

浏览器中输入 http://192.168.1.160:8080/ 回车 ，按照显示的指引点击可以进入 SRS 播放器

点击上面的播放视频，就可以从服务端实时获取直播流了

![](/archives/srs-deploy/rj2nuj.png)


也可以使用 PotPlayer 播放器来获取实时的直播流，在主面板右键打开链接

然后配置上直接的地址 http://192.168.1.160:8080/live/livestream.flv ，然后就可以开始直播流播放了

![](/archives/srs-deploy/98imeq.png)

## HLS直播

更新 srs.conf 配置文件，设置 hls 的具体配置参数

```nginx
http_server {
    enabled         on;
    listen          8080;
    dir             ./objs/nginx/html;  #视频切片文件存储地址（trunk文件夹下的地址）
}
vhost __defaultVhost__ {
    hls {
        enabled         on; #开启hls直播
        hls_path        ./objs/nginx/html; #HLS的m3u8和ts文件保存的路径。m3u8和ts文件都保存在这个目录中
        hls_fragment    10; #简单来说，就是ts文件时长
        hls_window      60; #秒，指定HLS窗口大小，即m3u8中ts文件的时长之和，超过总时长后，丢弃第一个m3u8中的第一个切片，直到ts的总时长在这个配置项范围之内
    }
}
```

启动 hls 推流，这个推流命令和 rtmp 中的推流是一样的

```
ffmpeg -re -i mvmusic.mp4 -c copy -f flv rtmp://localhost/live/livestream

ffmpeg -i mvmusic.mp4 -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_list_size 0 http://localhost/live/livestream
```

播放的时候配置直播 url 地址为（浏览器中进行播放也是一样）

```
http://192.168.1.160:8080/live/livestream.m3u8
```

## 点播实现思路

根据前面的直播逻辑，推流的时候会生成 m3u8 以及对应的 ts 视频文件片段，但是直播的时候只会保存最近的部分视频片段

使用 m3u8 的地址进行直播的时候是可以进行部分前后拖动的，那么这个逻辑实现上就是点播的逻辑了

（1）先通过命令从原视频文件生成 m3u8 以及 ts 的完整文件片段

```
ffmpeg -i input.mp4 -c:v libx264 -c:a aac -f hls -hls_time 10 -hls_list_size 0 output.m3u8
```

（2）将生成的文件列表置于hmtl下面的目录下


# 4、参考资料

https://blog.csdn.net/liwangcuihua/article/details/109532549