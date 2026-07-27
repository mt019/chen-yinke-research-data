#!/usr/bin/env python3
"""Project the third-chapter pilot into a single self-contained frontend view.

Merges the editorial annotation layer
(`data/materials/liu-rushi-edition/pilot-third-chapter-opening.json`) with the
lossless block text (`data/processed/liu-rushi-edition/files/text00156.json`),
so Canvas Lab renders one quiet reading surface with on-demand apparatus and
never has to resolve block IDs or touch the EPUB itself.

Output: data/processed/liu-rushi-edition/pilot-view.json
"""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PILOT = REPO / "data" / "materials" / "liu-rushi-edition" / "pilot-third-chapter-opening.json"
BLOCKS = REPO / "data" / "processed" / "liu-rushi-edition" / "files" / "text00156.json"
OUT = REPO / "data" / "processed" / "liu-rushi-edition" / "pilot-view.json"

# The pilot's editor left a few notes in simplified glyphs (digitisation
# artefact). This site is Traditional throughout; normalise the display-facing
# strings only. Not a general converter — just the characters that appear.
S2T = dict(zip(
    "为侧字库应开归当打据数显标栏检段目确类组视览认让读跳转问阅预题",
    "為側字庫應開歸當打據數顯標欄檢段目確類組視覽認讓讀跳轉問閱預題",
))


def zh(value: str) -> str:
    return "".join(S2T.get(ch, ch) for ch in value or "")


# One-line identifications for the reading surface's on-demand person cards.
# Standard, uncontested biography only; the contested points (e.g. 河東君 early
# name) are left to the text itself, which is precisely what the chapter argues.
GLOSS = {
    "person-liu-rushi": "全書中心。明末名妓，字如是，號河東君；崇禎末年歸錢謙益為繼室。早年姓氏，顧傳諱而不書，正是本章所要推究。",
    "person-gu-ling": "字云美，明末清初蘇州遺民，工篆刻書畫。所撰〈河東君傳〉為陳寅恪據以立論的最佳傳記。",
    "person-qian-qianyi": "字受之，號牧齋，常熟人。明末文壇領袖、東林黨魁；仕明又降清，柳如是之夫。",
    "person-qu-shisi": "字起田，號稼軒，錢謙益門生。南明桂林留守，城破殉國。",
    "person-chen-zilong": "字臥子，雲間（松江）人。明末詩人、抗清志士；傳中「雲間孝廉」即指其人。",
}


def segment(text: str) -> list[dict]:
    """Split a block into reading text and Chen Yinke's parenthetical notes.

    In this material every full-width （…） is an editorial interpolation or a
    bibliographic citation inside a quotation, not part of the base source. The
    reading surface dims them; they never masquerade as the quoted original.
    """
    parts: list[dict] = []
    for piece in re.split(r"(（[^（）]*）)", text):
        if not piece:
            continue
        if piece.startswith("（") and piece.endswith("）"):
            parts.append({"kind": "note", "text": piece})
        else:
            parts.append({"kind": "text", "text": piece})
    return parts


def main() -> None:
    pilot = json.loads(PILOT.read_text(encoding="utf-8"))
    block_rows = json.loads(BLOCKS.read_text(encoding="utf-8"))["blocks"]
    by_id = {row["id"]: row for row in block_rows}

    units = []
    for unit in pilot["readingUnits"]:
        # which source each quotation block belongs to
        quote_owner: dict[str, dict] = {}
        for src in unit.get("sources", []):
            label = " ".join(x for x in [src.get("work"), src.get("locator")] if x)
            ref = {
                "work": src.get("work"),
                "locator": src.get("locator"),
                "item": src.get("item"),
                "author": src.get("author"),
                "label": label,
            }
            for bid in src.get("quotationBlocks", []):
                quote_owner[bid] = ref

        xref_block: dict[str, dict] = {}
        for x in unit.get("crossReferences", []):
            xref_block[x["block"]] = {
                "label": zh(x["label"]),
                "target": x["target"],
                "sourceText": x["sourceText"],
            }

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

            marker = None
            if role == "yinke-case":
                m = re.match(r"^寅恪案[，、]?", text)
                if m:
                    marker = "寅恪案"
                    text = text[m.end():]

            blocks.append({
                "id": bid,
                "role": role,
                "marker": marker,
                "openQuestion": "俟考" in text,
                "sourceRef": quote_owner.get(bid),
                "crossReference": xref_block.get(bid),
                "segments": segment(text),
            })

        units.append({
            "id": unit["id"],
            "title": zh(unit.get("title", "")),
            "function": unit.get("function"),
            "note": zh(unit.get("note", "")) or None,
            "claims": [
                {"text": zh(c["text"]), "certainty": c["certainty"]}
                for c in unit.get("claims", [])
            ],
            "witnesses": unit.get("witnesses", []),
            "preferredWitness": unit.get("preferredWitness"),
            "blocks": blocks,
        })

    view = {
        "schemaVersion": "1.0.0",
        "work": pilot["work"],
        "author": pilot.get("author", "陳寅恪"),
        "chapter": pilot["chapter"],
        "scope": {
            "sourceFile": pilot["scope"]["sourceFile"],
            "fromBlock": pilot["scope"]["fromBlock"],
            "toBlock": pilot["scope"]["toBlock"],
            "blockCount": sum(len(u["blocks"]) for u in units),
        },
        "units": units,
        "entities": [
            {**ent, "gloss": GLOSS.get(ent["id"])}
            for ent in pilot["entities"]
        ],
    }

    OUT.write_text(json.dumps(view, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for u in units:
        for b in u["blocks"]:
            counts[b["role"]] = counts.get(b["role"], 0) + 1
    print(json.dumps({"units": len(units), "blocks": view["scope"]["blockCount"], "roles": counts}, ensure_ascii=False))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
