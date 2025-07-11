---
categories:
- 默认分类
date: '2025-06-07T13:54:33'
description: ''
draft: false
image: ''
slug: rsa-encrypt
tags:
- algorithm
title: 非对称加密rsa算法的理解
---

## RSA原理

RSA 利用了大质数分解困难的数学特性

1、随机选两个大的质数 `p` 和 `q`，要求 1024 bit 或 2048 bit 的长度，这是非常非常大的数值

2、计算 `n = p × q`，这个 `n` 是公钥的一部

   计算欧拉函数 `φ(n) = (p - 1) × (q - 1)`，这里的 `φ(n)` 是私密的

3、根据 `p` 和 `q` 算出一个私钥 `d` 和一个公钥 `e`，让它们满足一些数学关系，使得：

用 `e` 加密的数据，可以用 `d` 解密，反过来也可以用 `d` 加密再用 `e` 解密（签名验证）

这里的 `e` 需要满足和 `φ(n)` 是互质的，实际上 RSA 常用的 `e = 65537`，这个质数保证了安全和效率

`e` 和 `d` 的数学关系满足 `e * d` 除以 `φ(n)` 余数为 1 ，表达式为 `e * d = 1 + k * φ(n)`

需要注意的是这里的 `e` 是指数，因此计算结果也是一个非常庞大的数值

保密的信息 `p`、`q`、`φ(n)`、`d`，公开的信息 `n`、`e`；公钥就是 (n, e)，私钥就是 (n, d)

因为 `n` 是一个非常大的整数，在不知道 `p`、`q` 的情况下，分解出其两个质因数是几乎不可能的

分解 1024 bit 的 `n` 为两个质因数需要几年的时间持续计算，2048 bit 的 `n` 分解耗时不可预估


## RSA栗子

举个栗子，这里便于理解选择两个小的数值

1、选择两个质数：`p = 3, q = 11`

2、`n = 3 × 11 = 33`

3、选择 `e = 3`（和 φ(n) = (p - 1) * (q - 1) = 20 互质）

4、计算 `d = 7`（满足 3 × 7 ≡ 1 (mod 20)）

公钥为 `(e=3, n=33)`

私钥为 `(d=7, n=33)`

加密消息：比如明文是 `4`

加密过程：`4^3 mod 33 = 64 mod 33 = 31`

解密过程：`31^7 mod 33 = 4`（回到了原文）


## 加深理解

生成私钥 private.key 文件

```shell
openssl genrsa -out private.key 2048
```

生成公钥 public.key 文件

```shell
openssl rsa -in private.key -pubout -out public.key
```

输出公钥的内容

```shell
openssl rsa -pubin -text -modulus -in public.key
```

公钥内容如下，Exponent 也就是 rsa 算法中的 e，Modulus 就是 n，为两个大质数相乘的结果

