"""Convert the crawled JSON of the old site into assets/data/*.js files.

Usage:  python tools/build_data.py <crawl.json>
The generated JS files define window.SITE_DATA.<key> so pages work from file:// too.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "data"


def clean(s):
    s = (s or "").replace(" ", " ").replace("&amp;", "&")
    return re.sub(r"\s+", " ", s).strip()


def kv(line, *keys):
    for k in keys:
        m = re.match(rf"^{k}\s*[:：]\s*(.*)$", line, re.I)
        if m:
            return clean(m.group(1))
    return None


SECTION_KEY = {
    "Group Leader": "leader",
    "Faculty": "faculty",
    "Postdoctors": "postdoc",
    "Doctoral Students": "phd",
    "Master Students": "master",
    "Visiting Professor": "visiting",
    "Visiting Scholars": "visiting",
    "Collaborators": "collaborator",
    "Alumni": "alumni",
}


def parse_member(m):
    lines = [re.sub(r"(?<=\S)Email$", "", clean(l)).strip() for l in m["lines"] if clean(l)]
    lines = [l for l in lines if l]
    sec = SECTION_KEY.get(m["sec"], "other")
    out = {"group": sec, "photo": m["img"]}
    if not lines:
        return None
    name = lines[0]
    if sec == "alumni":
        mm = re.match(r"^(.*?)\s*\((.*)\)\s*$", name)
        if mm:
            name, meta = mm.group(1).strip(), mm.group(2)
            parts = [p.strip() for p in meta.split(",")]
            out["degree"] = parts[0]
            if len(parts) > 1:
                out["year"] = parts[1]
    out["name"] = name
    titles = []
    rest = lines[1:]
    i = 0
    while i < len(rest):
        l = rest[i]
        v = kv(l, "Research interests?")
        if v is not None:
            out["interests"] = v
        elif (v := kv(l, "Graduated From")) is not None:
            out["from"] = v
        elif (v := kv(l, "Current position")) is not None:
            if v:
                out["position"] = v
        elif (v := kv(l, "Current address")) is not None:
            out["address"] = v
        elif re.match(r"^Email\s*[:：]?\s*$", l, re.I):
            if i + 1 < len(rest) and "@" in rest[i + 1]:
                out.setdefault("email", rest[i + 1])
                i += 1
        elif (v := kv(l, "Email")) is not None:
            if "@" in v:
                out.setdefault("email", v)
        elif kv(l, "Phone") is not None:
            pass
        elif l.lower() == "welcome":
            pass
        else:
            titles.append(l)
        i += 1
    if name.lower() == "welcome":
        return None
    if titles:
        out["title"] = " · ".join(titles)
    # Alumni personal mailboxes are not republished on the new site.
    if m.get("mail") and sec != "alumni":
        out.setdefault("email", m["mail"])
    if m.get("more"):
        out["more"] = m["more"]
    return out


def split_cite(c):
    """Split 'A, B and C*, J. Am. Chem. Soc. 2026, 148, 1-2' into (authors, source)."""
    m = re.search(r"\b(19|20)\d{2}\b", c)
    if not m:
        return c, ""
    pre = c[: m.start()].rstrip(" ,")
    commas = list(re.finditer(r",\s*", pre))
    start = commas[-1].end() if commas else 0
    seg = pre[start:]
    if " and " in seg:
        k = seg.find(" and ")
        j = seg.find(". ", k)
        if j < 0:
            return c, ""
        start += j + 2
    return c[:start].strip(" ,."), c[start:].strip()


def parse_pub(p):
    title, cite = clean(p["title"]), clean(p["cite"])
    if not title:
        mm = re.match(r"^(.*?[.?!])\s+(.*)$", cite)
        if mm:
            title, cite = mm.group(1), mm.group(2)
    title = title.rstrip(". ")
    cite = re.sub(r"\[\s*PDF\s*\]", "", cite).strip().lstrip(".").strip()
    doi = clean(p["doi"]).rstrip(".")
    link = f"https://doi.org/{doi}" if doi else clean(p["link"])
    authors, source = split_cite(cite)
    return {
        "n": p["n"],
        "year": int(p["year"]),
        "title": title,
        "authors": authors,
        "source": source,
        "doi": doi,
        "link": link,
        "img": p["img"],
    }


def write(name, key, value):
    OUT.mkdir(parents=True, exist_ok=True)
    body = json.dumps(value, ensure_ascii=False, indent=1)
    (OUT / f"{name}.js").write_text(
        f"window.SITE_DATA = window.SITE_DATA || {{}};\nwindow.SITE_DATA.{key} = {body};\n",
        encoding="utf-8",
    )


def main(src):
    d = json.loads(Path(src).read_text(encoding="utf-8"))

    members = [x for x in (parse_member(m) for m in d["members"]) if x]
    write("members", "members", members)

    pubs = sorted((parse_pub(p) for p in d["pubs"]), key=lambda p: -p["n"])
    write("publications", "publications", pubs)

    news = [
        {"date": n["date"], "text": clean(n["text"]), "link": n["link"]}
        for n in d["news"]
    ]
    write("news", "news", news)

    seen, slides = set(), []
    for s in d["slides"]:
        if s["img"] in seen:
            continue
        seen.add(s["img"])
        slides.append(s)
    write("slides", "slides", slides)

    print(f"members={len(members)} pubs={len(pubs)} news={len(news)} slides={len(slides)}")


INSTRUMENTS = [
    ("Raman", "Renishaw inVia"),
    ("Raman", "WITec"),
    ("Raman", "Nanophoton Raman-11"),
    ("Raman", "Wide-field microscopy"),
    ("TERS", "Veeco"),
    ("TERS", "NT-MDT"),
    ("TERS", "HORIBA LabRAM HR Evo Nano"),
    ("TERS", "CASmF"),
    ("Others", "Transfer platform (Metatest)"),
    ("Others", "Electrochemical workstation"),
]

GALLERY_ORDER = ["a2026", "a2025", "a2024", "a2023", "a2022", "a2021", "TERS7",
                 "a2019", "a2018", "a2017", "a2016", "a2015", "a2014", "a2013",
                 "a2012", "a2011"]


def main_extra(src):
    d = json.loads(Path(src).read_text(encoding="utf-8"))
    tour = d["res"]["/Lab_tour.htm"]
    lab = {
        "photos": tour[:10],
        "instruments": [
            {"group": g, "name": n, "img": img}
            for (g, n), img in zip(INSTRUMENTS, tour[-len(INSTRUMENTS):])
        ],
    }
    write("lab", "lab", lab)

    albums = []
    for key in GALLERY_ORDER:
        items = d["gal"].get(key)
        if not isinstance(items, list) or not items:
            continue
        label = "TERS7 (2019)" if key == "TERS7" else key.lstrip("a")
        photos = []
        for it in items:
            cap = clean(it["cap"])
            if cap.lower() == "pictures":
                cap = ""
            m = re.match(r"^(\d{4})/(\d{2})/(\d{2})\s*(.*)$", cap)
            date = ""
            if m:
                date, cap = f"{m.group(1)}-{m.group(2)}-{m.group(3)}", m.group(4)
            photos.append({"img": it["img"], "caption": cap, "date": date})
        albums.append({"label": label, "photos": photos})
    write("gallery", "gallery", albums)
    print(f"lab photos={len(lab['photos'])} instruments={len(lab['instruments'])} albums={len(albums)}")


if __name__ == "__main__":
    main(sys.argv[1])
    if len(sys.argv) > 2:
        main_extra(sys.argv[2])
