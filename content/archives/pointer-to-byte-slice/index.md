---
categories:
- 默认分类
date: '2024-11-25T16:17:36'
description: ''
draft: false
image: ''
slug: pointer-to-byte-slice
tags:
- go
title: Converting a pointer to a byte slice
---

如果是从裸指针直接转为 \[\]byte 数组接收，会出现异常，需要准备 \[\]byte 的底层结构再行转换

[https://stackoverflow.com/questions/43591047/converting-a-pointer-to-a-byte-slice](https://stackoverflow.com/questions/43591047/converting-a-pointer-to-a-byte-slice)

[https://play.golang.org/p/An7jG5xl2W](https://play.golang.org/p/An7jG5xl2W)

```go
package main

import (
    "fmt"
    "reflect"
    "unsafe"
)

var data = []byte(`foobar`)

func main() {
    rv := reflect.ValueOf(data)
    
    ptr := rv.Pointer()
    length := rv.Len()
    
    var sl = struct {
        addr uintptr
        len  int
        cap  int
    }{ptr, length, length}

    b := *(*[]byte)(unsafe.Pointer(&sl))
    
    fmt.Println(string(b))
}
```