```shell
Public-Key: (2048 bit)
Modulus:
    00:d3:22:cf:d3:34:05:6b:2b:70:5c:ad:5e:17:c9:
    26:f0:14:68:22:55:14:9f:a1:d4:83:61:82:59:d0:
    56:82:17:d0:f3:ef:25:92:f3:21:c2:8f:1e:69:90:
    69:2e:bc:60:16:10:c2:f1:bc:5b:33:3a:42:a7:f1:
    a1:65:1f:96:26:d0:91:c3:24:2c:12:ad:39:d7:76:
    02:c0:da:3a:a2:df:52:9a:b3:a3:43:c2:c2:71:9b:
    2d:62:df:e4:49:e7:cf:03:bf:fe:25:2b:4b:1b:b3:
    58:13:11:e2:86:b8:3c:aa:f3:0b:96:63:0d:ed:2d:
    a6:df:ab:3a:8d:f6:ad:3b:3f:9c:44:f0:7c:d9:7c:
    7a:6b:5c:67:6b:e0:3e:68:4a:80:fe:0b:da:55:24:
    1e:29:76:eb:f0:e0:05:29:5d:72:7b:1c:60:fb:84:
    ab:48:fa:bb:92:ed:49:d4:af:89:77:2f:3b:9d:88:
    a3:4c:be:45:cf:82:8b:61:5f:b9:a0:fb:4b:ef:82:
    d1:32:91:11:64:60:c5:eb:18:1a:35:e2:cc:26:4f:
    43:fc:a2:18:ee:7d:60:e1:e1:ea:78:06:d0:91:6b:
    af:31:da:04:cb:2d:ac:60:b9:47:42:28:f5:4f:95:
    2c:8b:86:53:6d:a7:d4:5f:73:7a:6e:cb:74:a3:ff:
    d1:65
Exponent: 65537 (0x10001)
Modulus=D322CFD334056B2B705CAD5E17C926F014682255149FA1D483618259D0568217D0F3EF2592F321C28F1E6990692EBC601610C2F1BC5B333A42A7F1A1651F9626D091C3242C12AD39D77602C0DA3AA2DF529AB3A343C2C2719B2D62DFE449E7CF03BFFE252B4B1BB3581311E286B83CAAF30B96630DED2DA6DFAB3A8DF6AD3B3F9C44F07CD97C7A6B5C676BE03E684A80FE0BDA55241E2976EBF0E005295D727B1C60FB84AB48FABB92ED49D4AF89772F3B9D88A34CBE45CF828B615FB9A0FB4BEF82D13291116460C5EB181A35E2CC264F43FCA218EE7D60E1E1EA7806D0916BAF31DA04CB2DAC60B9474228F54F952C8B86536DA7D45F737A6ECB74A3FFD165
writing RSA key
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0yLP0zQFaytwXK1eF8km
8BRoIlUUn6HUg2GCWdBWghfQ8+8lkvMhwo8eaZBpLrxgFhDC8bxbMzpCp/GhZR+W
JtCRwyQsEq0513YCwNo6ot9SmrOjQ8LCcZstYt/kSefPA7/+JStLG7NYExHihrg8
qvMLlmMN7S2m36s6jfatOz+cRPB82Xx6a1xna+A+aEqA/gvaVSQeKXbr8OAFKV1y
exxg+4SrSPq7ku1J1K+Jdy87nYijTL5Fz4KLYV+5oPtL74LRMpERZGDF6xgaNeLM
Jk9D/KIY7n1g4eHqeAbQkWuvMdoEyy2sYLlHQij1T5Usi4ZTbafUX3N6bst0o//R
ZQIDAQAB
-----END PUBLIC KEY-----
```

输出私钥的内容

```shell
openssl rsa -in private.key -text -modulus
```

私钥的内容输出如下

其中 Private-Key 这行表示使用的是 2048 bit 长度， 2 个大素数

modulus 是模数，也就是前面的 n，和公钥的输出是一致的，publicExponent 也就是 e 为一个常数 65537

privateExponent 私钥指数，也就是前面说的 d，prime1 和 prime2 表示素数 1 和素数 2

exponent1 和 exponent2 是指数 1 和指数 2 ，用于加速计算的值，分别是 d mod (p-1) 和 d mod (q-1)

exponent1 和 exponent2 用于加速解密和签名计算的中国剩余定理（CRT）优化

coefficient 是 q⁻¹ mod p，也用于 CRT 优化，使解密和签名计算更快


