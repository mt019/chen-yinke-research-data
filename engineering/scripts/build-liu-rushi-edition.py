#!/usr/bin/env python3
"""Build a lossless intermediate model for the interactive 柳如是別傳 edition.

Unlike the plain-text research extract, this keeps XHTML block classes, inline
line breaks, emphasis spans, and image positions. It does not guess that a
styled paragraph is a poem or quotation; editorial interpretation belongs in a
separate annotation layer.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import zipfile
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = REPO_ROOT / "data" / "processed" / "liu-rushi-edition"
FILES_DIR = OUTPUT_DIR / "files"
ASSETS_DIR = OUTPUT_DIR / "assets"
FIRST_FILE = 143
LAST_FILE = 169


BLOCK_TYPES = {
    ("h1", "text-title-1-c"): "chapter-title",
    ("h3", "text-title-3"): "section-title",
    ("h4", "text-title-4"): "subsection-title",
    ("p", "bodytext"): "author-prose",
    ("p", "bodytext-margin"): "author-prose",
    ("p", "bodytext1"): "indented-prose",
    ("p", "preface-text"): "preface",
    ("p", "inscribed-right"): "signature",
    ("p", "bodytext-fs-np"): "styled-source",
    ("p", "bodytext-fs-first-np"): "styled-source-first",
    ("p", "bodytext-fs-last-np"): "styled-source-last",
    ("p", "bodytext-fs-only-np"): "styled-source-only",
    ("p", "bodytext-kt-np"): "styled-literary",
    ("p", "bodytext-kt-first-np"): "styled-literary-first",
    ("p", "bodytext-kt-last-np"): "styled-literary-last",
}

BLOCK_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6", "p", "div"}


def normalize_text(value: str) -> str:
    value = value.replace("\xa0", " ")
    return re.sub(r"\s+", " ", value)


@dataclass
class Block:
    tag: str
    css_class: str | None
    nodes: list[dict] = field(default_factory=list)

    def plain_text(self) -> str:
        parts = []
        for node in self.nodes:
            if node["type"] == "text":
                parts.append(node["text"])
            elif node["type"] == "line-break":
                parts.append("\n")
            elif node["type"] == "image":
                parts.append("\uFFFC")
        return normalize_text("".join(parts)).strip()


class EditionParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[Block] = []
        self.current: Block | None = None
        self.span_stack: list[dict] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        attrs_dict = dict(attrs)
        if tag in BLOCK_TAGS:
            if self.current is not None:
                self.finish_block()
            self.current = Block(tag=tag, css_class=attrs_dict.get("class"))
            if tag == "div":
                self.current.nodes.append({
                    "type": "container-start",
                    "class": attrs_dict.get("class"),
                })
            return

        if self.current is None:
            return
        if tag == "br":
            self.current.nodes.append({"type": "line-break"})
        elif tag == "img":
            css_class = attrs_dict.get("class")
            self.current.nodes.append({
                "type": "image",
                "role": "inline-glyph" if css_class == "zhangyue-img-h1" else "figure",
                "src": attrs_dict.get("src"),
                "alt": attrs_dict.get("alt") or None,
                "class": css_class,
            })
        elif tag == "span":
            span = {"type": "span-start", "class": attrs_dict.get("class")}
            self.current.nodes.append(span)
            self.span_stack.append(span)

    def handle_endtag(self, tag: str) -> None:
        if tag in BLOCK_TAGS and self.current is not None:
            self.finish_block()
        elif tag == "span" and self.current is not None:
            self.current.nodes.append({"type": "span-end"})
            if self.span_stack:
                self.span_stack.pop()

    def handle_data(self, data: str) -> None:
        if self.current is None:
            return
        text = normalize_text(data)
        if not text:
            return
        if self.current.nodes and self.current.nodes[-1]["type"] == "text":
            self.current.nodes[-1]["text"] += text
        else:
            self.current.nodes.append({"type": "text", "text": text})

    def finish_block(self) -> None:
        if self.current is None:
            return
        if self.current.plain_text() or any(n["type"] == "image" for n in self.current.nodes):
            self.blocks.append(self.current)
        self.current = None
        self.span_stack.clear()

    def close(self) -> None:
        if self.current is not None:
            self.finish_block()
        super().close()


def block_type(block: Block) -> str:
    known = BLOCK_TYPES.get((block.tag, block.css_class))
    if known:
        return known
    if block.tag == "div" and any(node["type"] == "image" for node in block.nodes):
        return "figure"
    return "unclassified"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: build-liu-rushi-edition.py path/to/chen-yinke.epub")
    epub_path = Path(sys.argv[1]).expanduser().resolve()
    if not epub_path.is_file():
        raise SystemExit(f"EPUB not found: {epub_path}")

    FILES_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    edition_index = {
        "schemaVersion": "1.0.0",
        "work": "柳如是別傳",
        "author": "陳寅恪",
        "model": "lossless-xhtml-block-tree",
        "files": [],
    }
    asset_occurrences: dict[str, list[dict]] = defaultdict(list)
    asset_roles: dict[str, Counter] = defaultdict(Counter)
    class_counts = Counter()
    type_counts = Counter()

    with zipfile.ZipFile(epub_path) as archive:
        for file_number in range(FIRST_FILE, LAST_FILE + 1):
            member = f"OEBPS/text{file_number:05d}.html"
            parser = EditionParser()
            parser.feed(archive.read(member).decode("utf-8", errors="replace"))
            parser.close()

            blocks = []
            for block_number, block in enumerate(parser.blocks, start=1):
                kind = block_type(block)
                block_id = f"lrs-f{file_number:03d}-b{block_number:04d}"
                row = {
                    "id": block_id,
                    "sequence": block_number,
                    "type": kind,
                    "source": {
                        "file": member,
                        "tag": block.tag,
                        "class": block.css_class,
                    },
                    "text": block.plain_text(),
                    "nodes": block.nodes,
                }
                blocks.append(row)
                class_counts[f"{block.tag}.{block.css_class or '-'}"] += 1
                type_counts[kind] += 1
                for node_number, node in enumerate(block.nodes):
                    if node["type"] != "image" or not node.get("src"):
                        continue
                    asset_occurrences[node["src"]].append({
                        "file": member,
                        "blockId": block_id,
                        "nodeIndex": node_number,
                        "context": block.plain_text()[:160],
                    })
                    asset_roles[node["src"]][node["role"]] += 1

            payload = {
                "schemaVersion": "1.0.0",
                "work": "柳如是別傳",
                "sourceFile": member,
                "fileNumber": file_number,
                "blocks": blocks,
            }
            filename = f"text{file_number:05d}.json"
            (FILES_DIR / filename).write_text(
                json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            edition_index["files"].append({
                "sourceFile": member,
                "file": f"files/{filename}",
                "blockCount": len(blocks),
                "characterCount": sum(len(row["text"]) for row in blocks),
            })

        glyph_inventory = []
        for src in sorted(asset_occurrences):
            member = f"OEBPS/{src}"
            content = archive.read(member)
            (ASSETS_DIR / src).write_bytes(content)
            glyph_inventory.append({
                "id": f"asset-{Path(src).stem.lower()}",
                "file": f"assets/{src}",
                "sourceFile": member,
                "sha256": hashlib.sha256(content).hexdigest(),
                "byteLength": len(content),
                "roles": dict(asset_roles[src]),
                "occurrenceCount": len(asset_occurrences[src]),
                "occurrences": asset_occurrences[src],
                "unicode": None,
                "reading": None,
                "status": "unidentified",
            })

    edition_index["totals"] = {
        "fileCount": len(edition_index["files"]),
        "blockCount": sum(row["blockCount"] for row in edition_index["files"]),
        "characterCount": sum(row["characterCount"] for row in edition_index["files"]),
        "imageOccurrenceCount": sum(row["occurrenceCount"] for row in glyph_inventory),
        "uniqueImageCount": len(glyph_inventory),
    }
    edition_index["blockTypes"] = dict(type_counts)
    edition_index["sourceClasses"] = dict(class_counts)

    (OUTPUT_DIR / "index.json").write_text(
        json.dumps(edition_index, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (OUTPUT_DIR / "glyph-inventory.json").write_text(
        json.dumps({
            "schemaVersion": "1.0.0",
            "work": "柳如是別傳",
            "assets": glyph_inventory,
        }, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(json.dumps(edition_index["totals"], ensure_ascii=False))
    print(f"Wrote edition model to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()

