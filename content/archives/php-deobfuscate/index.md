---
categories:
- 默认分类
date: '2025-04-07T18:48:27'
description: ''
draft: false
image: ''
slug: php-deobfuscate
tags:
- php
title: 基于php-parser的php代码反混淆
cover: /archives/php-deobfuscate/fb10yp.png
---

## 前言

php-parser 是一个使用 PHP 编写的开源项目，它的作用是把 PHP 代码解析成 AST（抽象语法树）

可以基于 php-parser 做静态分析、代码转换、代码格式化、Linter、甚至写一个 PHP 解释器都行

这个库也是学习编译原理、分析 PHP 代码结构的神器，作者是 PHP 社区大佬 nikic，也是 PHP 编译器的核心开发者 

PHP-Parser 项目的开源地址 https://github.com/nikic/PHP-Parser 

## php-parser包安装

php-parser 是使用 composer 进行管理的，composer 是 PHP 的依赖管理工具

就像 Node.js 下的 npm，Python 下的 pip，[composer的下载地址在这里](https://getcomposer.org/download/)

在 windows 下安装在 `C:\Users\Administrator\AppData\Local\ComposerSetup`目录， bin 目录文件列表如下 

![20250407092547](/archives/php-deobfuscate/fb10yp.png)

composer 安装后自动将 bin 目录配置到环境变量中，当在终端中输入 composer 运行的时候，就执行到这里的 composer.bat

![20250407092930](/archives/php-deobfuscate/fdb64u.png)

composer.bat 文件内容如下，最终执行的就是 `php composer.phar` 

![20250407093122](/archives/php-deobfuscate/feg7sz.png)

composer.phar 文件比较复杂，可以不需要关注，php 包管理的逻辑就是在这里实现的

当引用其他 php 包的时候，在当前项目的目录下运行命令，如 `composer require nikic/php-parser` 将会自动下载包文件

vendor 目录以及 composer.json、composer.lock 文件，是 composer 管理的文件，开发过程中不要动这部分文件

![20250407094236](/archives/php-deobfuscate/fl35jh.png)

## php-parser使用

php-parser 的核心逻辑有三个步骤，解析、遍历/修改、还原

1、解析由 PhpParser\Parser 处理，实现把 php 代码转换为一棵 AST 树

2、遍历/修改由 PhpParser\NodeTraverser + NodeVisitor 处理，自定义的修改可以继承 NodeVisitor 实现

3、还原由 PhpParser\PrettyPrinter\Standard 处理，将修改后的 AST 树输出至新的源码

这里演示的是一种基础的使用，当前的一个 php 文件，文件是基于编码加密以及 goto 混扰，文件源码如下

![20250407095919](/archives/php-deobfuscate/fv3y7c.png)

### 编码解密

基于 php-parser 编写的解密代码如下，构造一个 parser，并生成一个 ast 树，最后将其 pretty 输出到文件

```php
<?php
require 'vendor/autoload.php';

use PhpParser\PrettyPrinter;
use PhpParser\ParserFactory;

$code = file_get_contents('backup/functions.php');

$parserFactory = new ParserFactory();
$parser = $parserFactory->createForHostVersion();
$ast = $parser->parse($code);

$prettyPrinter = new PrettyPrinter\Standard;
$restoredCode = $prettyPrinter->prettyPrintFile($ast);
file_put_contents('functions.php', $restoredCode);
```

使用 `php index.php` 运行脚本，生成解密文件内容如下，这一步实现了代码的全部可读

不过从代码看，还存在大量的 goto 跳转，这对理解代码流程还是很困难，需要进行反混淆处理

![20250407100605](/archives/php-deobfuscate/gn0aax.png)


## php反混淆

github 有开源的反混淆工具，这里使用这个仓库的 https://github.com/simon816/PHPDeobfuscator 

PHPDeobfuscator 是基于 php-parser 的基础上实现的，并且PHPDeobfuscator 是可以实现一步直接将原始文件进行反混淆复原的

下载 PHPDeobfuscator 仓库后，基于代码在 phpstudy 中增加一个 web 服务， 在代码目录下执行 `composer install` 安装依赖包

也可以通过命令行直接运行，命令为 `php index.php [-f filename] [-t] [-o]` ，但是 o 参数并不是指输出到文件

这里以 web 方式运行，浏览器中打开 web 页面后，在文本框内输入原始的 php 代码，点击 Deobfuscate 按钮生成

![20250407183813](/archives/php-deobfuscate/ueeuzn.png)

生成后的代码流程是正确的，大量的 goto 混淆已经复原

但是输出的代码中的中文是以 `\xe4\xba\x8c\xe6\xac\xa1\xe5\xbc\x80\xe5\x8f\x91` 这种十六进制显示的

使用前面 `编码解密` 中的代码再跑一遍，就可以恢复中文显示了

从生成的最终代码看，还有少量的 goto，但是这些是原始代码中正确的逻辑，不影响对代码逻辑的理解

![20250407184455](/archives/php-deobfuscate/uih2mj.png)
