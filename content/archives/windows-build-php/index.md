---
categories:
- 默认分类
date: '2025-01-15T14:49:00'
description: ''
draft: false
image: ''
slug: windows-build-php
tags:
- php
- php-sdk
title: 不同平台下编译php源码
cover: /archives/windows-build-php/20250115142742815.png
---

## windows平台编译

前提需要准备好 vs2022 环境

下载 php sdk，地址 https://github.com/php/php-sdk-binary-tools 中的 release 下载最新版本

解压到比如 d:\develop\php-sdk 目录下 

![](/archives/windows-build-php/20250115142742815.png)

在系统的开始菜单中，找到 `x64 Native Tools Command Prompt for vs 2022` 点击运行

![](/archives/windows-build-php/20250115093957566.png) 

命令行中切换到 php-sdk 目录下，运行构建初始化脚本 phpsdk-vs17-x64.bat 进入到 $ 操作符下 

![](/archives/windows-build-php/20250115142945748.png)

在 $ 操作符下切换到 php-src 源码目录

php 源码从 github 下载 https://github.com/php/php-src ，切换到指定构建分支

运行 `buildconf` 生成配置文件，然后运行 `configure.bat` 初始化编译配

如有需要编译的插件在这里进行配置，如 curl 的插件编译配置，不编译插件直接 `configure` 就可以

```
configure --enable-curl --with-curl="C:\path\to\curl" --with-openssl="C:\path\to\openssl" --with-zlib="C:\path\to\zlib"
```

![](/archives/windows-build-php/20250115143840510.png)

配置完毕之后，使用 nmake 进行编译，稍等一会就编译完毕了

![](/archives/windows-build-php/20250115144632241.png)

编译完毕后，在 php-src 目录下生成一个 x64 的编译目录，结构如下

![](/archives/windows-build-php/20250115144026726.png)


## ubuntu平台编译

首先使用 `apt upate` 进行更新系统，并使用以下命令安装依赖包

```shell
sudo apt install -y pkg-config build-essential autoconf bison re2c libxml2-dev libbz2-dev \
   libsqlite3-dev libssl-dev libcurl4-openssl-dev libjpeg-dev libpng-dev libonig-dev
```

如果需要 openssl 的支持，下载 1.1.1 的版本 `wget https://www.openssl.org/source/openssl-1.1.1.tar.gz` 进行构建

编译 openssl 库安装到 /root/openssl 目录，然后配置环境变量

```shell
#openssl
export OPENSSL_DIR=/root/openssl
export CPPFLAGS="-I$OPENSSL_DIR/include"
export LDFLAGS="-L$OPENSSL_DIR/lib"
export PKG_CONFIG_PATH="$OPENSSL_DIR/lib/pkgconfig"
```

将本地的 php 代码切换到对应的分支，再使用以下命令进行构建，编译后输出在 sapi 目录下，如 php 执行文件位置在 sapi/cli/php 

配置的时候指定安装路径为 /root/php74d ，编译方式不指定的话全部会静态编译链接到 php 可执行文件中

```shell
./buildconf --force
./configure --enable-debug --prefix=/root/php74d \
            --enable-fpm \
            --with-fpm-user=root \
            --with-fpm-group=root \
            --enable-phar \
            --enable-cli \
            --enable-mbstring \
            --enable-sockets \
            --enable-opcache \
            --with-zlib \
            --with-bz2 \
            --with-curl \
            --with-openssl=/root/openssl \
            --with-mysqli \
            --with-pdo-mysql
make -j4
make install
```

如果需要编译为动态库，需要对每一个组件进行单独指定， 如 `--enable-posix=shared` 表示将 posix 这个库编译为动态库

组件编译为动态库后，在 php.ini 文件中需要进行指定，才会被 php 在运行的时候加载加载，如指定为 `extension=posix.so`

使用 `php -m` 可以查看编译的 php 中的组件有哪些 

```shell
root@ubuntu-10-241:~/develop/php-src# ./sapi/cli/php -m 
[PHP Modules]
Core
ctype
date
dom
fileinfo
filter
hash
iconv
json
libxml
pcre
PDO
pdo_sqlite
Phar
posix
random
Reflection
session
SimpleXML
SPL
sqlite3
standard
tokenizer
xml
xmlreader
xmlwriter

[Zend Modules]
```

如果需要编译更多的组件，可以通过指令进行 `./configure --enable-mbstring --with-curl` 指定

这里有 enable 和 with，其中 enable 表示不需要外部依赖的， with 表示需要外部依赖的 

如果一个扩展对外部有依赖的话，需要保证依赖已经安装，不然 configure 的时候会报错

在编译构建第三方扩展的时候需要使用到的一个工具是 phpize，这是一个脚本在 `build/phpize.in` 位置

当进行 make install 的时候，会将该文件拷贝到安装目录下的 phpize，并进行一些变量的修正，如 @prefix 这些变量

当下载扩展源码后，就可以使用这里的 phpize 指令进行编译，如需要编译一个名为 extname 的扩展

```shell
cd extname
phpize
./configure
make
sudo make install
```
