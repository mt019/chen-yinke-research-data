#!/usr/bin/env python3
"""Extract the 柳如是別傳 portion of the seven-volume EPUB.

Full text is written under data/raw/books/liu-rushi/ and is ignored by Git.
The structural index is written under data/materials/liu-rushi/.
"""

from __future__ import annotations

import html
import json
import re
import sys
import zipfile
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = REPO_ROOT / "data" / "raw" / "books" / "liu-rushi"
MATERIALS_DIR = REPO_ROOT / "data" / "materials" / "liu-rushi"
PROCESSED_DIR = REPO_ROOT / "data" / "processed" / "liu-rushi"


@dataclass(frozen=True)
class Section:
    id: str
    title: str
    files: tuple[int, ...]


SECTIONS = (
    Section("front-matter", "卷前說明與附記", tuple(range(143, 146))),
    Section("chapter-1", "第一章　緣起", tuple(range(146, 155))),
    Section("chapter-2", "第二章　河東君最初姓氏名字之推測及其附帶問題", (155,)),
    Section(
        "chapter-3",
        "第三章　河東君與「吳江故相」及「雲間孝廉」之關係　附河東君嘉定之游",
        tuple(range(156, 162)),
    ),
    Section(
        "chapter-4",
        "第四章　河東君過訪半野堂及其前後之關係",
        tuple(range(162, 167)),
    ),
    Section("chapter-5", "第五章　復明運動　附錢氏家難", tuple(range(167, 170))),
)


class TextExtractor(HTMLParser):
    BLOCKS = {
        "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
        "li", "blockquote", "br", "hr", "section",
    }

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        if tag.lower() in self.BLOCKS:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in self.BLOCKS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        self.parts.append(data)

    def text(self) -> str:
        value = html.unescape("".join(self.parts))
        value = value.replace("\u3000", " ").replace("\xa0", " ")
        lines = []
        for raw in value.splitlines():
            line = re.sub(r"[ \t]+", " ", raw).strip()
            if line:
                lines.append(line)
        return "\n\n".join(lines).strip() + "\n"


def extract_html(raw: bytes) -> str:
    parser = TextExtractor()
    parser.feed(raw.decode("utf-8", errors="replace"))
    return parser.text()


def paragraph_count(text: str) -> int:
    return len([part for part in re.split(r"\n\s*\n", text) if part.strip()])


def paragraphs(text: str) -> list[str]:
    return [part.strip() for part in re.split(r"\n\s*\n", text) if part.strip()]


def subheadings(text: str) -> list[str]:
    candidates = []
    patterns = (
        r"^第[壹貳叁肆伍陸柒捌玖拾一二三四五六七八九十]+期.*$",
        r"^河東君嘉定之游$",
        r"^錢氏家難$",
        r"^附記$",
    )
    for paragraph in re.split(r"\n\s*\n", text):
        first = paragraph.strip().splitlines()[0] if paragraph.strip() else ""
        for pattern in patterns:
            match = re.match(pattern, first)
            if match:
                heading = match.group(0).strip()
                if heading not in candidates:
                    candidates.append(heading)
                break
    return candidates


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: extract-liu-rushi.py path/to/chen-yinke.epub")

    epub = Path(sys.argv[1]).expanduser().resolve()
    if not epub.is_file():
        raise SystemExit(f"EPUB not found: {epub}")

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    MATERIALS_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {
        "schemaVersion": "1.0.0",
        "work": "柳如是別傳",
        "author": "陳寅恪",
        "sourceFormat": "EPUB",
        "scope": {
            "firstHtml": "OEBPS/text00143.html",
            "lastHtml": "OEBPS/text00169.html",
            "htmlFileCount": 27,
        },
        "sections": [],
    }
    corpus_index = {
        "schemaVersion": "1.0.0",
        "work": "柳如是別傳",
        "author": "陳寅恪",
        "sections": [],
    }

    with zipfile.ZipFile(epub) as archive:
        for order, section in enumerate(SECTIONS):
            chunks = []
            source_files = []
            paragraph_rows = []
            sequence = 0
            active_subheading = None
            for number in section.files:
                member = f"OEBPS/text{number:05d}.html"
                file_text = extract_html(archive.read(member))
                chunks.append(file_text)
                source_files.append(member)
                for source_order, paragraph in enumerate(paragraphs(file_text), start=1):
                    if paragraph in subheadings(paragraph):
                        active_subheading = paragraph
                    sequence += 1
                    paragraph_rows.append({
                        "id": f"lrs-{order:02d}-{sequence:04d}",
                        "sequence": sequence,
                        "sectionId": section.id,
                        "sectionTitle": section.title,
                        "subheading": active_subheading,
                        "sourceFile": member,
                        "sourceOrder": source_order,
                        "text": paragraph,
                    })

            text = "\n\n".join(chunk.strip() for chunk in chunks if chunk.strip()) + "\n"
            filename = f"{order:02d}_{section.id}.txt"
            (RAW_DIR / filename).write_text(text, encoding="utf-8")
            processed_filename = f"{order:02d}_{section.id}.json"
            processed_payload = {
                "schemaVersion": "1.0.0",
                "work": "柳如是別傳",
                "author": "陳寅恪",
                "section": {
                    "id": section.id,
                    "order": order,
                    "title": section.title,
                },
                "paragraphs": paragraph_rows,
            }
            (PROCESSED_DIR / processed_filename).write_text(
                json.dumps(processed_payload, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )

            manifest["sections"].append({
                "id": section.id,
                "order": order,
                "title": section.title,
                "sourceFiles": source_files,
                "textFile": filename,
                "characterCount": len(text),
                "paragraphCount": paragraph_count(text),
                "subheadings": subheadings(text),
            })
            corpus_index["sections"].append({
                "id": section.id,
                "order": order,
                "title": section.title,
                "file": processed_filename,
                "paragraphCount": len(paragraph_rows),
                "characterCount": sum(len(row["text"]) for row in paragraph_rows),
                "subheadings": subheadings(text),
            })

    manifest["totals"] = {
        "characterCount": sum(row["characterCount"] for row in manifest["sections"]),
        "paragraphCount": sum(row["paragraphCount"] for row in manifest["sections"]),
    }

    target = MATERIALS_DIR / "chapter-index.json"
    target.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    corpus_index["totals"] = {
        "sectionCount": len(corpus_index["sections"]),
        "paragraphCount": sum(row["paragraphCount"] for row in corpus_index["sections"]),
        "characterCount": sum(row["characterCount"] for row in corpus_index["sections"]),
    }
    corpus_target = PROCESSED_DIR / "index.json"
    corpus_target.write_text(
        json.dumps(corpus_index, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {target}")
    print(f"Wrote {len(SECTIONS)} text files under {RAW_DIR}")
    print(f"Wrote {len(SECTIONS)} paragraph JSON files and {corpus_target}")
    print(json.dumps(manifest["totals"], ensure_ascii=False))


if __name__ == "__main__":
    main()
