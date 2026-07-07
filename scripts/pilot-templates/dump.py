#!/usr/bin/env python3
"""Inspection helper for authoring specs: dumps a DOCX's tables (row/cell
text) and loose paragraphs, using the same enumeration order as build.py.

Usage: python scripts/pilot-templates/dump.py <path.docx> [--cells N] [--part word/header1.xml]
"""

import sys
import zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def main():
    path = sys.argv[1]
    part = "word/document.xml"
    width = 60
    args = sys.argv[2:]
    if "--part" in args:
        part = args[args.index("--part") + 1]
    if "--cells" in args:
        width = int(args[args.index("--cells") + 1])

    z = zipfile.ZipFile(path)
    root = ET.fromstring(z.read(part))

    tables = list(root.iter(W + "tbl"))
    print(f"{path} [{part}]: {len(tables)} tables")
    for ti, tbl in enumerate(tables):
        rows = tbl.findall(W + "tr")
        print(f"--- table {ti}: {len(rows)} rows ---")
        for ri, tr in enumerate(rows):
            cells = []
            for tc in tr.findall(W + "tc"):
                cells.append("".join(t.text or "" for t in tc.iter(W + "t")).strip()[:width])
            print(f"  r{ri}: {cells}")

    in_table_paras = set()
    for tbl in tables:
        for p in tbl.iter(W + "p"):
            in_table_paras.add(id(p))
    print("--- loose paragraphs ---")
    for pi, p in enumerate(root.iter(W + "p")):
        if id(p) in in_table_paras:
            continue
        text = "".join(t.text or "" for t in p.iter(W + "t")).strip()
        if text:
            print(f"  p{pi}: {text[:170]!r}")


if __name__ == "__main__":
    main()
