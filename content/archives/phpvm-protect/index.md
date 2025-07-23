---
categories:
- 默认分类
date: '2025-05-08T11:59:21'
description: ''
draft: false
image: ''
slug: phpvm-protect
tags:
- encrypt
title: 基于vm加密的php逆向分析
cover: /archives/phpvm-protect/fogr32.png
---

## 前言

对于 php 主流的加密方式有两种：

1、基于扩展的

2、本地加密，不涉及扩展

一些在 php 端通过 zend_compile_file 等函数就可以直接 dump 出原代码的，称之为加密实在是抬举了

之前有写过一篇直接 dump 出源码的分析 https://www.xqc7.com/archives/php-decode 

基于本人有限的了解，私以为 z5 和 swoole 等类似的才能称得上加密，这里的分析仅限于技术交流

## 代码可读

之前已经有大佬写过 z5 的逆向分析 https://www.52pojie.cn/thread-995682-1-1.html 

最近拿到一份样本，从技术的角度简单了解基于 vm 加密的实现思路，由于逆向难度太大，这里的只是半成品

代码分为两大部分，前面两个函数为 vm 相关的逻辑，函数名是不可读的，后面的为业务函数实现，两个 vm 函数姑且命名为 func_a、 func_b 

![20250508094804](/archives/phpvm-protect/fogr32.png)

业务函数部分，函数签名以及最后面的部分代码都是可读的

![20250508095024](/archives/phpvm-protect/fprwlx.png)

两个 vm 相关的函数都是定义了一个 $a 变量，经过 gzinflate 解压然后 return $a，解压出来的 $a 也是加密的

业务函数的最后 eval 调用了 func_b，将其函数执行一遍，func_b 函数 gzinflate 出来的密文如下图

代码显示前面有一个 eval(gzinflate(...))，后面还有大量的 eval 调用（截图没截出来）

![20250508104324](/archives/phpvm-protect/h95q6d.png)

在 Ganlv 大佬的基础上，实现代码可读显示这个问题不大

调用 func_b 的时候，将第一个 eval(gzinflate(...)) 改为 print(gzinflate(...))，得到的内容为一个常量数组 

```php
return array (
  0 => '1;',
  1 => '屡爷伅谍夻',
  2 => 'fgetc',
  3 => 'PHP_VERSION_ID',
  4 => 'is_array',
  5 => 'function_exists',
  6 => 'current',
  7 => 'valid',
  8 => 'r+',
  9 => 'count',
  10 => 'fopen',
  11 => 'Z5Encrypt VM Error: Unhandled',
  12 => '$藰傰绢撥垇=array_search($幍娷柶牍聊,$瑡吐€);if($藰傰绢撥垇===false){$拐陡湌灭莫++;$瑡吐€[$拐陡湌灭莫]=$幍娷柶牍聊;$溤鋄$拐陡湌灭莫]=NULL;$藰傰绢撥垇=$拐陡湌灭莫;}return $藰傰绢撥垇;',
  13 => 'get_object_vars',
  14 => 'newInstance',
  15 => 'parent::',
  16 => 'is_string',
  17 => 'array_keys',
  18 => 'n*',
  19 => 'php://filter/read=zlib.inflate/resource=php://memory',
  20 => ' if($柪0]==0)return substr($柪?1);$膊=intval($柪0]);$宕∩哼膨?substr($柪?0,$膊+1);$胤热劓煢麠=substr($柪?$膊+1);$溆侚娆儫潄气=openssl_decrypt($胤热劓煢麠,"AES-128-ECB",$宕∩哼膨?1);return $溆侚娆儫潄气;',
  21 => 'call_user_func_array',
  22 => 'fread',
  23 => 'ob_start',
  24 => 'substr',
  25 => 'constant',
  26 => 'fclose',
  27 => 'c/N*',
  28 => 'microtime',
  29 => 'fputs',
  30 => 'strlen',
  31 => 'is_numeric',
  32 => 'ord',
  33 => '#opcodeString',
  34 => 'getIterator',
  35 => 'next',
  36 => 'hasMethod',
  37 => 'is_object',
  38 => 'defined',
  39 => 'newInstanceArgs',
  40 => '__construct',
  41 => 'key',
  42 => 'hi debugger~',
  43 => 'unpack',
  44 => 'rewind',
  45 => 'Nk/na/Nz',
  46 => 'str_replace',
);
```

