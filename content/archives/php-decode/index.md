---
categories:
- 默认分类
date: '2025-04-09T11:42:22'
description: ''
draft: false
image: ''
slug: php-decode
tags:
- php
title: 基于php扩展加密的一个简单逆向
cover: /archives/php-decode/f2e4lf.png
---

## 前言

这里是对 php 扩展加密的一个入门学习，参考了原作者的开源实现 https://github.com/lihancong/tonyenc

该项目仅仅几百行代码，实现了 php 扩展加密的基本逻辑，通过该模块可以快速熟悉 php 基于扩展加密的整个处理流程

## 组件构建

本地的 php 环境是 7.4， 本地调试环境构建可以参考 [这里](https://www.xqc7.com/archives/windows-build-php)，拉取 tonyenc 项目到本地进行编译的时候提示错误

```shell
In file included from /root/develop/tonyenc/tonyenc.c:30:
/root/develop/tonyenc/core.h: In function ‘cgi_compile_file’:
/root/develop/tonyenc/core.h:86:30: error: ‘ZEND_HANDLE_FD’ undeclared (first use in this function); did you mean ‘ZEND_HANDLE_FP’?
   86 |     if (file_handle->type == ZEND_HANDLE_FD) close(file_handle->handle.fd);
      |                              ^~~~~~~~~~~~~~
      |                              ZEND_HANDLE_FP
/root/develop/tonyenc/core.h:86:30: note: each undeclared identifier is reported only once for each function it appears in
/root/develop/tonyenc/core.h:86:72: error: ‘union <anonymous>’ has no member named ‘fd’; did you mean ‘fp’?
   86 |     if (file_handle->type == ZEND_HANDLE_FD) close(file_handle->handle.fd);
      |                                                                        ^~
```

因为 ZEND_HANDLE_FD 在 7.4 中已经被移除了，修改为如下对 ZEND_HANDLE_STREAM 的处理

```diff
root@ubuntu-10-241:~/develop/tonyenc# git diff 
diff --git a/core.h b/core.h
index accb22c..1adbd97 100644
--- a/core.h
+++ b/core.h
@@ -83,7 +83,8 @@ zend_op_array *cgi_compile_file(zend_file_handle *file_handle, int type)
         goto final;
 
     if (file_handle->type == ZEND_HANDLE_FP) fclose(file_handle->handle.fp);
-    if (file_handle->type == ZEND_HANDLE_FD) close(file_handle->handle.fd);
+    //if (file_handle->type == ZEND_HANDLE_FD) close(file_handle->handle.fd);
+    if (file_handle->type == ZEND_HANDLE_STREAM && file_handle->handle.stream.handle) php_stream_close(file_handle->handle.stream.handle);
 
 #ifdef PHP_WIN32
     file_handle->handle.fp = res;
```

编译后 `make install` 后将 tonyenc.so 库文件安装到 php 的 extensions 目录下，还需要修改 php.ini 文件增加 `extension=tonyenc.so`

## 加密与解密

代码的加解密函数在 core.h 文件中，完整代码如下，这个加密逻辑比较简单，使用了对称密钥加解密

1、只处理数据中的奇数下标

2、对每个待加密字节，先用一个由 tonyenc_key 派生出来的动态密钥 t 进行 XOR，然后再 NOT

3、加密后的数据直接写回原数组

```c
void tonyenc_encode(char *data, size_t len)
{
    size_t i, p = 0;
    for (i = 0; i < len; ++i) {
        if (i & 1) {
            p += tonyenc_key[p] + i;
            p %= sizeof(tonyenc_key);
            u_char t = tonyenc_key[p];
            data[i] = ~(data[i] ^ t);
        }
    }
}

void tonyenc_decode(char *data, size_t len)
{
    size_t i, p = 0;
    for (i = 0; i < len; ++i) {
        if (i & 1) {
            p += tonyenc_key[p] + i;
            p %= sizeof(tonyenc_key);
            u_char t = tonyenc_key[p];
            data[i] = ~data[i] ^ t;
        }
    }
}
```

整个加密密钥是写在 core.h 文件中的，使用上也可以将密钥提取出来，保存到文件中或者部署到网络中，实现密钥随时替换

基于这种方式的加解密的密钥必须为同一个 

待加密文件 hello.php 的代码如下，使用 `php tonyenc.php hello.php ` 对代码进行加密，代码加密后被回写到 hello.php 中

```php
<?php

echo "hello world";

```

![20250409091057](/archives/php-decode/f2e4lf.png)

使用 `php hello.php` 执行加密后的代码，输出 hello world（我本地编译的 php 是调试版本，还输出了额外的调试信息）

![20250409091915](/archives/php-decode/f79iw2.png)


## 组件原理

组件的初始化代码如下，初始化的时候劫持了 php 代码的编译过程，将 zend_compile_file 替换为自定义的 cgi_compile_file 函数

```c
PHP_MINIT_FUNCTION(tonyenc)
{
    /* If you have INI entries, uncomment these lines
    REGISTER_INI_ENTRIES();
    */

    old_compile_file = zend_compile_file;
    zend_compile_file = cgi_compile_file;

    return SUCCESS;
}
/* }}} */
```

在 cgi_compile_file 函数内部，进行了 magic header 的判断是否经过 tonyenc 加密，未加密的交还原来的 zend_compile_file 进行处理

```c
if (data_len >= sizeof(tonyenc_header)) {
    char *t = emalloc(sizeof(tonyenc_header));
    size_t read_cnt = fread(t, sizeof(tonyenc_header), 1, fp);
    if (memcmp(t, tonyenc_header, sizeof(tonyenc_header))) {
        efree(t);
        fclose(fp);
        goto final;
    }
    efree(t);
} else {
    fclose(fp);
    goto final;
}
```

加密的代码经过 tonyenc_ext_fopen 进行处理，在这里对代码进行解密，再将解密结果写入到临时文件中，最后交还给 zend_compile_file 

```c

    tonyenc_decode(p_data, data_len);

    ......

    *res = tmpfile();
    if (*res == NULL) {
        php_error_docref(NULL, E_CORE_ERROR, "tonyenc: Failed to create temp file, may be too many open files.\n");
        efree(p_data);
        return -1;
    }

    if (fwrite(p_data, data_len, 1, *res) != 1) {
        php_error_docref(NULL, E_CORE_ERROR, "tonyenc: Failed to write temp file.\n");
        efree(p_data);
        fclose(*res);
        return -2;
    }
    rewind(*res);
```

## 逆向实现

那解密思路就很清楚了，就是通过 hook 编译 php 代码的函数（zend_compile_file、zend_compile_string等）

这也是这类 php 扩展加密的常规解密思路，当然商业上成熟的 php 加密方案会更复杂，这里只是基本的使用

可以修改 php 的代码，增加 print 将这里的文件内容全部打印出来，也可以调试 php ，在这里挂上断点，将代码抓取出来

又或者使用通用组件（github也有一些开源的），hook 这里的 zend_compile_file 函数，将代码输出到文件中

使用通用组件 hook 该编译函数的话，就会出现有多个组件都 hook 了该编译函数，执行顺序就需要保证

假设有 A、B、C 三个扩展，按 A、B、C 的顺序先后加载，它们都 hook 了 zend_compile_file，代码如下

```c
A_orig = zend_compile_file;
zend_compile_file = A_hook;
```

```c
B_orig = zend_compile_file; // 此时是 A_hook
zend_compile_file = B_hook;
```

```c
C_orig = zend_compile_file; // 此时是 B_hook
zend_compile_file = C_hook;
```

那么最终的调用就变成了 `C_hook -> B_hook -> A_hook -> compile_file`

也就是说要保证你的 hook 在解密后被调用，你的组件要被先加载，影响组件加载顺序的最简单的就是 php.ini 中的配置

pph 对组件都加载顺序是按 php.ini 文件中的 extension 顺序来处理的，因此只要将通用组件写在加密组件前就可以

这里使用 gdb 调试的方式打印出 php 的原始代码，`gdb --args php hello.php` 运行脚本

`b compile_file` 挂上断点，这个函数已经是在解密之后的 php 逻辑中了，然后 r 运行停在断点位置

![20250409111528](/archives/php-decode/ig1icd.png)

这里的 file_handle->handle.fp 就是解密后临时文件的句柄，这个必须是没问题的，不然 compile_file 就没法执行了

file_handle->filename 还是原来的文件名，可以 `shell cat hello.php` 查看原始文件的内容，可以看到是加密的

这时候源代码已经被解密了，解密后的代码就在 fp 指向的这个临时文件中

通过将 fp 的文件内容读取到一个 buf 缓冲中，然后将其全部打印出来，就可以看到全部的源代码了

```shell
set $buf = (char *)malloc(1024)
call fread($buf, 1, 1024, file_handle->handle.fp)
print (char *)$buf
```

![20250409112103](/archives/php-decode/ijgme2.png)


## 修改php代码逆向

compile_file 函数在 Zend/zend_language_scanner.l 文件中进行定义的，zend_language_scanner.c 是从该 l 文件生成的

因此修改的时候需要修改这个 l 文件，增加两个函数实现 extract_filename，write_zend_file_to_tmp 将解密后的文件写入 /tmp 目录 

compile_file 函数增加一个 write_zend_file_to_tmp 调用，通过环境变量 PHP_DEBUG 进行控制是否进行源码的 dump 出

在 PHP_DEBUG 等于 1 的时候，将 php 源码 dump 出到 /tmp 目录下，并直接退出

```c
static const char *extract_filename(const char *full_path) {
    if (!full_path) return "unnamed_file";
    
    const char *last_slash = strrchr(full_path, '/');
    const char *last_backslash = strrchr(full_path, '\\');

    const char *filename = full_path;
    if (last_slash && (!last_backslash || last_slash > last_backslash)) {
        filename = last_slash + 1;
    } else if (last_backslash) {
        filename = last_backslash + 1;
    }
    
    return filename && *filename ? filename : "unnamed_file";
}

int write_zend_file_to_tmp(zend_file_handle *zfh, const char *output_path) {
    FILE *output_fp = NULL;
    size_t bytes_read = 0;
    size_t bytes_written = 0;
    char buffer[4096];

    if (!zfh) {
        fprintf(stderr, "Invalid zend_file_handle\n");
        return -1;
    }

    output_fp = fopen(output_path, "wb");
    if (!output_fp) {
        fprintf(stderr, "Failed to open output file: %s\n", output_path);
        return -1;
    }

    switch (zfh->type) {
        case ZEND_HANDLE_FP:
            if (zfh->handle.fp) {
                if (zfh->buf && zfh->len > 0) {
                    bytes_written = fwrite(zfh->buf, 1, zfh->len, output_fp);
                    if (bytes_written != zfh->len) {
                        fclose(output_fp);
                        return -1;
                    }
                }

                while ((bytes_read = fread(buffer, 1, sizeof(buffer), zfh->handle.fp)) > 0) {
                    bytes_written = fwrite(buffer, 1, bytes_read, output_fp);
                    if (bytes_written != bytes_read) {
                        fclose(output_fp);
                        return -1;
                    }
                }
            }
            break;

        case ZEND_HANDLE_STREAM:
            if (zfh->buf && zfh->len > 0) {
                bytes_written = fwrite(zfh->buf, 1, zfh->len, output_fp);
                if (bytes_written != zfh->len) {
                    fclose(output_fp);
                    return -1;
                }
            }
            break;

        default:
            fprintf(stderr, "Unknown handle type\n");
            fclose(output_fp);
            return -1;
    }

    fclose(output_fp);
    return 0;
}

static int log_compile_filename(const char* msg) {
    FILE *fp = fopen("/tmp/log_compile_file.log", "a");
    if (!fp) {
        fprintf(stderr, "Failed to open log_compile_file\n");
        return -1;
    }

    time_t rawtime;
    struct tm *timeinfo;
    char timestamp[20];

    time(&rawtime);
    timeinfo = localtime(&rawtime);
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", timeinfo);

    int size = fprintf(fp, "[%s] %s\n", timestamp, msg);
    if (size < 0) {
        fprintf(stderr, "Failed to write log_compile_file\n");
        fclose(fp);
        return -1;
    }

    fclose(fp);
    return 0;
}

ZEND_API zend_op_array *compile_file(zend_file_handle *file_handle, int type)
{
       const char* value = getenv("PHP_DEBUG_FILE");
       if (value != NULL && strcmp(value, "1") == 0) {
           char output_path[256];
           const char *filename = extract_filename(file_handle->filename);
           snprintf(output_path, sizeof(output_path), "/tmp/%s", filename);
           fprintf(stdout, "php debug for output:%s\n", output_path);
           log_compile_filename(file_handle->filename);
           write_zend_file_to_tmp(file_handle, output_path);
       }

       ......

}
```

修改后重新编译 php 代码生成执行文件，在没启用环境变量之前，使用 `php tonyenc.php hello.php` 加密源代码

![20250409143350](/archives/php-decode/npi28k.png)

启用 PHP_DEBUG 环境变量之后，再使用 `php hello.php` 执行将源码 dump 出到 /tmp 目录下

![20250409143713](/archives/php-decode/nrnte7.png)


在 php 中直接运行文件时会直接调用到 compile_file 这里，通过 eval 调用的代码将会运行到 compile_string 这里

同样可以在 compile_string 入口增加输出，将 eval 执行的代码打印出来

```c
static void dump_source_to_file(zval *source_string, char *filename) {
    if (!source_string || Z_TYPE_P(source_string) != IS_STRING) {
        return;
    }

    zend_string *str = source_string->value.str;
    char *content = ZSTR_VAL(str);
    size_t length = ZSTR_LEN(str);

    const char *basename = strrchr(filename, '/');
    if (basename) {
        basename++;
    } else {
        basename = filename;
    }

    char *end = strstr(basename, "(");
    if (!end) {
        end = basename + strlen(basename);
    }

    size_t name_len = end - basename;
    char clean_filename[256];
    if (name_len >= sizeof(clean_filename)) {
        name_len = sizeof(clean_filename) - 1;
    }
    strncpy(clean_filename, basename, name_len);
    clean_filename[name_len] = '\0';

    char filepath[256];
    snprintf(filepath, sizeof(filepath), "/tmp/%s", clean_filename);

    FILE *fp = fopen(filepath, "w");
    if (fp) {
        fwrite(content, 1, length, fp);
        fclose(fp);
    } else {
        fprintf(stderr, "Failed to open file: %s\n", filepath);
    }
}

zend_op_array *compile_string(zval *source_string, char *filename)
{
    const char* value = getenv("PHP_DEBUG_STRING");
    if (value != NULL && strcmp(value, "1") == 0) {
        dump_source_to_file(source_string, filename);
    }

    ...

}
```

使用 gdb 调试的话，如下为运行代码，gdb 启动调试 `gdb --args php hello.php`，在 compile_string 函数下断点

然后使用 `print source_string->u1.v.type` 打印类型，6 表示字符类型，再将其打印出来 ` print (char*)source_string->value.str->val`


```php
<?php

echo "hello world";

eval("echo 'eval call...';");
```

![20250410141204](/archives/php-decode/ncqcg1.png)
