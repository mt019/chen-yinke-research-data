# 工程紀錄

## 2026-07-29｜第二章 101 區塊全收

- 完成 `text00155-b0001–b0101` 全章，依論證功能切成 10 個連續
  閱讀單元；章題、導語、引文與結論均不落在單元外。
- 公開標示 44 段引文來源，包括錢謙益、吳偉業、王士禛、陳子龍、
  李雯、《詩經》《真誥》及作者未詳的傳本；章級主要文字責任仍為
  陳寅恪，引文內「寅恪案」「某字可注意」另以公開說明釐清。
- 新增 10 個編者分段與 2 則責任／確定度說明；「雲娟」維持陳氏
  「竊疑」假說，不因後續材料具有解釋力而升格為確證。
- 人物 hover 只沿用本章實見且已核的稱謂；排除普通詞「年少」
  誤連萬壽祺，也暫不把姓名有衝突的「燕又（彭賓）」套入彭燕又。
- 全書公開細讀由 309 增至 410 區塊；卷前、第一章、第二章完整，
  第三章部分，第二章 validator 硬性核對 101 連續 ID、10 單元、
  44 引文責任與 complete 進度。

## 2026-07-29｜卷前與第一章全收

- 實收 `text00143-b0001` 至 `text00153` 全部 37 區塊；因
  `text00147-b0005` 以前引「觀下列諸詩」統攝後文，續收
  `text00154-b0001–b0003`；再續收 b0004–b0029 的釋證範圍、
  義例與例證，停在第一章末。`text00155-b0001` 才另起第二章，
  因此形成從全書開頭起算的 66 區塊連續內容帶。
- 新增一九八〇年出版説明、陳氏〈附記〉、第一章兩篇開章詩、
  撰著緣起、七組著書感懷詩及釋證義例材料；公開細讀由 250
  增至 309 區塊。
- 文字責任逐檔核定：兩篇出版説明屬上海古籍出版社，〈附記〉及
  第一章詩文屬陳寅恪；另在混合引文段明示錢謙益、顧苓等引文
  不因選段主要責任而改歸陳氏。
- 人物顯影只收已核且實際出現的稱謂，新增／延續陳寅恪、蔣天樞、
  錢謙益、柳如是、顧苓、陳子龍、程嘉燧、謝三賓、宋徵輿、
  李待問、俞明震等 literal-name index。
- 全書進度改為三態：卷前與第一章「完整」，第三章「部分」，
  第二、四、五章「未開始」，避免有選段即被誤認為全章完成。

## 2026-07-29｜從全書第一個實質單元重建順序細讀

- 將 `text00143` 的二〇二〇年《出版説明》完整 7 區塊列為第一個自然單元；止於出版社署名與日期，不截斷出版沿革、校改原則或底本說明。
- 分離著作責任與選段文字責任：全書作者為陳寅恪，本篇文字責任為上海古籍出版社；公開編者說明明示「不是陳寅恪正文」。
- 新增 `reading-views.json` 與聚合 `reading-view.json`，同一資料契約依原書順序容納卷前與第三章；進度明列 250／5,676 區塊，第一、二章等缺口不隱藏。
- builder、validator、provenance tests 與 sync 均改為多選段、可變文字責任；Canvas 只同步聚合快照，選段切換後各自重建稱謂 hover 與顯影層。
- 訂立自然單元、逐字保真、文字責任、缺口揭露、前後端分工五項長期準則，寫入 `engineering/README.md`。

## 2026-07-29｜樣章擴至 b0244，完整呈現年代論證的自我修正

- 新增 `npm run expand:autumn-pond`，把第三章細讀由 16 單元、73 區塊
  擴為 32 單元、243 個連續區塊；`b0075–b0120` 完成〈秋塘曲〉逐句
  解釋，`b0121–b0244` 收入其後年代與陳柳關係旁證。
- 公開注釋增至 32 個編者分段、22 條編者說明、56 條編者解讀。
  機器預審帳同步增至 56 筆，其中 55 條為陳氏論旨候選、1 條保留
  編者解讀；全部仍維持 `draft-disclosed`。
- 修正年代模型：1631 只列最早可能、1632 列最可能且非精確定案；
  basis 同時保存 `b0069` 的前說與 `b0190`、`b0222`、`b0226`
  的後文限定。
- 新增徐佛、宋徵輿、李雯、陳繼儒、李待問、方岳貢、張昂之、
  施紹莘、蔡氏、盛澤鎮等稱謂索引；Canvas matcher 改為只使用
  `mentions[].matchedText`，不再拿未實見的 canonical label 匹配原文。
- `b0190` 的 U+FFFC 保留在 `sourceText` 與雜湊中，公開 segment 則
  投影為原 EPUB 的 `Image00114.gif`；sync 將圖像與 JSON 一併納入
  manifest，畫面不再用缺字方框代替行內罕字。
