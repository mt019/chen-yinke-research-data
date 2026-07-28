# 資料契約

Canvas Lab 只接收本倉庫 `data/processed/` 下列出的公開快照，不直接
讀取研究材料、原始 EPUB 或建置程式。

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

## 第三章細讀樣章

`data/materials/liu-rushi-edition/pilot-third-chapter-opening.json` 同時
保存研究編者草稿與公開注釋清單；`npm run build:pilot` 將它與保真區塊樹合成
`data/processed/liu-rushi-edition/pilot-view.json`。只有後者同步至
Canvas Lab。

### 2.0 provenance 契約

- `blocks[].recordType = source-transcription`：該區塊是陳寅恪原文轉錄。
- `blocks[].sourceText`：保真區塊的逐字原文；不得正規化、改寫或刪去
  「寅恪案」及標點。
- `blocks[].segments`：只增加顯示角色。所有 `segments[].text` 依序串接
  後必須逐字等於 `sourceText`。
- `blocks[].sourceTextSha256`：原文字串的 SHA-256，防止投影時無聲改寫。
- `publicAnnotations`：唯一可進入公開快照的研究注釋。每筆必須明確記錄
  `attribution.assertionOwner`、`attribution.wordingBy`、
  `attribution.representation`、`basis`、`review.status` 及
  `publicStatus = public`。公開的編者解讀可以是經使用者授權明示的
  `draft-disclosed`；只有逐條完成非機器人工核准者才能是 `approved`。

`readingUnits` 只保存 `id`、`blocks`。尚未公開的書目歸組、來源橋接、
年代、人物與閱讀行為集中在 `editorialDrafts`，統一
`machine-drafted + withhold`；生成器不得直接投影該區。

編者解釋可以公開，但只能逐筆進入 `publicAnnotations`。目前公開的
既有解釋均採 `editorial-inference + draft-disclosed`，畫面明示
「編者分段／編者說明／編者解讀」。日後逐條確認確實是在轉述陳寅恪
論旨時，才可改為 `author-paraphrase`，並顯示
「陳氏論旨（編者轉述）」。

`annotationAudits` 保存逐條編輯審核帳，不進公開快照。機器協助審核可
提出 `author-paraphrase-candidate`，但必須同時標記
`humanApprovalRequired = true`；在非機器人工核准前，公開注釋仍維持
`editorial-inference + draft-disclosed`。審核帳的 `basisChecked`
必須與注釋當前 `basis` 完全一致，防止原文依據改動後沿用舊結論。

人物 Hover 的 `entities` 是 `literal-name-index`：別名必須實際出現
於原文並回指命中區塊；人物短傳不屬本層。

驗證器要求 `b0002–b0244` 無漏段、無重複且維持原順序，逐區塊檢查：

1. `sourceText` 與保真區塊完全相同；
2. `segments` 可逐字重組原文；
3. SHA-256 相符；
4. `editorialDrafts` 沒有洩漏；
5. 所有公開注釋均有可見標籤、明確 provenance 與合格公開狀態；
6. 人物 Hover 的每個表面形式均能在所列原文區塊找到。
7. 每條公開解讀均有一筆未過期的審核帳，候選轉述不得自動升格。

## 《柳如是別傳》原文

`data/processed/liu-rushi/index.json` 列出卷前與五章；每章由獨立 JSON 保存，避免前端初次載入整部原文。

每段欄位：

- `id`：穩定識別碼，格式為 `lrs-章序-段序`。
- `sequence`：章內順序。
- `sectionId`、`sectionTitle`：章次。
- `subheading`：最近一個已辨識的章內子題，沒有時為 `null`。
- `sourceFile`、`sourceOrder`：EPUB 內來源檔及該檔段落順序。
- `text`：原文。
