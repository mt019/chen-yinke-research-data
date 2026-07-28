# 工程說明

- `LOG.md`：最新在上的工作紀錄。
- `scripts/build-pilot-view.py`：依 `reading-views.json` 的全書次序，把各單元的研究層與保真區塊合成單一公開細讀快照。
- `scripts/validate-processed.mjs`：檢查公開 JSON 的必要欄位與私密路徑。
- `scripts/sync-to-canvas.mjs`：驗證後同步至 Canvas Lab。

新增或更新任一細讀單元時依序執行：

```sh
npm run test:provenance
npm run generate:chapter-2
npm run build:reading
npm run validate
npm run sync
```

`test:provenance` 同時測安全正例與應被拒絕的負例；新增公開注釋類型
或審核狀態時，必須先補測試再改 validator。

長期準則：

1. `reading-views.json` 只登記不截斷文本功能的自然單元，並按原書次序排列。
2. `workAuthor` 是著作責任；`textAttribution` 是當前選段的文字責任，出版社說明不得標成陳寅恪正文。
3. `sourceText` 與 `segments` 必須逐字重組且通過雜湊；現代說明只能進有歸屬、依據與審核狀態的 `publicAnnotations`。
4. 全書進度由 builder 計算；中間缺章必須公開保留，不得用選段總數暗示連續完成。
5. Canvas 只渲染 `reading-view.json` 快照，不保存研究材料，也不在 JSX 推導作者、進度或解讀。
6. 遇到跨 EPUB 檔的前引、回收或連作，完成點以文本功能為準；不得為了檔案邊界截斷自然單元。