将展开后的常量数组以及后半部分代码，更新回业务函数中，使用 php-parser 格式化后显示如下

![20250508105847](/archives/phpvm-protect/hi7mjr.png)

之后需要解决代码可读的问题，在 php-parser 基础上进行变量重命名，替换为 $var__ 开始的变量名

![20250508110315](/archives/phpvm-protect/i8tcyv.png)

变量 $var__7 中就是前面的一个常量数组，基于 $var__7 替换掉函数中部分其他的 $var__ 变量后显示如下

![20250508110745](/archives/phpvm-protect/ibdj84.png)

到这里大部分代码已经可读，$var__3 猜测应该是业务函数主体，另外 $var__7 中还有部分代码不可读，不过影响不大

代码展开后，虚拟机的部分代码显示如下

```php
        $var__31 = ('count')($var__11);
        $var__27 = $var__16;
        $var__32 = eval($var__25);
        $var__32 = eval("return {$var__32};");
        unset($var__13);
        $var__33 = $var__31 * 3;
        while ($var__15 < $var__31) {
            $var__34 = $var__11[$var__15];
            if (!$var__34) {
                throw new Exception('Z5Encrypt VM Error: Unhandled');
            }
            $var__35 = $var__34['s'];
            $var__36 = $var__34['z'];
            $var__15 = $var__34['a'];
            switch ($var__36) {
                case 0x1f13:
                    $var__26[$var__35[1][1]] = null;
                    break;
                case 0xdb7:
                    $var__15 = (bool) ($var__35[1] === "" ? "" : ($var__35[1][0] === "\x00" ? isset($var__26[$var__35[1][1]]) ? $var__26[$var__35[1][1]] : null : (($var__19 = $var__35[1][0]) && $var__19 === "\x04" || $var__19 === "\x05" ? ($var__27 = $var__35[1][1]) && ($var__27 = eval($var__25)) || 1 ? $var__19 === "\x04" ? $var__27 : eval("return {$var__27};") : "" : ($var__19 === "\x01" ? $var__35[1][1] : NULL)))) ? ($var__35[2] === "" ? "" : ($var__35[2][0] === "\x00" ? isset($var__26[$var__35[2][1]]) ? $var__26[$var__35[2][1]] : null : (($var__19 = $var__35[2][0]) && $var__19 === "\x04" || $var__19 === "\x05" ? ($var__27 = $var__35[2][1]) && ($var__27 = eval($var__25)) || 1 ? $var__19 === "\x04" ? $var__27 : eval("return {$var__27};") : "" : ($var__19 === "\x01" ? $var__35[2][1] : NULL)))) - 1 : $var__15;
                    break;
                case 0x19d4:
                    $var__15 = (bool) ($var__35[1] === "" ? "" : ($var__35[1][0] === "\x00" ? isset($var__26[$var__35[1][1]]) ? $var__26[$var__35[1][1]] : null : (($var__19 = $var__35[1][0]) && $var__19 === "\x04" || $var__19 === "\x05" ? ($var__27 = $var__35[1][1]) && ($var__27 = eval($var__25)) || 1 ? $var__19 === "\x04" ? $var__27 : eval("return {$var__27};") : "" : ($var__19 === "\x01" ? $var__35[1][1] : NULL)))) ? $var__15 : ($var__35[2] === "" ? "" : ($var__35[2][0] === "\x00" ? isset($var__26[$var__35[2][1]]) ? $var__26[$var__35[2][1]] : null : (($var__19 = $var__35[2][0]) && $var__19 === "\x04" || $var__19 === "\x05" ? ($var__27 = $var__35[2][1]) && ($var__27 = eval($var__25)) || 1 ? $var__19 === "\x04" ? $var__27 : eval("return {$var__27};") : "" : ($var__19 === "\x01" ? $var__35[2][1] : NULL)))) - 1;
                    break;
                case 0x1461:
                    eval($var__35[1] === "" ? "" : ($var__35[1][0] === "\x00" ? isset($var__26[$var__35[1][1]]) ? $var__26[$var__35[1][1]] : null : (($var__19 = $var__35[1][0]) && $var__19 === "\x04" || $var__19 === "\x05" ? ($var__27 = $var__35[1][1]) && ($var__27 = eval($var__25)) || 1 ? $var__19 === "\x04" ? $var__27 : eval("return {$var__27};") : "" : ($var__19 === "\x01" ? $var__35[1][1] : NULL))));
                    break;
                case 0x411:
                    $var__26[$var__35[2][1]] = $var__35[1] === "" ? "" : ($var__35[1][0] === "\x00" ? isset($var__26[$var__35[1][1]]) ? $var__26[$var__35[1][1]] : null : (($var__19 = $var__35[1][0]) && $var__19 === "\x04" || $var__19 === "\x05" ? ($var__27 = $var__35[1][1]) && ($var__27 = eval($var__25)) || 1 ? $var__19 === "\x04" ? $var__27 : eval("return {$var__27};") : "" : ($var__19 === "\x01" ? $var__35[1][1] : NULL)));
                    break;
                case 0xbd0:
                    $var__37 = $var__26[$var__35[1][1]];
                    $var__15 = ($var__37 ? $var__26[$var__35[2][1]] : $var__26[$var__35[3][1]]) - 1;
                    break;
                case 0x18b2:
                    $var__26[$var__35[1][1]] = $var__5[1];
                    break;
```

