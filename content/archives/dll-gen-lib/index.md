---
categories:
- 默认分类
date: '2024-12-30T13:59:00'
description: ''
draft: false
image: ''
slug: dll-gen-lib
tags:
- c++
title: 根据动态库生成对应的lib文件
---

一个 dll 动态库文件，编译的时候需要链接该库文件，如果没有提供 lib 文件，得先从 dll 生成对应的 lib 文件

这里以 Trojan-Qt5-Core 工程中的 trojan-qt5-core.dll 为参考例子，原工程的处理脚本如下

```shell
dumpbin /exports trojan-qt5-core.dll > exports.txt
echo LIBRARY TROJAN-QT5-core > trojan-qt5-core.def
echo EXPORTS >> trojan-qt5-core.def
for /f "skip=19 tokens=4" %%A in (exports.txt) do echo %%A >> trojan-qt5-core.def
lib /def:trojan-qt5-core.def /out:trojan-qt5-core.lib /machine:x86
```

我需要从 libcrypto.dll 生成对应的 lib 文件，以下操作需要在 vc 环境下运行，可以将路径添加到环境变量 path

如 vc 路径为 "C:\\Program Files (x86)\\Microsoft Visual Studio 14.0\\VC\\bin\\”

1、使用 dumpbin 生成 exports 列表

```shell
dumpbin.exe /exports libcrypto.dll > exports.txt
```

dumpbin出来的内容如下

```shell
Microsoft (R) COFF/PE Dumper Version 14.00.24247.2
Copyright (C) Microsoft Corporation.  All rights reserved.


Dump of file D:\develop\libcrypto.dll

File Type: DLL

  Section contains the following exports for libcrypto.dll

    00000000 characteristics
    FFFFFFFF time date stamp
        0.00 version
           1 ordinal base
        3477 number of functions
        3477 number of names

    ordinal hint RVA      name

          1    0 000CA5A0 ACCESS_DESCRIPTION_free
          2    1 0013D450 ACCESS_DESCRIPTION_it
          3    2 000CA5B0 ACCESS_DESCRIPTION_new
          4    3 00001000 AES_cbc_encrypt
          5    4 000081E0 AES_cfb128_encrypt
          6    5 00008220 AES_cfb1_encrypt
          7    6 00008260 AES_cfb8_encrypt
          ......
```

2、准备一个 libcrypto.def 文件（这个名称是和动态库名称一样的），将导出函数抠出来填入，不要序号和地址

文件内容的前两行是固定的，名称改成动态库的名称（参考下面格式）

```shell
LIBRARY libcrypto
EXPORTS
	ACCESS_DESCRIPTION_free
	ACCESS_DESCRIPTION_it
	ACCESS_DESCRIPTION_new
	AES_cbc_encrypt
	AES_cfb128_encrypt
	AES_cfb1_encrypt
	AES_cfb8_encrypt
    ......
```

3、def文件准备好之后，使用下面命令生成动态库对应的 lib 文件

```shell
lib.exe /def:libcrypto.def /machine:x86 /out:libcrypto.lib
```

4、在 dumpbin 生成函数列表的时候，如 go 编译的动态库文件中，像下面这种格式的不需要作导出处理，中间还有一些有 “=” 符号的

```shell
ordinal hint RVA      name

          1    0 0079E040 _cgo_4c605886eead_Cfunc__Cmalloc
          2    1 0079E790 _cgo_667f92909735_Cfunc__Cmalloc
          3    2 0079E7D0 _cgo_667f92909735_Cfunc_free
          4    3 007B36B0 _cgo_667f92909735_Cfunc_free_conn_key_arg
          5    4 007B36C0 _cgo_667f92909735_Cfunc_get_conn_key_val
          6    5 007B2FE0 _cgo_667f92909735_Cfunc_input
          7    6 0079E7E0 _cgo_667f92909735_Cfunc_ipaddr_aton = _ipaddr_ntoa_r
          8    7 0079E820 _cgo_667f92909735_Cfunc_ipaddr_ntoa

         ......

         72   47 00461AB0 _cgoexp_667f92909735_tcpRecvFn
         73   48 00461B40 _cgoexp_667f92909735_tcpSentFn
         74   49 00461CD0 _cgoexp_667f92909735_udpRecvFn
         75   4A          bufio.(*ReadWriter).Available (forwarded to bufio.(*ReadWriter).Available)
         76   4B          bufio.(*ReadWriter).Discard (forwarded to bufio.(*ReadWriter).Discard)
         77   4C          bufio.(*ReadWriter).Flush (forwarded to bufio.(*ReadWriter).Flush)
         78   4D          bufio.(*ReadWriter).Peek (forwarded to bufio.(*ReadWriter).Peek)
         79   4E          bufio.(*ReadWriter).Read (forwarded to bufio.(*ReadWriter).Read)
```
