#!/usr/bin/env python3
"""Project reviewed reading selections in whole-book order.

The lossless edition block tree is the only source of public reading text.
Machine-drafted headings, claims, chronology, entity glosses, source labels,
and cross-references stay in the material file until each item is reviewed and
copied into ``publicAnnotations`` with explicit provenance.  Canvas receives
no withheld editorial prose.

Output: data/processed/liu-rushi-edition/reading-view.json
"""

from __future__ import annotations

import json
import hashlib
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
MATERIALS = REPO / "data" / "materials" / "liu-rushi-edition"
PROCESSED = REPO / "data" / "processed" / "liu-rushi-edition"
MANIFEST = MATERIALS / "reading-views.json"
EDITION_INDEX = PROCESSED / "index.json"
CORPUS_INDEX = REPO / "data" / "processed" / "liu-rushi" / "index.json"
OUT = PROCESSED / "reading-view.json"

def segment(row: dict) -> list[dict]:
    """Add display roles without changing, normalising, or dropping a character."""
    text = row["text"]
    parts: list[dict] = []
    marker = re.match(r"^(寅恪案[，、]?)", text)
    cursor = 0
    if marker:
        parts.append({"kind": "author-marker", "text": marker.group(1)})
        cursor = marker.end()

    for piece in re.split(r"(（[^（）]*）|［[^［］]*］)", text[cursor:]):
        if not piece:
            continue
        if piece.startswith("（") and piece.endswith("）"):
            parts.append({"kind": "note", "text": piece})
        elif piece.startswith("［") and piece.endswith("］"):
            parts.append({"kind": "supplied-text", "text": piece})
        else:
            parts.append({"kind": "text", "text": piece})
    glyphs = [
        node for node in row.get("nodes", [])
        if node.get("type") == "image" and node.get("role") == "inline-glyph"
    ]
    if not glyphs:
        return parts

    rendered: list[dict] = []
    glyph_index = 0
    for part in parts:
        pieces = part["text"].split("\uFFFC")
        for index, piece in enumerate(pieces):
            if piece:
                rendered.append({**part, "text": piece})
            if index < len(pieces) - 1:
                if glyph_index >= len(glyphs):
                    raise ValueError(f"Missing inline glyph node for {row['id']}")
                glyph = glyphs[glyph_index]
                rendered.append({
                    "kind": "inline-glyph",
                    "text": "\uFFFC",
                    "asset": f"/chen-yinke/glyphs/{glyph['src']}",
                    "alt": "未辨識行內字形",
                })
                glyph_index += 1
    if glyph_index != len(glyphs):
        raise ValueError(f"Unused inline glyph node for {row['id']}")
    return rendered