- 停在 `b0244`，因該段收束李雯書信、佘山環境及綺懷詩旁證；
  `b0245` 已另起〈秋潭曲〉「同心夜夜巢蓮子」的新典故考釋。

## 2026-07-29｜完成 29 條公開解讀的機器協助逐條預審

- 新增 `npm run audit:pilot`，逐條記錄審核者性質、結論、理由、
  `basisChecked` 與是否仍需非機器人工核准。
- 預審結果為 28 條 `author-paraphrase-candidate`、1 條
  `retain-editorial-inference`；候選仍保持公開的
  `editorial-inference + draft-disclosed`，不冒充已核准陳氏論旨。
- 修正 4 條容易過度概括或失真的措辭，並替 4 條補入真正承載判斷的
  原文區塊；審核理由與依據保存於材料的 `annotationAudits`，不投影
  到 Canvas。
- 驗證器要求每條公開解讀恰有一筆未過期審核帳；候選若未經人工核准
  卻升格，或 `basisChecked` 與當前 `basis` 不一致，立即失敗。

## 2026-07-29｜固化長期 provenance 維護與同步防手改

- 將材料物理分為三區：`readingUnits` 只留 ID／blocks，
  `editorialDrafts` 保存未公開研究工作，`publicAnnotations` 保存逐筆
  標明歸屬的公開解釋。
- 依使用者明確允許，恢復 16 個「編者分段」、6 條「編者說明」與
  29 條「編者解讀」；一律標 `assertionOwner = project-editor`、
  `review.status = draft-disclosed`，不冒充陳氏論旨。
- 恢復人物 Hover。公開 entity 只投影原文實際出現的表面形式與命中
  block，卡片明示「原文稱謂索引」；人物短傳仍須另走注釋契約。
- 新增 `engineering/lib/provenance-policy.mjs` 與正負向測試，驗證公開
  注釋類型、歸屬組合、人工審核／公開草稿狀態、外部 HTTPS 來源及
  原文逐字復原。
- sync 新增 `chenYinke.sync.json`，記錄整條同步線所有 JSON 的 SHA-256；
  Canvas `validate:synced` 新增陳寅恪線及 JSX 650 行上限。
- 長期規則集中於 `docs/editorial-provenance-policy.md`，並寫入
  `AGENTS.md` 成為後續工作的硬約束。

## 2026-07-29｜原文與編者內容改為強制分層

- 回應「哪些是原文、哪些是後來解釋」的問題，將 `pilot-view.json`
  升級為 provenance schema 2.0。公開區塊只從保真區塊樹取得
  `sourceText`，並保存 SHA-256。
- 分段函數不再移除「寅恪案」或逗號；`author-marker`、圓括號按語與
  方括號補字只加顯示角色，所有 segments 必須能逐字重組原文。
- 現有單元標題、29 條 claims、年代表、人物短注、書目歸組、來源橋接
  與跨章關係全部認定為尚未逐條審核的研究編者草稿，統一
  `machine-drafted + withhold`，不再進入 Canvas 快照。
- 新設空的 `publicAnnotations`。以後只有明確記錄 assertion owner、
  wording author、representation、basis 且經人工核准的注釋可以公開。
- 驗證器新增逐字復原、SHA-256、編者層洩漏及公開注釋 provenance
  四道閘門。

## 2026-07-29｜第三章樣章擴至「吳江故相」辨識結論

- 樣章由 `b0002–b0020` 擴至 `b0002–b0074`，共 73 個連續正文區塊、
  16 個閱讀單元；止於「吳江故相」辨為周道登的暫定結論，不在
  〈秋塘曲〉逐句解釋途中任意截斷。
- 補入王澐、張氏、錢肇鼇、宋徵璧、周道登等人物與白龍潭地點資料，
  並新增六筆結構化年代事件。外查修正宋徵璧字號／親屬關係、
  〈酬萬年少〉篇名、周道登卒年異文及多筆正題／版本題。
- 新增 `sourceBridges` 保存跨單元「介紹段→引文」關係；引文內全形
  括號與方括號補字分別投影為 `note`、`supplied-text`，並以
  `mixedOwnership` 防止陳氏校按冒充被引原文。
- 公開命題不再丟失 `basis`。驗證器新增樣章連續覆蓋、命題依據、
  source／cross-reference、bridge、chronology、material/view 一致性、
  entity gloss 與所有公開 edition JSON 私密路徑檢查。
- 新增 `npm run build:pilot`；標準更新順序為
  `npm run build:pilot && npm run validate && npm run sync`。
- Canvas 端只接收重建後 `pilot-view.json` 快照；本輪不修改 JSX。

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
