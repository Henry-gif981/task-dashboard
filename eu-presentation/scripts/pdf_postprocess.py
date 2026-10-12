"""Finish an exported PDF (called by scripts/export_pdf.mjs).

Usage: python3 scripts/pdf_postprocess.py <full.pdf> <cover-only.pdf> <headings.json>
1. Page 1 (cover) is replaced by the same page exported without a page number. Both files
   come from the same page and print settings; only the footer differs.
2. Bookmark titles: Chromium builds them from the headings but drops the spaces at line
   wraps ("understandingof"). Each title is replaced by the heading text it was made from
   (matched with spaces removed); titles that do not match are left as they are.
Links, bookmarks and the rest of the document are kept.
"""
import json, re, sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject

full, cover, headings = sys.argv[1], sys.argv[2], sys.argv[3]
writer = PdfWriter(clone_from=full)

src = PdfReader(cover).pages[0]
tmp = writer.add_page(src)                       # copies the cover page's objects into this file
first = writer.pages[0]
for key in ("/Contents", "/Resources"):
    first[NameObject(key)] = tmp.raw_get(key)    # keep the indirect references
writer.remove_page(len(writer.pages) - 1)

squash = lambda s: re.sub(r"\s+", "", s)
pool = {}
for h in json.load(open(headings, encoding="utf-8")):
    pool.setdefault(squash(h), re.sub(r"\s+", " ", h).strip())
fixed = 0
item = writer._root_object["/Outlines"].get_object().get("/First") if "/Outlines" in writer._root_object else None
stack = [item] if item is not None else []
while stack:
    node = stack.pop().get_object()
    title = str(node.get("/Title", ""))
    if squash(title) in pool and pool[squash(title)] != title:
        node[NameObject("/Title")] = TextStringObject(pool[squash(title)]); fixed += 1
    for k in ("/Next", "/First"):
        if k in node:
            stack.append(node[k])
with open(full, "wb") as fh:
    writer.write(fh)
print(f"cover page without number; {fixed} bookmark titles respaced")