def build_selection(spec: dict, material: dict, edition_index: dict) -> dict:
    source_entry = next(
        row for row in edition_index["files"]
        if row["sourceFile"] == material["scope"]["sourceFile"]
    )
    block_rows = json.loads((PROCESSED / source_entry["file"]).read_text(encoding="utf-8"))["blocks"]
    by_id = {row["id"]: row for row in block_rows}
    attribution = material["textAttribution"]
    quote_attributions = material.get("publicQuoteAttributions", {})

    units = []
    for unit in material["readingUnits"]:
        blocks = []
        for bid in unit["blocks"]:
            row = by_id[bid]
            text = row["text"]
            btype = row["type"]

            if btype == "chapter-title":
                role = "chapter-title"
            elif btype.startswith("styled-source"):
                role = "source"
            elif text.startswith("寅恪案"):
                role = "yinke-case"
            else:
                role = "prose"

            segments = segment(row)
            block = {
                "id": bid,
                "recordType": "source-transcription",
                "author": attribution["displayLabel"],
                "textAttribution": attribution,
                "role": role,
                "sourceText": text,
                "sourceTextSha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "openQuestion": "俟考" in text,
                "mixedOwnership": role == "source" and any(
                    part["kind"] != "text" for part in segments
                ),
                "segments": segments,
            }
            if bid in quote_attributions:
                block["sourceRef"] = quote_attributions[bid]
            blocks.append(block)

        units.append({
            "id": unit["id"],
            "blocks": blocks,
        })

    public_blocks = [block for unit in units for block in unit["blocks"]]
    public_annotations = material.get("publicAnnotations", [])
    for unit in units:
        unit["annotationIds"] = [
            annotation["id"]
            for annotation in public_annotations
            if annotation.get("target", {}).get("unitId") == unit["id"]
        ]

    public_entities = []
    draft_entities = material.get("editorialDrafts", {}).get(
        "entities", material.get("entities", [])
    )
    for entity in draft_entities:
        observed_names = []
        mentions = []
        for name in [entity.get("label"), *entity.get("aliases", [])]:
            if not name:
                continue
            matched_blocks = [
                block["id"] for block in public_blocks if name in block["sourceText"]
            ]
            if matched_blocks:
                observed_names.append(name)
                mentions.extend(
                    {"blockId": block_id, "matchedText": name}
                    for block_id in matched_blocks
                )
        if not observed_names:
            continue
        public_entities.append({
            "id": entity["id"],
            "recordType": "literal-name-index",
            "label": entity["label"],
            "type": entity["type"],
            "aliases": [name for name in observed_names if name != entity["label"]],
            "mentions": mentions,
            "provenance": {
                "representation": "editorial-name-resolution",
                "surfaceForms": "source-text-only",
                "biographicalAnnotation": "withheld",
            },
        })

    return {
        "id": spec["id"],
        "label": spec["label"],
        "sectionId": spec["sectionId"],
        "completesSection": spec.get("completesSection", False),
        "section": material.get("section", material.get("chapter")),
        "workOrder": {
            "sectionOrder": spec["sectionOrder"],
            "sourceFileOrder": spec["sourceFileOrder"],
            "fromSequence": by_id[material["scope"]["contentFromBlock"]]["sequence"],
            "toSequence": by_id[material["scope"]["toBlock"]]["sequence"],
        },
        "textAttribution": attribution,
        "provenancePolicy": {
            "sourceText": "verbatim-lossless-block",
            "publicAnnotations": "reviewed-explicit-provenance-only",
            "withheldEditorialDrafts": True,
        },
        "scope": {
            "sourceFile": material["scope"]["sourceFile"],
            "fromBlock": material["scope"]["fromBlock"],
            "contentFromBlock": material["scope"]["contentFromBlock"],
            "toBlock": material["scope"]["toBlock"],
            "blockCount": sum(len(u["blocks"]) for u in units),
        },
        "units": units,
        "entities": public_entities,
        "publicAnnotations": public_annotations,
    }


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    edition_index = json.loads(EDITION_INDEX.read_text(encoding="utf-8"))
    corpus_index = json.loads(CORPUS_INDEX.read_text(encoding="utf-8"))
    selections = [
        build_selection(
            spec,
            json.loads((MATERIALS / spec["material"]).read_text(encoding="utf-8")),
            edition_index,
        )
        for spec in manifest["selections"]
    ]
    selection_ids_by_section: dict[str, list[str]] = {}
    selected_counts: dict[str, int] = {}
    for selection in selections:
        section_id = selection["sectionId"]
        selection_ids_by_section.setdefault(section_id, []).append(selection["id"])
        selected_counts[section_id] = selected_counts.get(section_id, 0) + selection["scope"]["blockCount"]
    sections = []
    for order, section in enumerate(corpus_index["sections"]):
        selected = selected_counts.get(section["id"], 0)
        sections.append({
            "id": section["id"],
            "order": order,
            "title": section["title"],
            "totalParagraphs": section["paragraphCount"],
            "selectionIds": selection_ids_by_section.get(section["id"], []),
            "selectedBlockCount": selected,
            "status": (
                "complete"
                if any(
                    selection["sectionId"] == section["id"]
                    and selection.get("completesSection")
                    for selection in selections
                )
                else "partial" if selected else "not-yet-selected"
            ),
        })
    labels = {
        "complete": "完整",
        "partial": "部分",
        "not-yet-selected": "未開始",
    }
    summary = [
        {
            "status": status,
            "label": labels[status],
            "sections": [
                row["title"].split("　")[0]
                for row in sections if row["status"] == status
            ],
        }
        for status in ("complete", "partial", "not-yet-selected")
    ]
    view = {
        "schemaVersion": "3.0.0",
        "work": manifest["work"],
        "workAuthor": manifest["workAuthor"],
        "workProgress": {
            "sectionCount": len(sections),
            "totalBlocks": edition_index["totals"]["blockCount"],
            "selectedBlocks": sum(row["scope"]["blockCount"] for row in selections),
            "sections": sections,
            "summary": summary,
        },
        "selections": selections,
    }
    OUT.write_text(json.dumps(view, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for selection in selections:
        for u in selection["units"]:
            for b in u["blocks"]:
                counts[b["role"]] = counts.get(b["role"], 0) + 1
    print(json.dumps({
        "selections": len(selections),
        "blocks": view["workProgress"]["selectedBlocks"],
        "roles": counts,
    }, ensure_ascii=False))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
