---
categories:
- 默认分类
date: '2025-01-14T10:39:00'
description: ''
draft: false
image: ''
slug: catch-client-https-packages
tags:
- https
- 抓包
- wireshark
title: wireshark开启对https密文抓包
cover: /archives/catch-client-https-packages/20250114092522435.png
---

通常情况下，wireshark只能抓取 http 的明文包，对于 https 的报文需要设置才能抓取

不设置的话，抓取到的都是 TLS 的报文，是加密了的，对调试十分困难

## 前言

提到 https 抓包，基本都绕不开一个 SSLKEYLOGFILE 的环境变量

SSLKEYLOGFILE 是由 Mozilla 开发团队首先引入的一个调试功能，随后被 Google Chrome 等浏览器采纳

并成为网络分析工具（如 Wireshark）的非正式行业惯例，并没有组织或者标准定义这个行为，是属于一个事实上的规范

由 wireshark + chrome 抓 https 包的原理大概就是

1、chrome 发起 https 请求的时候，会将站点的加密密钥信息存储到 SSLKEYLOGFILE 指定的文件中

2、wireshark 解析报文的时候，会从 SSLKEYLOGFILE 指定的文件中读取加密密钥信息，对加密报文进行解密 

因此第三方程序请求 https 报文时，如果需要使用 wireshark 进行解密报文，那么也得需要增加对 SSLKEYLOGFILE 的支持


## 增加环境变量

在环境变量中增加 SSLKEYLOGFILE 变量，值指定一个 KYE 文件路径，存储 TLS（传输层安全协议）会话的加密密钥信息

配置后，并在该路径下新建该文件 KEY.LOG

![](/archives/catch-client-https-packages/20250114092522435.png)

## 配置 wireshark

打开 wireshark，在菜单 “编辑” -> “首选项” 打开配置窗口，在左侧的协议树中展开 Protocols ，并找到 TLS 项

将刚配置的 SSLKEYLOGFILE 环境变量的文件名，补充到这里来 

![](/archives/catch-client-https-packages/20250114095404788.png)

## https 抓包

设置完毕后，开启 wireshark 对网卡进行抓包，重启 chrome 浏览器，访问 https 站点

在 wireshark 的输入框中输入 http2 ，就能抓到 https 的报文了

![](/archives/catch-client-https-packages/20250114094119352.png)


## 编码中的 https 抓包

这里以 go 为例，请求 https 的参考代码，实现对 https 报文抓取的应用

这里的关键步骤，就是增加了环境变量 SSLKEYLOGFILE 的支持

```go
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		logger.Error("new request err:", err)
		return "", err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.SetBasicAuth(username, password)

	var transport *http.Transport
	keyLogFile, err := os.OpenFile(os.Getenv("SSLKEYLOGFILE"), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err == nil {
		tlsConfig := &tls.Config{
			KeyLogWriter:       keyLogFile,
			InsecureSkipVerify: true, //自签证书不校验
		}
		transport = &http.Transport{
			TLSClientConfig: tlsConfig,
		}
	}
	defer keyLogFile.Close()

	client := &http.Client{}
	if transport != nil {
		client.Transport = transport
	} else {
		client.Transport = &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, //自签证书不校验
		}
	}

	resp, err := client.Do(req)
	if err != nil {
		logger.Error("http client do err:", err)
		return "", err
	}
	defer resp.Body.Close()

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Error("io ReadAll err:", err)
		return "", err
	}

	logger.Info("post request reply:", resp.Status)
	logger.Info("response text:\n", string(b))
```


