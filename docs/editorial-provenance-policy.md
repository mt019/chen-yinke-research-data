# 編者內容與原文的長期維護準則

本準則適用於《柳如是別傳》細讀資料及日後所有陳寅恪文集注釋。核心
要求不是排除解釋，而是讓讀者永遠能辨認：哪一句是原文、哪一句是
編者轉述、哪一句是編者自己的判斷、哪一句來自外部資料。

## 一、資料區域

### `readingUnits`

只准保存 `id` 與 `blocks`。不得加入標題、摘要、人物說明、書目判斷
或年代結論。這是原文結構層。

### `editorialDrafts`

保存尚未決定是否公開的研究工作，包括書目歸組、來源橋接、年代草表、
人物消歧、閱讀行為與其他編者材料。整區預設為
`machine-drafted + withhold`，生成器不得直接投影本區。

### `publicAnnotations`

唯一可進入 Canvas 的解釋層。每筆都必須有穩定 ID、可見標籤、內容
類型、陳述歸屬、原文依據、審核／揭露狀態與公開狀態。

## 二、公開注釋類型

| `annotationType` | 畫面標籤 | `assertionOwner` | `representation` |
|---|---|---|---|
| `editorial-heading` | 編者分段 | `project-editor` | `editorial-heading` |
| `editorial-note` | 編者說明 | `project-editor` | `editorial-note` |
| `editorial-inference` | 編者解讀 | `project-editor` | `editorial-inference` |
| `author-paraphrase` | 陳氏論旨（編者轉述） | `chen-yinke` | `editorial-paraphrase` |
| `external-authority` | 外部補充 | `external-authority` | `source-synthesis` |

任何不是逐字原文的句子，`wordingBy` 一律是 `project-editor`。即使
`assertionOwner = chen-yinke`，也只表示命題歸屬陳氏，不表示畫面上的
現代中文是陳氏原句。

## 三、兩種公開門檻

`approved` 表示逐條人工覆核完成，必須記 `reviewedBy` 與
`reviewedAt`。

`draft-disclosed` 表示解釋仍是編者草稿，但使用者已明確允許公開。
必須記 `authorizedBy = user`、`authorizedAt` 與可見的
`displayLabel`。此狀態不得標成「陳氏論旨」或省略標籤。

機器協助的逐條審核只可寫入 `annotationAudits`，提出
`author-paraphrase-candidate` 或 `retain-editorial-inference`。候選項
必須保留 `humanApprovalRequired = true`；未經非機器人工覆核，不得
改成 `author-paraphrase + approved`。

## 四、原文不變條件

每個公開原文區塊必須同時符合：

1. `recordType = source-transcription`
2. `author = 陳寅恪`
3. `sourceText` 逐字等於保真區塊
4. `segments[].text` 串接後逐字等於 `sourceText`
5. `sourceTextSha256` 與原文相符

分段只可增加顯示角色，不得刪掉「寅恪案」、逗號、括號、補字或任何
字元。

## 五、人物 Hover

- `literal-name-index` 可以公開，但只收原文實際出現的表面形式，每個
  名稱必須回指 `blockId + matchedText`。
- 人物生平、身分判斷、異名考證屬注釋，必須走
  `publicAnnotations` 或同等嚴格的已標示注釋契約。
- 現階段 Hover 顯示正名、原文已見稱謂及「原文稱謂索引」；不暗中
  混入人物短傳。

## 六、標準維護流程

```sh
npm run audit:pilot
npm run test:provenance
npm run build:pilot
npm run validate
npm run sync
cd ../my-canvas-lab
npm run build
```

順序不可顛倒。資料只在本倉庫修改；Canvas 的
`src/data/chenYinke*.json` 不得手改。

## 七、固定閘門

- provenance 單元測試包含正例與負例。
- validator 採公開欄位白名單；新增未知欄位預設失敗。
- 未標歸屬、無 `basis`、機器冒充人工覆核、外部資料無 HTTPS 來源、
  原文不能逐字復原，任一情形均失敗。
- 每條公開解讀必須有一筆 `annotationAudits`；`basisChecked` 與當前
  `basis` 不一致即視為審核過期。
- sync 產生 `chenYinke.sync.json`，Canvas build 重算全部同步 JSON 與
  行內罕字圖像的 SHA-256；任何前端手改均失敗。
- 陳寅恪頁 JSX 總行數上限為 650 行；超過時先檢查是否把內容或研究
  邏輯誤寫進 Canvas。

## 八、例行檢查與事故處理

- 每次新增或修改公開注釋：跑完整流程。
- 每次變更 schema：同步更新本文件、`data-contract.md`、驗證器、
  負向測試與 Canvas 消費端。
- 每擴充 50–100 個原文區塊：抽查首段、末段、一個「寅恪案」、一個
  引文括注及一個人物 Hover。
- 若發現解釋冒充原文：立即改為 `withhold` 或補上正確可見標籤；
  重建、同步，並在 `engineering/LOG.md` 置頂記錄。
- 不以「build 通過」代替內容審核；build 只證明契約沒有被違反。
