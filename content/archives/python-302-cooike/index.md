---
categories:
- 默认分类
date: '2025-02-27T09:23:35'
description: ''
draft: false
image: ''
slug: python-302-cooike
tags:
- python
- cookie
- 重定向
title: python在302重定向后的cookie发送
cover: /archives/python-302-cooike/e2eui3.png
---

使用 python 的 requests.get 发起请求的时候，中间请求进行了 302 跳转

在发起请求的时候，是设置了 cookie 的，第一个请求携带了 cookie，但是 302 跳转后的请求却没有携带 cookie，导致 500 失败了

这里请求的是 https ，设置了 wireshark 抓包，可以参考 [这里](https://blog.qc7.org/archives/catch-python-https-packages)  ，在 mitmproxy 中也是可以查看报文的

第一次发起的请求携带了 cookie，可以正常响应 302，并返回了 Location 地址 

![](/archives/python-302-cooike/e2eui3.png)

重定向到 Location 地址后，cookie 并不会携带，导致请求失败

![](/archives/python-302-cooike/e5y5j8.png)

请求的代码如下，使用的是 get 参数的默认值 allow_redirects = True 自动处理重定向

```python
useragent = "..."
cookie = "..."
referer = "..."

def HttpGet(url, referer):
    headers = {
            'user-agent'               : useragent,
            'cookie'                   : cookie,
            'referer'                  : referer
        }

    proxies = {
        'http': 'http://127.0.0.1:8080',
        'https': 'http://127.0.0.1:8080'
    }
    response = requests.get(url, proxies=proxies, headers=headers, verify=False)
    print("resp code:", response.status_code)

```

修改为禁止重定向，并手动发起重定向后的请求，参考代码如下，修改后就可以在重定向后的请求中携带 cookie 了

```python
useragent = "..."
cookie = "..."
referer = "..."

def HttpGet(url, referer):
    headers = {
            'user-agent'               : useragent,
            'cookie'                   : cookie,
            'referer'                  : referer
        }

    proxies = {
        'http': 'http://127.0.0.1:8080',
        'https': 'http://127.0.0.1:8080'
    }

    realUrl = url
    response = None
    while True:
        if response != None:
            location = response.headers.get("Location")
            if location == None:
                break
            realUrl = url + location

        response = requests.get(realUrl, proxies=proxies, headers=headers, verify=False, allow_redirects=False)
        print("resp code:", response.status_code)


```



