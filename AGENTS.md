# 工作規則

- 本倉庫保存研究材料與處理結果；Canvas Lab 只保存可公開資料快照與呈現程式。
- EPUB 原檔、私人筆記與本機絕對路徑不得進入 `data/processed/`。經整理的原文可以進入前端資料；必須保留卷、章、段落與來源檔定位。
- 卷冊、篇名、版本資訊必須能追溯至來源；未核對者標示 `待核`，不得推定。
- 更新公開資料後執行 `npm run validate` 與 `npm run sync`。
- 工程紀錄只寫入 `engineering/LOG.md`，新紀錄置頂。
- `readingUnits` 只准有 `id`、`blocks`；研究整理放 `editorialDrafts`，
  要公開的解釋只能逐筆進 `publicAnnotations`。
- 原文必須能由 `segments` 逐字重組並通過 SHA-256；不得以摘要替換原文。
- 編者解釋可以公開，但畫面必須明確標示「編者分段／說明／解讀」；
  未逐條核准者不得標成「陳氏論旨」。
- 人物 Hover 短注、外部資料或異名考證都必須帶 provenance；僅原文
  實際出現的稱謂索引可作為結構層直接公開。
- 標準檢查順序：
  `npm run test:provenance && npm run build:pilot && npm run validate && npm run sync`。
