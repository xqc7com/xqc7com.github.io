---
categories:
- 默认分类
date: '2024-12-29T10:19:00'
description: ''
draft: false
image: ''
slug: rc4
tags:
- algorithm
title: RC4算法实现原理
---

参考视频 [https://www.bilibili.com/video/BV1994y1o7tj/](https://www.bilibili.com/video/BV1994y1o7tj/)

密钥 k，如值为 012345

初始 s 表，长度256数组，各原始值依次为 0,1,…,255

空间 t 表，长度为256数组，值依次为密钥 k 的扩容256长度，值依次为 012345012345…

依据 t 表打乱 s 表的元素，打乱的规则如下

```go
j := 0
for i :=0; i < 256; i++ {
    j = j + s[i] + t[i]  //计算待置换的 j 位置
    s[i], s[j] = s[j], s[i]
}
```

得到打乱后的 s 表后，计算密钥流，buff为待加密或解密的缓冲

```go
var i, j int = 0, 0 
for h:=0 ; h<len(buff); h++ {
    i = (i+1) % 256 
    j = (j + s[i]) % 256 //这里256为s表的固定长度
    s[i], s[j] = s[j], s[i] //s[i] 和 s[j] 值互换
    t = (s[i] + s[j]) % 256
    n = s[t]
    buff[h] ^= n  // 这里的 n 为密钥流，依次计算一个字节，所有值和buff换成等长
}
```

rc4算法目前已经不再安全https://www.rfc-editor.org/rfc/rfc7465

网上已经有破解rc4的视频演示 [https://www.youtube.com/watch?v=d8MtmKrXlKQ](https://www.youtube.com/watch?v=d8MtmKrXlKQ)