这里大量的分支都是相同代码，基于 Ganlv 的基础上进行 get_value 收缩掉这部分代码

```php
$var__35[3] === "" ? "" : ($var__35[3][0] === "\x00" ? isset($var__26[$var__35[3][1]]) ? $var__26[$var__35[3][1]] : null : (($var__19 = $var__35[3][0]) && $var__19 === "\x04" || $var__19 === "\x05" ? ($var__27 = $var__35[3][1]) && ($var__27 = eval($var__25)) || 1 ? $var__19 === "\x04" ? $var__27 : eval("return {$var__27};") : "" : ($var__19 === "\x01" ? $var__35[3][1] : NULL)))
```

收缩代码 get_value 函数如下，这里的 varMap.php 文件是在使用 php-parser 进行重命名时 dump 出来的，将原变量名映射到 $var__ 变量

```php
function get_value($key)
{
    static $varMap = [];
    if (empty($varMap)) {
        $varMap = include 'varMap.php';
    }
    $value = _get_value($key);
    if (is_string($value)) {
        if (array_key_exists($value, $varMap)) {
            $value = $varMap[$value];
        }
    }
    // echo $value;
    return $value;
}

function _get_value($key) {
    global $var__19, $var__25, $var__26, $var__27, $var__35;
    if ($key === "") {
        return "";
    } else {
        if ($key[0] === "\x00") {
            if (isset($var__26[$key[1]])) {
                return $var__26[$key[1]];
            } else {
                return null;
            }
        } else {
            $var__19 = $key[0];
            if (($var__19 && $var__19 === "\x04") || $var__19 === "\x05") {
                $var__27 = $key[1];
                if (($var__27 && ($var__27 = eval($var__25))) || 1) {
                    if ($var__19 === "\x04") {
                        return $var__27;
                    } else {
                        return eval("return {$var__27};");
                    }
                } else {
                    return "";
                }
            } else {
                if ($var__19 === "\x01") {
                    return $key[1];
                } else {
                    return null;
                }
            }
        }
    }
}
```

收缩后的部分代码显示如下

![20250508112906](/archives/phpvm-protect/io8pgy.png)

$var__7 中有一个 openssl_decrypt 的代码段，使用时提取到 $var__25 变量

该代码段有几个临时变量名为乱码，手工修改可读显示如下

![20250508114844](/archives/phpvm-protect/izs3m4.png)

至此 vm 代码已经全部可读，代码展开后的完整显示如下，其中 get_value 就是前面的定义，$var__3 为密文由于太长这里删掉了

下来分析 vm 的整体逻辑

