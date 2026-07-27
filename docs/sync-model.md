# 同步模型

資料倉庫是研究資料真相來源。Canvas Lab 使用一份手動複製的公開快照：

```text
data/processed/chen-yinke-app.json
  → ../my-canvas-lab/src/data/chenYinke.json

data/processed/liu-rushi/*.json
  → ../my-canvas-lab/src/data/chenYinke/liu-rushi/*.json
```

執行：

```sh
npm run validate
npm run sync
```

同步腳本也接受自訂目標路徑作為第一個參數。部署環境不會讀取本倉庫或本機 EPUB。
