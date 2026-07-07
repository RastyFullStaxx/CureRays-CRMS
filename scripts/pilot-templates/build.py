#!/usr/bin/env python3
"""Build tagged pilot template copies from the pristine clinic templates.

Reads specs/*.json, applies each spec to its source DOCX under
docs/2026_TEMPLATES (which stays pristine), and writes the cleaned + tagged
copy to templates/pilot/<sourceId>.docx. Stdlib only (no pip).

Run from the repo root:  python scripts/pilot-templates/build.py [SRC-ID ...]

Spec format (specs/<sourceId>.json):
{
  "sourceId": "SRC-DUPUYTRENS-RX",
  "source": "docs/2026_TEMPLATES/.../07_Prescription....docx",
  "removeTitlePage": "FEB 2026 version",   // optional; body[0] text must equal this
  "ops": [
    // global substring replace across w:t nodes; count must equal n
    {"op": "sub", "find": "Feb 24, 2026", "to": "{generatedDate}", "n": 1},
    // set the text of the cell `offset` cells right of the anchor cell
    {"op": "cell", "table": 0, "anchor": "Laterality", "match": "equals",
     "occurrence": 1, "offset": 1, "text": "{laterality}", "collapse": true},
    // substring replaces scoped to that target cell
    {"op": "cellsub", "table": 0, "anchor": "A", "occurrence": 1, "offset": 3,
     "subs": [["MD Notes: _", "MD Notes: {zoneAssessments__A__mdNotes}"]]}
  ]
}

Ops may carry "part" (default "word/document.xml") to edit a header/footer.
Every op is count-asserted: a spec that no longer matches its source fails
loudly instead of silently producing a wrong template.
"""

import glob
import json
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
REPO = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
SPEC_DIR = os.path.join(os.path.dirname(__file__), "specs")
OUT_DIR = os.path.join(REPO, "templates", "pilot")
TAG_RE = re.compile(r"\{[A-Za-z][A-Za-z0-9_]*\}")


def para_text(p):
    return "".join(t.text or "" for t in p.iter(W + "t"))


def cell_text(tc):
    return "".join(t.text or "" for t in tc.iter(W + "t"))


def set_cell_text(tc, text, collapse=False):
    """First w:t gets `text`, every other w:t is emptied. With collapse, extra
    drawing-free paragraphs are removed so option-list cells become one line."""
    ts = list(tc.iter(W + "t"))
    if not ts:
        # cell has no text run; create one on the first paragraph
        p = tc.find(W + "p")
        if p is None:
            raise SpecError("target cell has no paragraph")
        r = ET.SubElement(p, W + "r")
        t = ET.SubElement(r, W + "t")
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        t.text = text
        return
    ts[0].text = text
    ts[0].set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    for t in ts[1:]:
        t.text = ""
    if collapse:
        keeper = next(p for p in tc.findall(W + "p") if any(t is ts[0] for t in p.iter(W + "t")))
        for p in tc.findall(W + "p"):
            if p is keeper:
                continue
            if any(True for _ in p.iter(W + "drawing")):
                continue  # never drop a paragraph holding an image
            tc.remove(p)


class SpecError(Exception):
    pass


def find_target_cell(root, op):
    tables = list(root.iter(W + "tbl"))
    ti = op.get("table", 0)
    if ti >= len(tables):
        raise SpecError(f"table index {ti} out of range ({len(tables)} tables)")
    anchor = op["anchor"]
    match = op.get("match", "equals")
    wanted = op.get("occurrence", 1)
    seen = 0
    for tr in tables[ti].findall(W + "tr"):
        cells = tr.findall(W + "tc")
        for ci, tc in enumerate(cells):
            text = cell_text(tc).strip()
            hit = text == anchor if match == "equals" else text.startswith(anchor)
            if hit:
                seen += 1
                if seen == wanted:
                    target = ci + op.get("offset", 0)
                    if target >= len(cells):
                        raise SpecError(
                            f"anchor {anchor!r}: offset {op.get('offset', 0)} exceeds row width {len(cells)}"
                        )
                    return cells[target]
    raise SpecError(f"anchor {anchor!r} (match={match}, occurrence={wanted}) not found in table {ti}")


def apply_sub(root, op):
    find, to = op["find"], op["to"]
    nth = op.get("nth")  # 1-based: replace only the nth occurrence in document order
    seen = 0
    replaced = 0
    for t in root.iter(W + "t"):
        if not (t.text and find in t.text):
            continue
        if nth is None:
            replaced += t.text.count(find)
            t.text = t.text.replace(find, to)
            t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        else:
            parts = t.text.split(find)
            rebuilt = parts[0]
            for piece in parts[1:]:
                seen += 1
                rebuilt += (to if seen == nth else find) + piece
                if seen == nth:
                    replaced += 1
            t.text = rebuilt
            t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    expected = 1 if nth is not None else op.get("n", 1)
    if replaced != expected:
        raise SpecError(f"sub {find!r} (nth={nth}): replaced {replaced}, expected {expected}")


