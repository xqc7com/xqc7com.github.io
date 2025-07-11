---
categories:
- 默认分类
date: '2024-12-30T15:14:00'
description: ''
draft: false
image: ''
slug: cert-install
tags:
- https
title: 域名通配证书申请与安装
cover: /archives/cert-install/image-zdft.png
---

## 安装 acme 程序

安装命令：`curl <https://get.acme.sh> | sh -s email=admin@abc.com`

如果使用了 `curl <https://get.acme.sh> | sh` 安装而没有指定邮箱的话，使用下面这个命令登记邮箱

```shell
acme.sh --register-account -m admin@abc.com
```

安装完 acme 后，crontab会增加一条的记录，以保证后续证书过期自动更新

```
8 21 * * * "/root/.acme.sh"/acme.sh --cron --home "/root/.acme.sh" > /dev/null
```

## 申请 API KEY

登录域名提供商的站点，如namesilo，打开页面 [https://www.namesilo.com/account/api-manager](https://www.namesilo.com/account/api-manager)

勾选第二个框，然后点击提交，会生成一个 API key，如：**7ta0fg6pbw8dtops02irop**，申请证书需要用到这个key

![](/archives/cert-install/image-zdft.png)

生成 key 的显示如下，提示：Your new API key is:

![](/archives/cert-install/image-wqfw.png)

## 生成泛域名证书

登录上购买的服务器，配置Namesilo\_Key环境变量，将 xxxxx 替换为你刚申请的 API key

```shell
export Namesilo_Key="xxxxx"
```

退出终端重新登录使得环境变量生效，运行配置命令

```shell
acme.sh --issue --dns dns_namesilo -d abc.com -d *.abc.com --dnssleep 900
```

这里的`dnssleep`的作用是在进行 DNS 验证时，等待一段时间以确保域名服务器完成对 DNS 记录的更新和传播。

如果不进行适当的等待，在验证过程中可能会因为 DNS 记录尚未完全传播而导致验证失败，这里使用默认的 900s 进行等待。

```shell
root@C20240916082764:~# acme.sh --issue --dns dns_namesilo -d abc.com -d *.abc.com --dnssleep 900 
[Thu Sep 19 07:41:45 UTC 2024] Using CA: https://acme.zerossl.com/v2/DV90
[Thu Sep 19 07:41:45 UTC 2024] Creating domain key
[Thu Sep 19 07:41:45 UTC 2024] The domain key is here: /root/.acme.sh/abc.com_ecc/abc.com.key
[Thu Sep 19 07:41:45 UTC 2024] Multi domain='DNS:abc.com,DNS:*.abc.com'
[Thu Sep 19 07:41:52 UTC 2024] Getting webroot for domain='abc.com'
[Thu Sep 19 07:41:52 UTC 2024] Getting webroot for domain='*.abc.com'
[Thu Sep 19 07:41:52 UTC 2024] Adding TXT value: tT8LHGbMGQW2NM0OM21h-F-hQCVW73_YI2YJLcH2CBQ for domain: _acme-challenge.abc.com
[Thu Sep 19 07:41:53 UTC 2024] Successfully added TXT record, ready for validation.
[Thu Sep 19 07:41:53 UTC 2024] The TXT record has been successfully added.
[Thu Sep 19 07:41:53 UTC 2024] Adding TXT value: bZiN3u8by-vcPAv1ParuL1z1rdi3avecjoIHa10gRyA for domain: _acme-challenge.abc.com
[Thu Sep 19 07:41:54 UTC 2024] Successfully added TXT record, ready for validation.
[Thu Sep 19 07:41:54 UTC 2024] The TXT record has been successfully added.
[Thu Sep 19 07:41:54 UTC 2024] Sleeping for 900 seconds to wait for the the TXT records to take effect
...
[Thu Sep 19 07:56:58 UTC 2024] Verifying: abc.com
[Thu Sep 19 07:57:00 UTC 2024] The replay nonce is not valid, let's get a new one. Sleeping for 1 seconds.
[Thu Sep 19 07:57:04 UTC 2024] Processing. The CA is processing your order, please wait. (1/30)
[Thu Sep 19 07:57:09 UTC 2024] Success
[Thu Sep 19 07:57:09 UTC 2024] Verifying: *.abc.com
[Thu Sep 19 07:57:10 UTC 2024] Processing. The CA is processing your order, please wait. (1/30)
[Thu Sep 19 07:57:15 UTC 2024] Success
[Thu Sep 19 07:57:15 UTC 2024] Removing DNS records.
[Thu Sep 19 07:57:15 UTC 2024] Removing txt: tT8LHGbMGQW2NM0OM21h-F-hQCVW73_YI2YJLcH2CBQ for domain: _acme-challenge.abc.com
[Thu Sep 19 07:57:16 UTC 2024] Successfully retrieved the record id for ACME challenge.
[Thu Sep 19 07:57:16 UTC 2024] Successfully removed the TXT record.
[Thu Sep 19 07:57:16 UTC 2024] Successfully removed
[Thu Sep 19 07:57:16 UTC 2024] Removing txt: bZiN3u8by-vcPAv1ParuL1z1rdi3avecjoIHa10gRyA for domain: _acme-challenge.abc.com
[Thu Sep 19 07:57:17 UTC 2024] Successfully retrieved the record id for ACME challenge.
[Thu Sep 19 07:57:18 UTC 2024] Successfully removed the TXT record.
[Thu Sep 19 07:57:18 UTC 2024] Successfully removed
[Thu Sep 19 07:57:18 UTC 2024] Verification finished, beginning signing.
[Thu Sep 19 07:57:18 UTC 2024] Let's finalize the order.
[Thu Sep 19 07:57:18 UTC 2024] Le_OrderFinalize='https://acme.zerossl.com/v2/DV90/order/jz6jMdmrBaAKH1slDPXgPg/finalize'
[Thu Sep 19 07:57:19 UTC 2024] Order status is 'processing', let's sleep and retry.
[Thu Sep 19 07:57:19 UTC 2024] Sleeping for 15 seconds then retrying
[Thu Sep 19 07:57:35 UTC 2024] Polling order status: https://acme.zerossl.com/v2/DV90/order/jz6jMdmrBaAKH1slDPXgPg
[Thu Sep 19 07:57:37 UTC 2024] Downloading cert.
[Thu Sep 19 07:57:37 UTC 2024] Le_LinkCert='https://acme.zerossl.com/v2/DV90/cert/B8XxRxY3M8inUUmDN3_xYA'
[Thu Sep 19 07:57:38 UTC 2024] Cert success.
-----BEGIN CERTIFICATE-----
MIID/DCCA4KgAwIBAgIQCFFlR0WxAKEv+kkkPzB5gDAKBggqhkjOPQQDAzBLMQsw
CQYDVQQGEwJBVDEQMA4GA1UEChMHWmVyb1NTTDEqMCgGA1UEAxMhWmVyb1NTTCBF
...
...
...
SM49BAMDA2gAMGUCMQDzI+dYROEQt+o1zcdfGZuW7dgV2PCQWXVzt4YvsGr6nPlt
vfMFHZW/6CVUzblMDcECMF2z5QmK9MxoXCm1jJxwDKdcSIpPoDhi1L/yAdNywyht
+MwLOrnl+CQp1dqrYn2+KA==
-----END CERTIFICATE-----
[Thu Sep 19 07:57:38 UTC 2024] Your cert is in: /root/.acme.sh/abc.com_ecc/abc.com.cer
[Thu Sep 19 07:57:38 UTC 2024] Your cert key is in: /root/.acme.sh/abc.com_ecc/abc.com.key
[Thu Sep 19 07:57:38 UTC 2024] The intermediate CA cert is in: /root/.acme.sh/abc.com_ecc/ca.cer
[Thu Sep 19 07:57:38 UTC 2024] And the full-chain cert is in: /root/.acme.sh/abc.com_ecc/fullchain.cer
[Thu Sep 19 07:57:38 UTC 2024] And the full-chain cert is in: /root/.acme.sh/abc.com_ecc/fullchain.cer
```

申请成功后，会生成 4 个证书文件

abc.com.cer：这是域名 abc.com 的证书文件，它包含了由 ACME 机构签发的公钥证书，用于验证您的站点的身份。

abc.com.key：这是与 abc.com.cer 对应的私钥文件，私钥用于对传输到您的站点的数据进行加密和解密。

ca.cer：这是证书颁发机构（CA）的根证书文件。CA 是负责签发和验证证书的机构，它的根证书用于验证您的站点证书的可信性。

fullchain.cer：这是 abc.com.cer 和 ca.cer 的组合文件，也称为完整链证书，包含了站点证书和 CA 的证书链，用于验证站点证书的有效性。

## 证书安装

证书申请下来后，使用 `acme.sh --install-cert` 参数进行安装证书，也可以手工拷贝证书到指定位置

```shell
acme.sh --install-cert -d abc.com \
--key-file       /etc/nginx/cert/key.pem  \
--fullchain-file /etc/nginx/cert/cert.pem \
--reloadcmd     "systemctl restart nginx"
```

key-file 指示将私钥文件 abc.com.cer 同步到 /etc/nginx/cert/key.pem 文件

fullchain-file 指示将完整链证书文件 fullchain.cer 同步到 /etc/nginx/cert/cert.pem 文件

reloadcmd 指示了安装证书完毕的时候，重启 nginx 的指令

  

如果 nginx 没有配置 ssl 的话，需要先增加 ssl 配置指定路径，路径和上述安装证书的路径一致

nginx 的配置增加一个 server 块配置 443，server\_name 中可以任意添加配置子域名

```shell
    server {
        listen 443 ssl;
        server_name abc.com www.abc.com tools.abc.com;

        ssl_certificate /etc/nginx/cert/cert.pem;
        ssl_certificate_key /etc/nginx/cert/key.pem;

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
    }
```

参考

[https://github.com/acmesh-official/acme.sh/wiki/说明](https://github.com/acmesh-official/acme.sh/wiki/%E8%AF%B4%E6%98%8E)

[https://github.com/acmesh-official/acme.sh/wiki/dnsapi#dns\_namesilo](https://github.com/acmesh-official/acme.sh/wiki/dnsapi#dns_namesilo)
