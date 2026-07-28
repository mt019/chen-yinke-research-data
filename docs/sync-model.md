# 同步模型

資料倉庫是研究資料真相來源。Canvas Lab 使用一份手動複製的公開快照：

```text
data/processed/chen-yinke-app.json
  → ../my-canvas-lab/src/data/chenYinke.json

data/processed/liu-rushi/*.json
  → ../my-canvas-lab/src/data/chenYinke/liu-rushi/*.json

data/processed/liu-rushi-edition/pilot-view.json
  → ../my-canvas-lab/src/data/chenYinke/liu-rushi-edition/pilot-view.json
```

執行：

```sh
npm run build:pilot
npm run validate
npm run sync
```

同步腳本也接受自訂目標路徑作為第一個參數。Canvas Lab 只保存這些
可公開快照與呈現程式；研究註釋、原始材料及建置邏輯均留在本倉庫。
部署環境不會讀取本倉庫或本機 EPUB。

同步完成後另寫入 `src/data/chenYinke.sync.json`，列出本次送出的每個
JSON 與行內罕字圖像及其 SHA-256。Canvas 的 `npm run validate:synced`
會重算比對；任何快照或圖像若在前端倉被手改，build 必須失敗。