def apply_ops(root, ops):
    for op in ops:
        kind = op["op"]
        if kind == "sub":
            apply_sub(root, op)
        elif kind == "cell":
            tc = find_target_cell(root, op)
            set_cell_text(tc, op["text"], collapse=op.get("collapse", False))
        elif kind == "cellsub":
            tc = find_target_cell(root, op)
            for find, to in op["subs"]:
                n = 0
                for t in tc.iter(W + "t"):
                    if t.text and find in t.text:
                        n += t.text.count(find)
                        t.text = t.text.replace(find, to)
                        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
                if n != 1:
                    raise SpecError(f"cellsub anchor={op['anchor']!r} {find!r}: replaced {n}, expected 1")
        else:
            raise SpecError(f"unknown op {kind!r}")


def check_delimiters(root, part):
    """docxtemplater treats every { } as a delimiter; anything that is not one
    of our {tag} placeholders must not survive into the pilot copy."""
    for t in root.iter(W + "t"):
        if not t.text:
            continue
        stripped = TAG_RE.sub("", t.text)
        if "{" in stripped or "}" in stripped:
            raise SpecError(f"stray brace in {part}: {t.text!r}")


def remove_titled_pages(root, labels):
    """Remove interior divider pages: body-level paragraphs whose entire text
    equals a label and which carry their own sectPr (one-paragraph section)."""
    body = root.find(W + "body")
    for label in labels:
        hits = []
        for child in list(body):
            if child.tag != W + "p":
                continue
            if para_text(child).strip() != label:
                continue
            ppr = child.find(W + "pPr")
            if ppr is None or ppr.find(W + "sectPr") is None:
                continue
            hits.append(child)
        if len(hits) != 1:
            raise SpecError(f"removeTitledPages {label!r}: found {len(hits)} matching paragraphs, expected 1")
        body.remove(hits[0])


def remove_title_page(root, expected_text):
    body = root.find(W + "body")
    first = list(body)[0]
    if first.tag != W + "p":
        raise SpecError("body[0] is not a paragraph")
    text = para_text(first).strip()
    if text != expected_text:
        raise SpecError(f"title page text {text!r} != expected {expected_text!r}")
    ppr = first.find(W + "pPr")
    if ppr is None or ppr.find(W + "sectPr") is None:
        raise SpecError("body[0] does not carry the title-page sectPr")
    if any(True for _ in first.iter(W + "tbl")):
        raise SpecError("title paragraph unexpectedly contains a table")
    body.remove(first)


def parse_part(zin, part):
    raw = zin.read(part).decode("utf-8")
    for prefix, uri in re.findall(r'xmlns:([\w-]+)="([^"]+)"', raw[:8000]):
        ET.register_namespace(prefix, uri)
    return ET.fromstring(raw), raw


def serialize_part(root, raw):
    decl = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    xml = decl + ET.tostring(root, encoding="unicode")
    # ET drops xmlns declarations it considers unused, but mc:Ignorable on the
    # root still names those prefixes and Word then reports the file corrupt.
    # Splice the original root start-tag (full namespace set) back in.
    orig_start = raw.index("<", raw.index("?>") + 2 if raw.startswith("<?") else 0)
    orig_tag = raw[orig_start : raw.index(">", orig_start) + 1]
    new_start = xml.index("<", len(decl))
    new_end = xml.index(">", new_start) + 1
    return (xml[:new_start] + orig_tag + xml[new_end:]).encode("utf-8")


def build(spec_path):
    with open(spec_path, encoding="utf-8") as fh:
        spec = json.load(fh)
    source = os.path.join(REPO, spec["source"])
    out = os.path.join(OUT_DIR, spec["sourceId"] + ".docx")

    zin = zipfile.ZipFile(source)
    parts = {}  # part name -> (mutated root, original raw xml)

    doc_root, doc_raw = parse_part(zin, "word/document.xml")
    if spec.get("removeTitlePage"):
        remove_title_page(doc_root, spec["removeTitlePage"])
    if spec.get("removeTitledPages"):
        remove_titled_pages(doc_root, spec["removeTitledPages"])

    by_part = {}
    for op in spec.get("ops", []):
        by_part.setdefault(op.get("part", "word/document.xml"), []).append(op)
    for part, ops in by_part.items():
        if part == "word/document.xml":
            root, raw = doc_root, doc_raw
        else:
            root, raw = parse_part(zin, part)
        apply_ops(root, ops)
        parts[part] = (root, raw)
    parts["word/document.xml"] = (doc_root, doc_raw)

    for part, (root, _raw) in parts.items():
        check_delimiters(root, part)

    os.makedirs(OUT_DIR, exist_ok=True)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename in parts:
                root, raw = parts[item.filename]
                data = serialize_part(root, raw)
            zout.writestr(item, data)
    zin.close()
    return out


def main():
    only = set(sys.argv[1:])
    specs = sorted(glob.glob(os.path.join(SPEC_DIR, "*.json")))
    if only:
        specs = [s for s in specs if os.path.splitext(os.path.basename(s))[0] in only]
    if not specs:
        print("no specs found", file=sys.stderr)
        sys.exit(1)
    failures = 0
    for spec_path in specs:
        name = os.path.splitext(os.path.basename(spec_path))[0]
        try:
            out = build(spec_path)
            size = os.path.getsize(out)
            print(f"OK   {name} -> {os.path.relpath(out, REPO)} ({size} bytes)")
        except (SpecError, KeyError, OSError) as exc:
            failures += 1
            print(f"FAIL {name}: {exc}", file=sys.stderr)
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