```php
function user_function($var__1 = false, $var__2 = 'danger')
{
    global $var__19, $var__25, $var__26, $var__27, $var__35, $callfunc;
    $var__3 = '......';
    true;
    $var__4 = func_get_args();
    $var__5 = array(&$var__3, __FILE__, __FUNCTION__, __CLASS__, version_compare(PHP_VERSION, '5.3') === -1 ? '' : __NAMESPACE__);
    $var__6 = $var__5[0];
    true;
    $var__7 = array(0 => '1;', 1 => 'ÂĹŇŻŻľýţ', 2 => 'fgetc', 3 => 'PHP_VERSION_ID', 4 => 'is_array', 5 => 'function_exists', 6 => 'current', 7 => 'valid', 8 => 'r+', 9 => 'count', 10 => 'fopen', 11 => 'Z5Encrypt VM Error: Unhandled', 12 => '$var__17=array_search($var__8,$var__32);if($var__17===false){$var__33++;$var__32[$var__33]=$var__8;$var__26[$var__33]=NULL;$var__17=$var__33;}return $var__17;', 13 => 'get_object_vars', 14 => 'newInstance', 15 => 'parent::', 16 => 'is_string', 17 => 'array_keys', 18 => 'n*', 19 => 'php://filter/read=zlib.inflate/resource=php://memory', 20 => ' if($var__27[0]==0)return substr($var__27,1);$ŞĄĄ ˛˛=intval($var__27[0]);$ĺ´ĄÉşßĹňŁ=substr($var__27,0,$ŞĄĄ ˛˛+1);$ŘˇČČŘćŚű=substr($var__27,$ŞĄĄ ˛˛+1);$äÓůćŹĆř=openssl_decrypt($ŘˇČČŘćŚű,"AES-128-ECB",$ĺ´ĄÉşßĹňŁ,1);return $äÓůćŹĆř;', 21 => 'call_user_func_array', 22 => 'fread', 23 => 'ob_start', 24 => 'substr', 25 => 'constant', 26 => 'fclose', 27 => 'c/N*', 28 => 'microtime', 29 => 'fputs', 30 => 'strlen', 31 => 'is_numeric', 32 => 'ord', 33 => '#opcodeString', 34 => 'getIterator', 35 => 'next', 36 => 'hasMethod', 37 => 'is_object', 38 => 'defined', 39 => 'newInstanceArgs', 40 => '__construct', 41 => 'key', 42 => 'hi debugger~', 43 => 'unpack', 44 => 'rewind', 45 => 'Nk/na/Nz', 46 => 'str_replace');
    $var__8 = '';
    $var__9 = '$var__17=array_search($var__8,$var__32);if($var__17===false){$var__33++;$var__32[$var__33]=$var__8;$var__26[$var__33]=NULL;$var__17=$var__33;}return $var__17;';
    $var__10 = true;
    while ($var__10) {
        $var__10 = false;
        $var__11 = array();
        $var__12 = ('fopen')('php://filter/read=zlib.inflate/resource=php://memory', 'r+');
        ('fputs')($var__12, $var__6);
        ('rewind')($var__12);
        $var__13 = ('unpack')('n*', ('fread')($var__12, 4));
        $var__14 = ('microtime')(true) * 1000;
        $var__15 = $var__13[2];
        ('fgetc')($var__12);
        $var__16 = ('fread')($var__12, $var__13[1] - 1);
        $var__17 = 0;
        eval('1;');
        unset($var__13);
        $var__18 = ('microtime')(true) * 1000;
        if ($var__18 - $var__14 > 1000) {
            exit('hi debugger~');
        }
        while (true) {
            $var__19 = ('fread')($var__12, 10);
            if ($var__19 === '') {
                break;
            }
            $var__20 = ('unpack')('Nk/na/Nz', $var__19);
            $var__21 = $var__20['k'];
            unset($var__20['k']);
            $var__22 = array('');
            $var__17 = 6;
            while ($var__17 < $var__21) {
                $var__23 = ('unpack')("N", ('fread')($var__12, 4));
                $var__24 = $var__23[1] > 0 ? ('fread')($var__12, $var__23[1]) : '';
                if ($var__24 !== '') {
                    if ($var__24[0] === "\v") {
                        $var__24 = ('unpack')('c/N*', $var__24);
                        $var__24 = ('substr')(func_a(), $var__24[1], $var__24[2]);
                    }
                    if ($var__24[0] === "\x03") {
                        $var__24 = array("\x01", (int) ('substr')($var__24, 1));
                    } elseif ($var__24[0] === "\x06") {
                        $var__24 = array("\x01", true);
                    } elseif ($var__24[0] === "\x07") {
                        $var__24 = array("\x01", false);
                    } elseif ($var__24[0] === "\x08") {
                        $var__24 = array("\x01", (double) ('substr')($var__24, 1));
                    } elseif (('ord')($var__24) <= 12) {
                        $var__24 = array($var__24[0], ('substr')($var__24, 1));
                    } elseif (('is_numeric')($var__24)) {
                        $var__24 = array("\x00", (int) $var__24);
                    } else {
                        $var__24 = array("\x00", $var__24);
                    }
                }
                $var__17 += $var__23[1] + 4;
                $var__22[] = $var__24;
            }
            unset($var__13);
            $var__20['s'] = $var__22;
            $var__11[] = $var__20;
            unset($var__21);
        }
        ('fclose')($var__12);
        $var__25 = ' if($var__27[0]==0)
            return substr($var__27,1);
        $n1=intval($var__27[0]);
        $s1=substr($var__27,0,$n1+1);
        $s2=substr($var__27,$n1+1);
        $r1=openssl_decrypt($s2,"AES-128-ECB",$s1,1);
        return $r1;';
        $var__26 = array();
        $var__27 = '';
        $var__28 = null;
        $var__19 = null;
        $var__29 = false;
        $var__30 = null;
        $var__31 = ('count')($var__11);
        $var__27 = $var__16;
        $var__32 = eval($var__25);
        $var__32 = eval("return {$var__32};");
        unset($var__13);
        $var__33 = $var__31 * 3;
        while ($var__15 < $var__31) {
            $var__34 = $var__11[$var__15];
            if (!$var__34) {
                throw new Exception('Z5Encrypt VM Error: Unhandled');
            }
            $var__35 = $var__34['s'];
            $var__36 = $var__34['z'];
            $var__15 = $var__34['a'];
            switch ($var__36) {
                case 0x1f13:
                    $var__26[$var__35[1][1]] = null;
                    break;
                case 0xdb7:
                    $var__15 = (bool) get_value($var__35[1]) ? get_value($var__35[2]) - 1 : $var__15;
                    break;
                case 0x19d4:
                    $var__15 = (bool) get_value($var__35[1]) ? $var__15 : get_value($var__35[2]) - 1;
                    break;
                case 0x1461:
                    $dynamic = get_value($var__35[1]);
                    eval($dynamic);
                    break;
                case 0x411:
                    $var__26[$var__35[2][1]] = get_value($var__35[1]);
                    break;
                case 0xbd0:
                    $var__37 = $var__26[$var__35[1][1]];
                    $var__15 = ($var__37 ? $var__26[$var__35[2][1]] : $var__26[$var__35[3][1]]) - 1;
                    break;
                case 0x18b2:
                    $var__26[$var__35[1][1]] = $var__5[1];
                    break;
                case 0x1583:
                    $var__26[$var__35[1][1]] = (bool) get_value($var__35[2]);
                    break;
                case 0x9ea:
                    $var__26[$var__35[1][1]] = array();
                    break;
                case 0x107a:
                    $var__26[$var__35[1][1]] = get_value($var__35[2]) !== get_value($var__35[3]);
                    break;
                case 0x4ba:
                    if ($var__35[2] !== '') {
                        $var__26[$var__35[3][1]][get_value($var__35[2])] = get_value($var__35[1]);
                    } else {
                        $var__26[$var__35[3][1]][] = get_value($var__35[1]);
                    }
                    break;
                case 0x1977:
                    break;
                case 0xc9d:
                    $var__26[$var__35[1][1]] = get_value($var__35[1]) - get_value($var__35[2]);
                    break;
                case 0x176b:
                    $var__26[$var__35[1][1]] = array();
                    if ($var__35[3] !== '') {
                        $var__26[$var__35[1][1]][get_value($var__35[3])] = get_value($var__35[2]);
                    } else {
                        $var__26[$var__35[1][1]][] = get_value($var__35[2]);
                    }
                    break;
                case 0x7ea:
                    $var__37 = get_value($var__35[2]);
                    if ($var__29) {
                        $var__38 = @('call_user_func_array')($var__37, $var__26[$var__35[1][1]]);
                    } else {
                        $var__38 = ('call_user_func_array')($var__37, $var__26[$var__35[1][1]]);
                    }
                    if ($var__35[3] !== '') {
                        $var__26[$var__35[3][1]] = $var__38;
                    }
                    break;
                case 0x154e:
                    $var__26[$var__35[1][1]] = $var__5[2];
                    break;
                case 0x1bf2:
                    $var__26[$var__35[1][1]] = !get_value($var__35[2]);
                    break;
                case 0x4e5:
                    $var__37 = get_value($var__35[3]);
                    if (('defined')($var__37)) {
                        $var__26[$var__35[1][1]] = ('constant')($var__37);
                    } elseif (('defined')('PHP_VERSION_ID') && PHP_VERSION_ID >= 50300) {
                        $var__13 = ('str_replace')($var__5[4], '', $var__37);
                        $var__26[$var__35[1][1]] = ('defined')($var__13) ? ('constant')($var__13) : $var__37;
                    } else {
                        $var__26[$var__35[1][1]] = $var__37;
                    }
                    break;
                case 0x9c8:
                    if ($var__35[3] === "") {
                        $var__28 = $var__39;
                    } else {
                        $var__28 = get_value($var__35[3]);
                    }
                    $var__26[$var__35[1][1]] = array();
                    $var__26[$var__35[2][1]] = array($var__28, get_value($var__35[4]));
                    break;
                case 0x1899:
                    $var__28 =& $var__26[$var__35[1][1]];
                    if ($var__35[2] === '') {
                        $var__37 = ('is_string')($var__28) ? ('strlen')($var__28) : (('is_array')($var__28) ? ('count')($var__28) : ($var__28 instanceof ArrayAccess ? null : 0));
                    } else {
                        $var__37 = get_value($var__35[2]);
                    }
                    $var__28[$var__37] = get_value($var__35[3]);
                    unset($var__28);
                    break;
                case 0x11c3:
                    $var__37 = get_value($var__35[4]);
                    if (get_value($var__35[3])) {
                        if ($var__37 === '') {
                            $var__37 = $var__5[3];
                        }
                        $var__40 = new ReflectionClass($var__37);
                        if ($var__40->{'hasMethod'}('__construct')) {
                            if ($var__29) {
                                $var__41 = @$var__40->{'newInstanceArgs'}($var__26[$var__35[2][1]]);
                            } else {
                                $var__41 = $var__40->{'newInstanceArgs'}($var__26[$var__35[2][1]]);
                            }
                        } else if ($var__29) {
                            $var__41 = @$var__40->{'newInstance'}();
                        } else {
                            $var__41 = $var__40->{'newInstance'}();
                        }
                        $var__26[$var__35[1][1]] = $var__41;
                    } else {
                        if ($var__29) {
                            $var__38 = @('call_user_func_array')($var__37, $var__26[$var__35[2][1]]);
                        } else {
                            $var__38 = ('call_user_func_array')($var__37, $var__26[$var__35[2][1]]);
                        }
                        if ($var__35[1] !== '') {
                            $var__26[$var__35[1][1]] = $var__38;
                        }
                    }
                    break;
                case 0x7d7:
                    $var__26[$var__35[1][1]] = $var__5[3];
                    break;
                case 0x478:
                    $var__37 = $var__26[$var__35[1][1]];
                    switch (('count')($var__37)) {
                        case 0:
                            $var__38 = ('ob_start')();
                            break;
                        case 1:
                            $var__38 = ('ob_start')($var__37[0]);
                            break;
                        case 2:
                            $var__38 = ('ob_start')($var__37[0], $var__37[1]);
                            break;
                    }
                    if ($var__35[2] !== '') {
                        $var__26[$var__35[2][1]] = $var__38;
                    }
                    break;
                case 0x14da:
                    $var__26[$var__35[1][1]] = get_value($var__35[2]) < get_value($var__35[3]);
                    break;
                case 0x6b0:
                    $var__28 =& $var__26[$var__35[2][1]];
                    $var__26[$var__35[1][1]] = ('count')($var__28);
                    unset($var__28);
                    break;
                case 0x1975:
                    break;
                case 0x11a9:
                    $var__26[$var__35[1][1]][] =& $var__26[$var__35[2][1]];
                    break;
                case 0xa8e:
                    exit(get_value($var__35[1]));
                    break;
                case 0x1c92:
                    $var__38 = ('function_exists')($var__26[$var__35[1][1]][0]);
                    if ($var__35[2] !== '') {
                        $var__26[$var__35[2][1]] = $var__38;
                    }
                    break;
                case 0x1f6f:
                    $var__26[$var__35[1][1]] = array();
                    break;
                case 0xc4b:
                    $var__26[$var__35[1][1]] = get_value($var__35[2]) === get_value($var__35[3]);
                    break;
                case 0x1bab:
                    $var__37 = get_value($var__35[2]);
                    $var__26[$var__35[1][1]] =& ${$var__37};
                    break;
                case 0x1cbb:
                    $var__37 = get_value($var__35[2]);
                    if (${$var__37} === null) {
                        $var__26[$var__35[1][1]] = get_value($var__35[3]);
                    } else {
                        $var__26[$var__35[1][1]] =& ${$var__37};
                    }
                    break;
                case 0xbb6:
                    $var__37 = get_value($var__35[4]);
                    if ($var__37 === '') {
                        $var__37 = '__construct';
                    }
                    if ($var__35[3] === "") {
                        $var__28 = $var__39;
                        $var__37 = 'parent::' . $var__37;
                    } else {
                        $var__28 = get_value($var__35[3]);
                    }
                    $var__26[$var__35[1][1]] = array();
                    $var__26[$var__35[2][1]] = array($var__28, $var__37);
                    break;
                case 0x9d2:
                    $var__37 = get_value($var__35[3]);
                    $var__26[$var__35[1][1]] = $var__37(get_value($var__35[2]));
                    break;
                case 0x10c9:
                    $var__26[$var__35[1][1]] = !(bool) get_value($var__35[2]);
                    break;
                case 0xc0b:
                    $var__26[$var__35[1][1]] = get_value($var__35[2]) . get_value($var__35[3]);
                    break;
                case 0x16da:
                    echo get_value($var__35[1]);
                    break;
                case 0x1cf3:
                    $var__26[$var__35[1][1]] = 'ńüă­űÉňá';
                    break;
                case 0x757:
                    $var__37 = get_value($var__35[2]);
                    while ($var__37 instanceof IteratorAggregate) {
                        $var__37 = $var__37->{'getIterator'}();
                    }
                    if ($var__37 instanceof Iterator) {
                        $var__26[$var__35[1][1]] = array($var__37, null, null, 0, $var__35[3], 'i');
                    } elseif (('is_object')($var__37)) {
                        $var__26[$var__35[1][1]] = array($var__37, null, null, 0, $var__35[3], 'o');
                    } else {
                        $var__26[$var__35[1][1]] = array($var__37, ('array_keys')($var__37), null, 0, $var__35[3], 'a');
                    }
                    break;
                case 0x1e6f:
                    $var__13 = get_value($var__35[1]);
                    $var__28 =& $var__26[$var__35[2][1]];
                    if ($var__28[5] === 'i') {
                        if ($var__28[3] === 0) {
                            $var__28[0]->{'rewind'}();
                        } else {
                            $var__28[0]->{'next'}();
                        }
                        $var__28[3]++;
                        if (!$var__28[0]->{'valid'}()) {
                            $var__15 = get_value($var__28[4]) - 1;
                        } else {
                            $var__26[$var__35[3][1]] = $var__28[0]->{'current'}();
                            if ($var__13) {
                                $var__26[$var__35[4][1]] = $var__28[0]->{'key'}();
                            }
                        }
                    } else {
                        if ($var__28[5] === 'o') {
                            $var__37 = ('get_object_vars')($var__28[0]);
                            $var__42 = ('array_keys')($var__37);
                        } else {
                            $var__37 =& $var__28[0];
                            $var__42 =& $var__28[1];
                        }
                        if ($var__28[3] >= ('count')($var__37)) {
                            $var__15 = get_value($var__28[4]) - 1;
                        } else {
                            if ($var__13) {
                                $var__26[$var__35[4][1]] = $var__42[$var__28[3]];
                            }
                            $var__26[$var__35[3][1]] = $var__37[$var__42[$var__28[3]]];
                            $var__28[3]++;
                        }
                        unset($var__37);
                        unset($var__42);
                    }
                    unset($var__28);
                    break;
                case 0x56f:
                    $var__26[$var__35[1][1]] = get_value($var__35[2]) - get_value($var__35[3]);
                    break;
                case 0x1815:
                    break;
            }
        }
        foreach ($var__26 as $var__43 => &$var__44) {
            unset($var__26[$var__43]);
        }
        unset($var__11);
        unset($var__26);
        unset($var__44);
        unset($var__37);
        unset($var__28);
    }
    return $var__30;
    $var__45;
    return NULL;
    $var__45;
}
```

