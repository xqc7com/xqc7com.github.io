---
categories:
- 默认分类
date: '2024-11-25T16:05:18'
description: ''
draft: false
image: ''
slug: telnet-transfer
tags:
- linux
title: 使用telnet传输文件
---

部分情况下，目标机器上没安装任何可以传输文件的命令，也没有任何权限进行安装，但是有 telnet 命令

如果需要传输文件，那么会比较麻烦，这里通过 python 的方式进行传输文件

传输文件的方式：从本地机器（python服务端）到目标机器（telnet客户端）

**整体逻辑**（需要确保目标机器可以连接到本地机器）

1、本地机器启动一个 python 监听

2、目标机器 telnet 连接到本地机器

3、本地机器等待到监听后，读取文件发送到 socket 流

4、目标机器 telnet 客户端接收数据流，写到目标文件

下面是网上找到传输文件的例子，这里还进行 base64 编码（可以去掉），实际使用根据需要调整

```python
import socket
import base64
port     = 10005
filename = 'filename.txt'

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.bind(('0.0.0.0', port))
sock.listen(5)
while True:
    connection,address = sock.accept()
    try:
        f = file(filename)
        content = base64.b64encode(f.read())
        connection.sendall(content.strip())
        connection.close()
    except socket.timeout:
        print 'time out'
    connection.close()
```

在目标机器上启动 telnet 连接到 python 监听的服务端，将接收到的数据流存成本地文件

```shell
telnet 101.201.189.82 10005 | tee > temp.txt
base64 -d < temp.txt | tee > filename.txt   #该命令进行 base64 解码
```
