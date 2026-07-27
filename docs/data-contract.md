# 資料契約

`data/processed/chen-yinke-app.json` 是唯一可同步到 Canvas Lab 的資料。

頂層欄位：

- `schemaVersion`：契約版本。
- `generatedAt`：資料整理日期。
- `source`：不含本機路徑的來源類型與公開限制。
- `project`：專案名稱、說明與目前階段。
- `spotlight`：目前優先閱讀的著作、核心問題、人物與閱讀路徑。
- `materialCoverage`：卷冊數、篇章解析狀態與完成度。
- `volumes`：七冊的標題、類型、研究切口及狀態。
- `methodPlan`：後續整理步驟。
- `immediateNextWork`：近期工作佇列。

公開資料可以包含經整理的原文段落。原文資料必須帶有穩定識別碼、卷章歸屬、段落順序與來源檔定位，供前端閱讀、搜尋及引用。

不得包含 EPUB 二進位檔、本機絕對路徑、取得站資訊或私人筆記。

## 《柳如是別傳》原文

`data/processed/liu-rushi/index.json` 列出卷前與五章；每章由獨立 JSON 保存，避免前端初次載入整部原文。

每段欄位：

- `id`：穩定識別碼，格式為 `lrs-章序-段序`。
- `sequence`：章內順序。
- `sectionId`、`sectionTitle`：章次。
- `subheading`：最近一個已辨識的章內子題，沒有時為 `null`。
- `sourceFile`、`sourceOrder`：EPUB 內來源檔及該檔段落順序。
- `text`：原文。
