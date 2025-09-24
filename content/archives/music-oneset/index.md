---
categories:
- 默认分类
date: '2025-09-24 12:26:24+08:00'
description: ''
draft: false
image: ''
slug: music-oneset
cover: /archives/music-oneset/xfcug6.png
tags:
- python
- oneset
- librosa
title: 基于python生成音乐的onset节拍信息
---

音乐文件的节拍信息，在一些视频剪辑中非常流行，在剪映中可以通过下面 “踩节拍” 的方式进行一键操作

![](/archives/music-oneset/xfcug6.png)

如果希望使用自动化进行处理，可以通过代码的方式进行封装处理，python 中提供了成熟的 librosa 代码库

安装 python 的依赖库

```shell
python -m pip install librosa
```

编写代码，核心的代码就是下面这一段，onset_detect 检测，其中 units 是指定检测的单位，默认为帧，time 表示指定时间

```python
import librosa

y, sr = librosa.load('audio/music.wav')
onsets = librosa.onset.onset_detect(y=y, sr=sr, units='time')
print(onsets)
```

打印出来的 oneset 节拍信息如下，这里的值是秒

```shell
[ 0.2554195   0.88235828  1.20743764  1.50929705  2.15945578  2.78639456
  4.04027211  5.31736961  5.94430839  6.2461678   6.57124717  7.19818594
  7.82512472  9.10222222 10.35609977 10.98303855 11.63319728 12.88707483
 13.51401361 14.14095238 15.41804989 16.04498866 16.67192744 17.62394558
 17.94902494 21.73387755 22.36081633 22.9877551  24.89179138 25.19365079
 25.84380952 27.42276644 27.72462585 28.04970522 28.67664399 29.00172336
 29.93052154 30.58068027 32.78657596 33.08843537 33.7385941  34.36553288
 35.31755102 35.61941043 36.24634921 36.89650794 38.15038549 38.47546485
 38.77732426 39.10240363 39.40426304 40.68136054 40.98321995 41.30829932
 41.63337868 41.9352381  42.88725624 43.83927438 44.86095238]
 ```

使用帧检测打印输出如下

```shell
[  11   38   52   65   93  120  174  229  256  269  283  310  337  392
  446  473  501  555  582  609  664  691  718  759  773  936  963  990
 1072 1085 1113 1181 1194 1208 1235 1249 1289 1317 1412 1425 1453 1480
 1521 1534 1561 1589 1643 1657 1670 1684 1697 1752 1765 1779 1793 1806
 1847 1888 1932]
```

将处理代码封装成 api 接口，提供给外部程序使用

```python 
from flask import Flask, request, jsonify
import os
import librosa

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'm4a'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        try:
            y, sr = librosa.load(file_path)
            mfccs = librosa.feature.mfcc(y=y, sr=sr)
            mfccs_list = mfccs.tolist()
            return jsonify({'mfcc': mfccs_list}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

```

客户端通过读取 music 文件，将文件内容通过 POST 请求打包发送给 python 端进行处理，处理完毕后响应回 onesets 信息

```c++
#include <windows.h>
#include <winhttp.h>
#include <iostream>
#include <fstream>
#include <vector>

#pragma comment(lib, "winhttp.lib")

std::wstring s2ws(const std::string& s) 
{
    int len;
    int slength = (int)s.length() + 1;
    len = MultiByteToWideChar(CP_ACP, 0, s.c_str(), slength, 0, 0); 
    wchar_t* buf = new wchar_t[len];
    MultiByteToWideChar(CP_ACP, 0, s.c_str(), slength, buf, len);
    std::wstring r(buf);
    delete[] buf;
    return r;
}

std::vector<char> readFile(const std::string& filename)
{
    std::ifstream file(filename, std::ios::binary | std::ios::ate);
    std::ifstream::pos_type pos = file.tellg();

    std::vector<char> result(pos);

    file.seekg(0, std::ios::beg);
    file.read(&result[0], pos);

    return result;
}

int main()
{
    std::string filename = "path/to/your/music/file.wav";
    std::vector<char> fileData = readFile(filename);

    HINTERNET hSession = WinHttpOpen(L"A WinHTTP Example Program/1.0", WINHTTP_ACCESS_TYPE_DEFAULT_PROXY, 
                                     WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
    if (!hSession)
    {
        std::cerr << "Error in WinHttpOpen: " << GetLastError() << std::endl;
        return 1;
    }

    HINTERNET hConnect = WinHttpConnect(hSession, L"localhost", INTERNET_DEFAULT_HTTP_PORT, 0);
    if (!hConnect)
    {
        std::cerr << "Error in WinHttpConnect: " << GetLastError() << std::endl;
        WinHttpCloseHandle(hSession);
        return 1;
    }

    HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"POST", L"/upload", NULL, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, 0);
    if (!hRequest)
    {
        std::cerr << "Error in WinHttpOpenRequest: " << GetLastError() << std::endl;
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        return 1;
    }

    std::wstring headers = L"Content-Type: multipart/form-data; boundary=----BOUNDARY\r\n";
    std::string boundary = "----BOUNDARY";
    std::string fileHeader = "--" + boundary + "\r\nContent-Disposition: form-data; name=\"file\"; filename=\"" 
                            + filename + "\"\r\nContent-Type: application/octet-stream\r\n\r\n";
    std::string fileFooter = "\r\n--" + boundary + "--\r\n";

    std::vector<char> postData(fileHeader.begin(), fileHeader.end());
    postData.insert(postData.end(), fileData.begin(), fileData.end());
    postData.insert(postData.end(), fileFooter.begin(), fileFooter.end());

    BOOL bResults = WinHttpSendRequest(hRequest, headers.c_str(), (DWORD)headers.length(), 
                                       &postData[0], (DWORD)postData.size(), (DWORD)postData.size(), 0);
    if (!bResults)
    {
        std::cerr << "Error in WinHttpSendRequest: " << GetLastError() << std::endl;
    }
    else
    {
        bResults = WinHttpReceiveResponse(hRequest, NULL);
    }

    if (bResults)
    {
        DWORD dwSize = 0;
        DWORD dwDownloaded = 0;
        LPSTR pszOutBuffer;
        do
        {
            dwSize = 0;
            if (!WinHttpQueryDataAvailable(hRequest, &dwSize))
            {
                std::cerr << "Error in WinHttpQueryDataAvailable: " << GetLastError() << std::endl;
            }

            pszOutBuffer = new char[dwSize + 1];
            if (!pszOutBuffer)
            {
                std::cerr << "Out of memory" << std::endl;
                dwSize = 0;
            }
            else
            {
                ZeroMemory(pszOutBuffer, dwSize + 1);
                if (!WinHttpReadData(hRequest, (LPVOID)pszOutBuffer, dwSize, &dwDownloaded))
                {
                    std::cerr << "Error in WinHttpReadData: " << GetLastError() << std::endl;
                }
                else
                {
                    std::cout << "Response: " << pszOutBuffer << std::endl;
                }
                delete[] pszOutBuffer;
            }
        } while (dwSize > 0);
    }

    if (!bResults)
    {
        std::cerr << "Error has occurred: " << GetLastError() << std::endl;
    }

    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);

    return 0;
}
```