## 代码分析

经过前面处理，代码已经全部可读，可以在此基础上进行任意修改代码进行调试，不过需要注意 eval 调用

在没确认安全前，直接进行 eval 调用是非常危险的，一些产品会在反逆向的时插入暗装，严重的可能会直接进行硬盘格式化

单步调试是一个漫长的过程，涉及到异常的情况，需要手工修改代码逻辑再次调试，整体还是比较麻烦的

这里就不展示过程了，整体逻辑和 Ganlv 大佬的分析差别不大，vm 部分暂不涉及，不过就目前的分析来看

1、最前面有一个 microtime 的检查，可以注释忽略掉

2、初始指令流会从 $var__3 中 unpack 出来

3、unpack 指令流后，通过 $var__25 中的 openssl_decrypt 进行解密，密文组成为：key长度 + key + 待解密数据

4、虚拟机的 vm 流分两轮，第一轮校验并解密业务流，第二轮执行业务流

5、待解密的业务流在 func_a 函数中的 $a 数据中，前面这一行已经截取出来 `$var__24 = ('substr')(func_a(), $var__24[1], $var__24[2]);`

6、这段业务流的解密，在分支中的 call_user_func_array 中进行处理，通过 openssl_decrypt 进行解密

7、这里的 openssl_decrypt 和前面 $var__25 的不同，前面是 ECB 解密，这里是 CBC 解密

