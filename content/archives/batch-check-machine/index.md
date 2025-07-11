---
categories:
- 默认分类
date: '2024-12-29T10:54:00'
description: ''
draft: false
image: ''
slug: batch-check-machine
tags:
- linux
- c++
title: 批量检测机器是否可达
---

准备一个配置文件 ip.txt ，每一行记录分别是 ip port（或者port统一命令行读取），中间用空格间隔

将下面 c++ 代码编译生成执行文件 testconn

```c++
#include <stdio.h>
#include <unistd.h>

main(int argc, char** argv)
{
    if (argc != 3)
        _exit(0);
 
    int fd[2];
 
    alarm(1);
    pipe(fd);
    close(fd[1]);
    dup2(fd[0], STDIN_FILENO);
    dup2(fd[0], STDERR_FILENO);
 
    execlp("telnet", "telnet", argv[1],argv[2], 0);
}
```

增加脚本处理，从文件读入地址以及端口，然后进行连接测试返回值

```shell
while read line
do
    result=`timeout 1 ./testconn $line|grep Connected|wc -l`
    echo "Now test:$line result:$result"
done < ./ip.txt
```

也可以直接使用这个脚本用 telnet 进行处理，timeout 设置稍微长一点，如果时间过短的话，可能导致连接还没建立就退出了

```shell
while read line
do
    result=`echo Quit|timeout 3 telnet $line 2>/dev/null|grep Connected|wc -l`
    echo "Now test:$line result:$result"
done < ./ip.txt
```