```shell
Private-Key: (2048 bit, 2 primes)
modulus:
    00:d3:22:cf:d3:34:05:6b:2b:70:5c:ad:5e:17:c9:
    26:f0:14:68:22:55:14:9f:a1:d4:83:61:82:59:d0:
    56:82:17:d0:f3:ef:25:92:f3:21:c2:8f:1e:69:90:
    69:2e:bc:60:16:10:c2:f1:bc:5b:33:3a:42:a7:f1:
    a1:65:1f:96:26:d0:91:c3:24:2c:12:ad:39:d7:76:
    02:c0:da:3a:a2:df:52:9a:b3:a3:43:c2:c2:71:9b:
    2d:62:df:e4:49:e7:cf:03:bf:fe:25:2b:4b:1b:b3:
    58:13:11:e2:86:b8:3c:aa:f3:0b:96:63:0d:ed:2d:
    a6:df:ab:3a:8d:f6:ad:3b:3f:9c:44:f0:7c:d9:7c:
    7a:6b:5c:67:6b:e0:3e:68:4a:80:fe:0b:da:55:24:
    1e:29:76:eb:f0:e0:05:29:5d:72:7b:1c:60:fb:84:
    ab:48:fa:bb:92:ed:49:d4:af:89:77:2f:3b:9d:88:
    a3:4c:be:45:cf:82:8b:61:5f:b9:a0:fb:4b:ef:82:
    d1:32:91:11:64:60:c5:eb:18:1a:35:e2:cc:26:4f:
    43:fc:a2:18:ee:7d:60:e1:e1:ea:78:06:d0:91:6b:
    af:31:da:04:cb:2d:ac:60:b9:47:42:28:f5:4f:95:
    2c:8b:86:53:6d:a7:d4:5f:73:7a:6e:cb:74:a3:ff:
    d1:65
publicExponent: 65537 (0x10001)
privateExponent:
    66:32:51:7a:1f:92:07:df:cc:d1:6f:31:3e:3e:25:
    54:cb:eb:e3:c2:5e:eb:2d:bf:d9:a0:17:22:36:0f:
    c9:84:91:a5:a1:3a:04:b9:1e:bc:37:de:36:a6:a9:
    e2:ef:57:6b:16:cd:e5:88:90:74:69:5c:de:41:bd:
    27:5f:74:a4:71:0c:3c:f2:83:4a:bf:02:62:62:42:
    ce:ea:52:bb:87:71:4a:64:6d:40:5d:43:15:0e:51:
    97:ac:5b:a9:d2:44:87:c2:24:d8:04:ee:a4:07:d9:
    37:d1:ce:5d:fb:4b:92:4b:76:6e:62:9f:d9:0f:e1:
    d8:1d:df:87:db:c0:da:0d:fd:04:f0:5f:aa:c3:6d:
    19:27:aa:fe:76:fe:da:e7:74:9e:12:0c:00:a8:b2:
    23:fa:9c:af:13:c0:99:14:4d:f7:c7:cc:79:b5:48:
    65:6e:8f:c0:66:87:3f:17:db:4f:a8:9e:5c:e7:75:
    6c:26:ed:b1:ce:28:09:02:e8:6a:34:ec:ad:61:f1:
    c8:b9:74:d0:11:5e:00:8d:a0:0b:d1:8c:0f:b0:ca:
    3e:b8:01:11:e4:58:e9:33:51:85:5c:43:79:32:4a:
    0a:d9:ec:bc:19:04:23:d0:76:73:55:ff:6b:9b:76:
    1a:a3:03:09:ae:91:26:b2:74:dd:e0:88:21:f3:d1:
    79
prime1:
    00:ee:fc:93:1b:5e:76:49:51:96:e3:81:b3:dd:9d:
    e2:cd:b0:28:0c:1d:28:71:46:6f:30:eb:eb:52:1e:
    4e:d1:d3:cd:3f:63:a7:71:11:8f:56:7e:4f:13:a7:
    8a:ee:1e:64:41:6c:e7:40:4c:85:93:e7:3f:9d:87:
    e8:9a:e3:f8:8e:7b:7f:25:0f:25:c8:f6:f2:c0:90:
    d9:ab:71:27:74:da:22:4b:79:b0:2f:cc:2c:ba:30:
    e0:6d:2b:39:5b:55:f8:59:0d:8a:55:4f:f7:49:59:
    69:3e:49:e7:9a:a5:36:b2:b7:c4:73:60:1f:fe:f0:
    76:ec:fc:76:f1:de:1a:36:5f
prime2:
    00:e2:2a:ab:f2:4c:2d:2b:ea:3b:7f:c4:00:77:4e:
    9b:6a:e3:0d:6a:18:5f:fa:f7:bf:87:ae:09:89:fd:
    ed:88:1a:85:15:fe:0c:c2:6f:24:da:40:31:c0:90:
    cc:c8:dd:bd:8c:68:75:fb:a8:7f:1d:af:8b:c1:4b:
    05:30:de:f5:7b:57:22:6d:1f:1d:a2:d5:29:57:fd:
    b7:0b:30:15:6b:a8:12:3a:17:da:44:57:df:7c:4f:
    94:e4:6a:15:29:85:d7:bc:1b:45:e4:46:98:eb:c3:
    04:bd:20:e4:8a:b3:b5:05:a6:2b:18:8d:dd:5a:a0:
    e9:51:20:bf:05:22:38:26:bb
exponent1:
    3a:33:18:40:1a:09:04:61:f2:35:05:69:20:17:4b:
    1c:7c:41:c4:71:75:5f:e0:9f:43:72:b0:a4:16:ed:
    6a:fc:01:87:e6:64:e8:8c:36:34:02:1e:8f:d2:c5:
    6a:a7:cc:12:82:ca:ee:45:b4:62:08:76:dd:8e:33:
    7f:44:f5:4a:fd:98:41:16:27:45:81:9e:2c:77:1a:
    0b:3e:4b:35:91:c9:b8:47:b2:38:71:a8:92:cf:44:
    58:51:a6:6e:2f:c9:83:26:61:01:d5:af:8b:15:53:
    23:f0:2b:8e:e5:9d:24:78:cc:46:ac:aa:1e:13:c1:
    62:85:39:12:3d:dc:74:51
exponent2:
    55:f4:17:b3:17:26:57:b9:46:71:91:41:08:16:b4:
    d4:53:84:46:9d:0a:e5:2b:80:fc:04:b5:95:5f:0f:
    06:19:e6:18:6c:9b:d6:cd:3c:b9:41:8a:66:ff:e1:
    04:39:d9:8e:e2:28:6c:c3:25:c4:57:72:0a:bd:03:
    35:06:97:4f:0f:d7:82:97:3f:c1:21:b7:fb:bb:ed:
    f3:ef:8b:44:85:f4:9f:65:6f:4b:68:06:04:8d:8e:
    2d:9c:ef:7b:ff:64:f5:15:7c:63:7c:3d:23:e4:d3:
    09:39:d6:01:ac:b8:90:74:0d:8e:e0:63:8e:cc:f6:
    bf:21:6d:d7:7a:a0:d2:7f
coefficient:
    34:98:29:54:6a:b9:3d:f4:97:07:83:d6:53:ee:cb:
    8e:30:a5:f8:d8:1e:7b:60:8f:fb:43:b0:aa:d0:94:
    e2:11:de:7b:34:2e:c7:df:19:fc:5c:87:12:fe:a2:
    cb:42:5a:f1:c7:01:21:2d:31:dc:b9:f6:21:ee:0f:
    8d:a9:26:6f:2d:a6:7e:9e:c1:63:a6:5f:65:ef:3a:
    c9:85:80:09:ba:58:ed:a6:c3:8b:46:a3:88:64:33:
    34:2e:1a:b0:ce:91:08:85:27:95:a8:43:c6:71:df:
    29:38:1a:10:b9:b4:81:16:4c:98:a7:44:73:af:ad:
    c2:9a:6c:ba:59:c0:13:c4
Modulus=D322CFD334056B2B705CAD5E17C926F014682255149FA1D483618259D0568217D0F3EF2592F321C28F1E6990692EBC601610C2F1BC5B333A42A7F1A1651F9626D091C3242C12AD39D77602C0DA3AA2DF529AB3A343C2C2719B2D62DFE449E7CF03BFFE252B4B1BB3581311E286B83CAAF30B96630DED2DA6DFAB3A8DF6AD3B3F9C44F07CD97C7A6B5C676BE03E684A80FE0BDA55241E2976EBF0E005295D727B1C60FB84AB48FABB92ED49D4AF89772F3B9D88A34CBE45CF828B615FB9A0FB4BEF82D13291116460C5EB181A35E2CC264F43FCA218EE7D60E1E1EA7806D0916BAF31DA04CB2DAC60B9474228F54F952C8B86536DA7D45F737A6ECB74A3FFD165
writing RSA key
3FFD165
writing RSA key
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDTIs/TNAVrK3Bc
rV4XySbwFGgiVRSfodSDYYJZ0FaCF9Dz7yWS8yHCjx5pkGkuvGAWEMLxvFszOkKn
8aFlH5Ym0JHDJCwSrTnXdgLA2jqi31Kas6NDwsJxmy1i3+RJ588Dv/4lK0sbs1gT
EeKGuDyq8wuWYw3tLabfqzqN9q07P5xE8HzZfHprXGdr4D5oSoD+C9pVJB4pduvw
4AUpXXJ7HGD7hKtI+ruS7UnUr4l3LzudiKNMvkXPgothX7mg+0vvgtEykRFkYMXr
GBo14swmT0P8ohjufWDh4ep4BtCRa68x2gTLLaxguUdCKPVPlSyLhlNtp9Rfc3pu
y3Sj/9FlAgMBAAECggEAZjJReh+SB9/M0W8xPj4lVMvr48Je6y2/2aAXIjYPyYSR
paE6BLkevDfeNqap4u9XaxbN5YiQdGlc3kG9J190pHEMPPKDSr8CYmJCzupSu4dx
SmRtQF1DFQ5Rl6xbqdJEh8Ik2ATupAfZN9HOXftLkkt2bmKf2Q/h2B3fh9vA2g39
BPBfqsNtGSeq/nb+2ud0nhIMAKiyI/qcrxPAmRRN98fMebVIZW6PwGaHPxfbT6ie
XOd1bCbtsc4oCQLoajTsrWHxyLl00BFeAI2gC9GMD7DKPrgBEeRY6TNRhVxDeTJK
CtnsvBkEI9B2c1X/a5t2GqMDCa6RJrJ03eCIIfPReQKBgQDu/JMbXnZJUZbjgbPd
neLNsCgMHShxRm8w6+tSHk7R080/Y6dxEY9Wfk8Tp4ruHmRBbOdATIWT5z+dh+ia
4/iOe38lDyXI9vLAkNmrcSd02iJLebAvzCy6MOBtKzlbVfhZDYpVT/dJWWk+Seea
pTayt8RzYB/+8Hbs/Hbx3ho2XwKBgQDiKqvyTC0r6jt/xAB3Tptq4w1qGF/697+H
rgmJ/e2IGoUV/gzCbyTaQDHAkMzI3b2MaHX7qH8dr4vBSwUw3vV7VyJtHx2i1SlX
/bcLMBVrqBI6F9pEV998T5TkahUphde8G0XkRpjrwwS9IOSKs7UFpisYjd1aoOlR
IL8FIjgmuwKBgDozGEAaCQRh8jUFaSAXSxx8QcRxdV/gn0NysKQW7Wr8AYfmZOiM
NjQCHo/SxWqnzBKCyu5FtGIIdt2OM39E9Ur9mEEWJ0WBnix3Ggs+SzWRybhHsjhx
qJLPRFhRpm4vyYMmYQHVr4sVUyPwK47lnSR4zEasqh4TwWKFORI93HRRAoGAVfQX
sxcmV7lGcZFBCBa01FOERp0K5SuA/AS1lV8PBhnmGGyb1s08uUGKZv/hBDnZjuIo
bMMlxFdyCr0DNQaXTw/Xgpc/wSG3+7vt8++LRIX0n2VvS2gGBI2OLZzve/9k9RV8
Y3w9I+TTCTnWAay4kHQNjuBjjsz2vyFt13qg0n8CgYA0mClUark99JcHg9ZT7suO
MKX42B57YI/7Q7Cq0JTiEd57NC7H3xn8XIcS/qLLQlrxxwEhLTHcufYh7g+NqSZv
LaZ+nsFjpl9l7zrJhYAJuljtpsOLRqOIZDM0LhqwzpEIhSeVqEPGcd8pOBoQubSB
FkyYp0Rzr63Cmmy6WcATxA==
-----END PRIVATE KEY-----
```