8、openssl_decrypt 的 CBC 解密除了需要 key 外，额外还需要一个 IV

9、第一轮 vm 迭代的时候，通过 ReflectFunction 反射，然后 getStartLine、getEndLine 起始行拿到 func_b 函数文本

10、将 func_b 函数文本通过 hash_hmac 计算哈希值，然后进行 str_rot13 处理拿到解密的 key 

11、每一个加密文件的 func_b 都是不同的，因此没有通用的 key，但是同一个文件不同函数的 key 是相同的

12、再次通过 ReflectFunction 反射，然后 getStartLine、getEndLine 起始行拿到 user_function 函数文本

13、截取 user_function 的 从 `;true;` 到函数结束 `;$_SERVER;}` 的代码文本，计算 md5 值，这个就是 IV

14、在 user_function 函数计算 md5 的这部分代码中，使用到的一些变量，在每一个文件的每一个函数内都是不同的，因此没有通用的 IV

15、在得到 key 和 IV 后，通过 call_user_func_array 调用 openssl_decrypt 解密业务流

16、解密业务流后，进入第二轮 vm 迭代，流程转到业务代码执行，当然业务代码依然还是加密的，以及经 vm 处理的

17、这里可以看出，如果代码文件被改动，就会导致 key 和 IV 都计算错误，业务流解密必然失败

18、vm 普遍存在运行速度拖慢的问题，几行的业务函数，膨胀到近 400 条业务指令，这还不涉及前面校验这些，实在有点夸张

19、从安全角度来看，z5还是非常难逆向的，速度慢的问题需要使用人员衡量
