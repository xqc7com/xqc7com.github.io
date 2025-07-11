---
categories:
- 默认分类
date: '2025-01-16T11:29:00'
description: ''
draft: false
image: ''
slug: catch-server-https-packages
tags:
- php
- https
- phpstudy
- 抓包
title: 配置web服务端对https进行抓包
cover: /archives/catch-server-https-packages/20250114112750360.png
---

之前提到可以抓取浏览器发起的 https 请求包，有时候需要抓取服务器端发起的 https 请求包

例如对于一个庞大的 web 项目，怎么抓取服务端中主动发起的 https 请求呢？

## 检查版本支持

这里以 phpstudy 为例，当在 php 代码主动发起一个 https 请求，那么其执行路径是

php代码 --> curl 组件（C代码） --> openssl（C代码）

在站点下增加一个 phpinfo.php 文件

```php
<?php
phpinfo();
```

访问 phpinfo 地址，查看使用的 openssl 版本支持情况

![](/archives/catch-server-https-packages/20250114112750360.png)

SSLKEYLOGFILE 在 OpenSSL 1.1.1 以及更高的版本中引入的，因此该版本是支持 https 报文抓包的

对 SSLKEYLOGFILE 的配置 ，可以参考 https://blog.csdn.net/weixin_53109623/article/details/145132550

## 测试抓包情况

通过进程列表可以知道，在 phpstudy 中是使用 php-cgi 执行 php 脚本的

![](/archives/catch-server-https-packages/20250114152313721.png)

新建一个 test_ssl.php 文件，输入以下内容，使用 `php-cgi -f test_ssl.php` 直接执行脚本

发现 SSLKEYLOGFILE 文件可以被正常写入 TLS 加密密钥信息的 

但是将该文件放置于站点的目录下，使用浏览器的方式进行访问，SSLKEYLOGFILE 文件并没有被写入加密密钥信息

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://www.baidu.com");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);  // 禁用 SSL 验证（用于调试）
curl_exec($ch);
curl_close($ch);
```

## 问题分析

因为出于安全考虑，apache 在启动子进程的时候，并没有将所有的环境变量传递给 php-cgi 子进程

通过 phpinfo.php 页面中，可以查看到，仅有有限的部分环境变量别传给了子进程

这里通过浏览器访问 test_ssl.php 的请求抓包，需要的 SSLKEYLOGFILE 环境变量就没有传给子进程

![](/archives/catch-server-https-packages/20250116103130047.png)

## 配置抓包

在 apache 的配置环境变量传递给子进程有两种方式，分别是 SetEnv/PassEnv 以及 FcgidInitialEnv

### SetEnv/PassEnv 传递环境变量

在 apache 的配置文件 httpd.conf 中最后增加配置，然后重启 apache 生效

```
SetEnv SSLKEYLOGFILE C:\\SSL\\KEY.LOG
```

浏览器请求 phpinfo 页面，显示传递的环境变量出现在 `PHP Variables` 的 `$_ENV` 数组中

![](/archives/catch-server-https-packages/20250116103645899.png)

`$_ENV` 存储的值是 php 中的环境变量，可以被 php 代码的 getenv 函数识别出来

但是这个是 php 中的环境变量，只在 php 环境中有效，并不能被底层 C 代码识别为系统环境变量

底层 C 代码使用的是系统函数 GetEnvironmentVariable 获取到环境变量，因此该设置对 C 代码是无效的

### FcgidInitialEnv 传递环境变量

在 apache 的配置文件 httpd.conf 中最后增加配置，然后重启 apache 生效

```
FcgidInitialEnv SSLKEYLOGFILE "C:\\SSL\\KEY.LOG"
```

浏览器请求 phpinfo 页面，显示传递的环境变量出现在 `Environmnet` 的记录中

![](/archives/catch-server-https-packages/20250116110843431.png)

这种方式配置传递的环境变量，可以被 C 代码正确识别，因此请求 test_ssl.php 页面时密钥信息被正确写入

## 子进程的环境变量

当一个进程启动的时候，main 方法的的签名有三个参数，envp 参数表示环境变量

如果不做特别设置的话，envp 的值就是系统环境变量的集合

```c
int main(int argc, char *argv[], char *envp[]) {
    ...
}
```


当父进程通过 CreateProcess 创建子进程的时候，可以通过第 7 个参数来控制环境变量

NULL 表示继承父进程的所有环境变量，否则就是指定有限的环境变量传递给子进程

```c
    // 调用CreateProcess来创建子进程
    if (CreateProcess(
            NULL,               // 应用程序路径
            "child_program",     // 子进程的命令行
            NULL,               // 进程安全属性
            NULL,               // 线程安全属性
            FALSE,              // 是否继承父进程的句柄
            CREATE_NEW_CONSOLE, // 启动新控制台
            NULL,               // 子进程的环境变量（NULL表示继承父进程的环境变量）
            NULL,               // 当前工作目录
            &si,                // 启动信息
            &pi                 // 进程信息
        )) {
        printf("子进程创建成功\n");
    } else {
        printf("子进程创建失败: %d\n", GetLastError());
    }
```
