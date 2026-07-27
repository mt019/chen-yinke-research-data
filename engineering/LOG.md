# 工程紀錄

## 2026-07-27｜產生第三章樣章前端契約並接上 Canvas 細讀面

- 執行既有 `build-liu-rushi-edition.py` 對七冊 EPUB 產出保真區塊樹（`data/processed/liu-rushi-edition/`，27 檔、5,676 區塊、168 圖），確認 class 映射對得上：`bodytext`＝正文、`bodytext-fs-*`＝仿宋引文、`bodytext-kt-*`＝楷體詩文。此前只有生成器、無輸出。
- 新增 `engineering/scripts/build-pilot-view.py`：把 pilot 註釋層（`pilot-third-chapter-opening.json`）與 `files/text00156.json` 的實際區塊原文合成單一前端契約 `data/processed/liu-rushi-edition/pilot-view.json`（7 單元、19 段、正文 10／引文 6／寅恪案 3）。前端不再需要解析區塊 ID 或碰 EPUB。
- 契約解析：以區塊 type 判 role（正文／引文／寅恪案）、以 `俟考` 標開放問題、以全形（…）切出陳寅恪括注（顯影時暗排、不冒充原引文）、帶入來源歸組、跨章指引與判斷語氣。pilot 少數簡體註記以定向 S→T 表正規化為繁體（本站繁體）。
- `sync-to-canvas.mjs` 增同步 `pilot-view.json` → `../my-canvas-lab/src/data/chenYinke/liu-rushi-edition/`。`npm run validate` 一併驗 5,676 區塊。
- Canvas 端（只渲染）：新增 `src/pages/_chen-yinke/LiuRushiEdition.{jsx,module.css}`，橫排安靜正文＋六層按需顯影（材料來源／寅恪案／開放問題／跨章／人物／編者脈絡），預設全關；接為 `/chenyinke` 首個分頁「細讀・第三章」。排版方向定案：橫排為主，直排列為日後可選視圖。
- 人物顯影改用全站共用 HoverCard（portal、Esc／點外關閉），卡片＝正名＋別名＋一句身分；身分句（gloss）寫在資料倉 `build-pilot-view.py`，contested 點（河東君本姓）不斷言、留給正文。
- slug 定 `chenyinke`（不改路由）：經全網查核，「恪」標準音 kè、陳本人英文署名亦用 -k-（Yinkoh/Yinke）、英文維基條目標題即 Chen Yinke，四者同指；詳見 `notes/研究紀錄.md` 2026-07-27 讀音條。待辦：頁面加一句保守讀音注。
- 字型：柳如是別傳古字（442）觸發覆蓋防線，已由平行 session 重建的 comprehensive Chiron fallback 子集全涵蓋；build 僅餘 2 個與本專案無關的字（U+02CB brief-events、U+04D2 jirsGlossary）待該線處理。本 session 未碰 fonts／index.css，避免共用工作樹競寫。

## 2026-07-27｜研究留痕與工程留痕分帳

- 新增 `notes/研究紀錄.md`，專記來源鑑定、校勘發現、編纂判斷與待核問題。
- 本檔維持工程唯一操作日誌，專記資料抽取、模型、驗證、同步與前端變更。
- 確立兩本帳都採新紀錄置頂；研究結論須帶來源定位，工程變更須帶可重做的命令或產物。
- 完成獨立《柳如是別傳》EPUB／PDF 初步檢查；尚未改變正式底本，也未把原始檔複製進資料倉。

## 2026-07-27｜互動重排改採保真區塊模型

- 確認原 EPUB 在第七冊保留章題、18 個節題、正文／仿宋／楷體等段落類別，以及 168 次行內圖片。
- 純文字段落資料降為研究索引，不再作為正式重排底稿。
- 新增 lossless XHTML block-tree 產生器，保存原始標籤、CSS 類別、行內換行、span 與圖片位置。
- 建立圖片字形清單；人工辨識前不以空字元取代。
- 參照 Van Gogh Letters、Scaife Viewer、Shelley–Godwin Archive 與 William Blake Archive，確立「正文優先、輔助層按需顯影」。

## 2026-07-26｜產生《柳如是別傳》前端原文語料

- 將卷前與五章轉為分章 JSON，每段有穩定 ID、章內順序、子題、來源檔與來源檔內順序。
- 新增原文總索引；前端可先載入總索引，再按章載入正文。
- 驗證器檢查段落總數、ID 唯一性、連續順序、空段及私密路徑。
- 同步腳本一併複製原文語料至 Canvas 的 `src/data/chenYinke/liu-rushi/`。

## 2026-07-26｜解除原文不得進前端的限制

- 經資料倉整理、帶有卷章與段落定位的原文可以同步至 Canvas。
- EPUB 原檔、本機路徑、取得站資訊與私人筆記仍不得進前端。
- 前端只讀資料倉輸出的原文資料，不在 Canvas 倉庫解析 EPUB。

## 2026-07-26｜抽取《柳如是別傳》正文材料

- 確認第七冊使用 `text00143.html` 至 `text00169.html`，共 27 個內容檔。
- 依卷前材料與五章切分全文；完整文字存入不進 Git 的 `data/raw/books/liu-rushi/`。
- 產生 `data/materials/liu-rushi/chapter-index.json`，記錄每章來源檔、字數、段數與可辨識子題。
- 新增 `notes/柳如是別傳_研究入口.md`，確定先從第三章的三期與嘉定之游試作細讀。

## 2026-07-26｜改以《柳如是別傳》為中心

- 公開頁面的第一閱讀入口改為《柳如是別傳》。
- 新增四組核心問題、人物線索與閱讀路徑。
- 其餘六冊保留為文集脈絡，不再與《柳如是別傳》等量呈現。
- 前端文案只呈現研究內容與閱讀操作，不顯示資料處理術語。

## 2026-07-26｜建立專案

- 建立研究資料倉庫與公開／私有分層。
- 確認來源為合併七冊 EPUB，內含 NCX 目錄與至少 170 個 HTML 內容檔。
- 建立七冊初始資料、驗證腳本與 Canvas Lab 同步機制。
- 原始 EPUB 保留於使用者既有書庫，不複製、不提交、不公開。
