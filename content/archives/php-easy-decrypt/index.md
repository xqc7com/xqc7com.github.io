---
categories:
- 默认分类
date: '2025-04-07T16:02:32'
description: ''
draft: false
image: ''
slug: php-easy-decrypt
tags:
- php
title: 一个简单的php加密的理解
cover: /archives/php-easy-decrypt/oz0tz2.png
---

## 前言

原帖子 https://www.52pojie.cn/thread-1991616-1-1.html

一段简单的 php 代码加密，大佬使用了一段 python 代码给解密出来了，但是我没太理解整个逻辑

于是在本地跑了一遍，尝试理解整个解密流程，这里记录下整个学习过程

## 可读化显示

加密代码使用了非可读字符的变量名，需要重命名处理为可读的

使用 php-parser 将代码的变量进行重命名及格式化显示，安装模块 `composer require nikic/php-parser` 

遍历 AST 树 enterNode 的时候进行变量重命名，变量命名格式为 `var?` 数字递增

```php 
<?php
require 'vendor/autoload.php';

use PhpParser\Error;
use PhpParser\Node;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitorAbstract;
use PhpParser\ParserFactory;
use PhpParser\PrettyPrinter;

$code = file_get_contents('db.php');

$parserFactory = new ParserFactory();
$traverser = new NodeTraverser();
$prettyPrinter = new PrettyPrinter\Standard();

$varMap = [];
$counter = 0;

$parser = $parserFactory->createForHostVersion();

$traverser->addVisitor(new class($varMap, $counter) extends NodeVisitorAbstract {
    private $varMap;
    private $counter;

    public function __construct(&$varMap, &$counter) {
        $this->varMap = &$varMap;
        $this->counter = &$counter;
    }

    public function enterNode(Node $node) {
        if ($node instanceof Node\Expr\Variable && is_string($node->name)) {
            $name = $node->name;
            if (!isset($this->varMap[$name])) {
                $this->varMap[$name] = 'var' . $this->counter++;
            }
            $node->name = $this->varMap[$name];
        }
    }
});

try {
    $stmts = $parser->parse($code);
    $stmts = $traverser->traverse($stmts);
    $prettyCode = $prettyPrinter->prettyPrintFile($stmts);
    file_put_contents('db-rename.php', $prettyCode);
} catch (Error $e) {
    echo "Parse error: ", $e->getMessage();
}
```

原始的代码显示为如下，使用上述代码经过重命名处理以及格式化处理后显示如下

可以很清晰度看到，前面都是变量的定义，并且是使用了 $var0 的不同索引组成的变量名

![20250407150955](/archives/php-easy-decrypt/oz0tz2.png)

![20250407151034](/archives/php-easy-decrypt/oz98jz.png)

## 本地调试

通过调试发现， $var10 是将代码文件的内容重新读了一遍

并取了最后两行赋值给 $var11 和 $var12，原始的文件只有两行代码，格式化后行数变了，和原来逻辑对不上

$var13 截取了代码的一部分，并进行了 md5 计算，得到 md5 值保存为 $var14

![20250407151330](/archives/php-easy-decrypt/p10rcs.png)


但是从这里看 md5 值并没有直接使用对比，而是直接替换为空了，也可能在嵌套的 eval 中使用了？

这个 eval 中的代码就是 `@eval(base64_decode(str_replace($md5, '', strtr('......', '...', '...')))`

![20250407154811](/archives/php-easy-decrypt/plqgxk.png)

由于 eval 里面还有嵌套的 eval，而且 eavl 内部的一些变量信息经处理后已经丢失了（被重命名为 $var? 了）

这里就没继续分析了，按原帖的思路将 eval 结果直接另存为文件，然后再拼接起来

原代码最后部分应该是密钥的处理部分，大佬的实现更为巧妙，直接就绕过了，这里附上原帖的 python 处理代码

```python
import os

with open("db.php", "rb") as f:
    db = f.read()

assert db.count(b"@eval(") == 1
assert db.count(b");unset(") == 1
s = db.index(b"@eval(") + 0
e = db.index(b");unset(") + 2

db_eval2fwrite_1 = db.replace(b"@eval(", b'fwrite(fopen("db_1.fwrite","wb"),')
with open("db_eval2fwrite_1.php", "wb") as f:
    f.write(db_eval2fwrite_1)

os.system("php db_eval2fwrite_1.php")

with open("db_1.fwrite", "rb") as f:
    db_1 = f.read()

assert db_1.count(b" eval(") == 1

db_1 = b'fwrite(fopen("db_2.fwrite","wb"),' + db_1[db_1.index(b" eval(") + 6 :]

db_eval2fwrite_2 = db[:s] + db_1 + db[e:]
with open("db_eval2fwrite_2.php", "wb") as f:
    f.write(db_eval2fwrite_2)
os.system("php db_eval2fwrite_2.php")

with open("db_2.fwrite", "rb") as f:
    db_2 = f.read()

with open("result.php", "wb") as f:
    f.write(b"<?php\n" + db_2)
```
