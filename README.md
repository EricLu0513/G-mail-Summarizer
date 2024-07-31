<h1 align= "center">G-mail Summarizer<h1>

## 安裝步驟

**STEP 1**

將資料夾用到本地(本機)

```bash
git clone git@github.com:EricLu0513/G-mail-Summarizer.git
```

**STEP 2**

先安裝node.js 與 npm (如果已安裝過可略過這步)

```bash
sudo apt install nodejs npm
```
**STEP 3**

安裝必要的dependencies

```bash
npm install
```

**STEP 4**

創立資料夾(info/)，並在底下創立二個檔案，分別命名為 client_secret.json 與 gpt.json。

```bash
mkdir info
touch client_secret.json
touch gpt.json
```

**STEP 5**

點擊以下連結，並將secret_key複製到gpt.json

[申請secret_key連結](https://api.chatanywhere.org/v1/oauth/free/github/render) (需要綁定GitHub帳號)

**STEP 6**

進入Google Cloud去申請使用API，並將json檔加入client_secret.json

[教學資源](https://blog.uwinfo.com.tw/auth/article/bike/492)

**STEP 7**

點擊以下連結，下載這個chrome_extension

[下載網址]()
## 第一次使用教學

**STEP 1**

啟動本地的終端機

```bash
node gpt.js
```
**STEP 2**

然後會在終端機看見一個連結，點擊此連結進行身分認證，獲得token.json，然後就可以關閉終端機，重新執行上面的代碼一次。

**STEP 3**

點擊 Chrome 擴展 (G-mail Summarizer)，按下啟動（通常需要等 1 分鐘），即可看見今日的 G-mail 大綱。按下取消（則可以關閉使用）。
















