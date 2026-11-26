"""Download every image still hotlinked from bren.xmu.edu.cn into assets/img/
and rewrite the references in the HTML pages and assets/data/*.js.

Usage:  python tools/localize_images.py
Safe to re-run: already-downloaded files are skipped, already-local refs are untouched.
Run it again after tools/build_data.py, which regenerates data files with remote URLs.

Oversized images are scaled down (see MAX_WIDTH) and re-encoded to keep the site light.
"""
import hashlib
import html
import io
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

try:
    from PIL import Image
except ImportError:  # downloading still works without Pillow, only no resizing
    Image = None

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
MAP_FILE = ROOT / "tools" / "image_map.json"

URL_RE = re.compile(
    r"https?://bren\.xmu\.edu\.cn/"
    r"(?:system/resource/virtual_resource_file\.jsp|virtual_attach_file\.vsb|images/)"
    r"[^\"'\s<>)]*"
)

# Largest useful width per folder (≈2× the largest on-screen size).
MAX_WIDTH = {
    "slides": 2400,
    "pages": 1800,
    "lab": 1600,
    "gallery": 1600,
    "members": 640,
    "publications": 900,
}
JPEG_QUALITY = 84


def ext_of(url):
    m = re.search(r"[?&]e=(\.[a-zA-Z0-9]+)", url)
    if m:
        return m.group(1).lower()
    m = re.search(r"(\.[a-zA-Z0-9]{3,4})$", url.split("?")[0])
    return m.group(1).lower() if m else ".jpg"


def local_name(url, folder):
    ext = ext_of(url).replace(".jpeg", ".jpg")
    stem = Path(url.split("?")[0]).stem if "/images/" in url else ""
    stem = re.sub(r"[^A-Za-z0-9_-]+", "-", stem)[:40]
    h = hashlib.sha1(url.encode()).hexdigest()[:10]
    return f"{folder}/{stem + '-' if stem else ''}{h}{ext}"


def fetch(url, tries=3):
    last = None
    for _ in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (site migration)"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            last = e
    raise last


def optimize(data, rel, folder):
    """Downscale/re-encode when it saves space; returns bytes to write."""
    if Image is None or rel.endswith(".gif"):
        return data
    try:
        im = Image.open(io.BytesIO(data))
        im.load()
    except Exception:  # noqa: BLE001
        return data
    max_w = MAX_WIDTH.get(folder, 1600)
    changed = False
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
        changed = True
    buf = io.BytesIO()
    if rel.endswith(".png"):
        if im.mode not in ("RGB", "RGBA", "L", "LA", "P"):
            im = im.convert("RGBA")
        im.save(buf, "PNG", optimize=True)
    elif rel.endswith((".jpg", ".jpeg")):
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        im.save(buf, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
    else:
        return data
    out = buf.getvalue()
    return out if changed or len(out) < len(data) else data


PNG_TO_JPG_BYTES = 500_000   # opaque PNGs (photos/figures) above this become JPG
GIF_TO_WEBP_BYTES = 5_000_000  # huge animated GIFs become animated WebP


def shrink_heavy(url_map):
    """Convert very heavy files to lighter formats. Returns {old_path: new_path}."""
    renames = {}
    if Image is None:
        return renames
    for url, path in list(url_map.items()):
        src = ROOT / path
        if not src.exists():
            continue
        size = src.stat().st_size
        try:
            if path.endswith(".gif") and size > GIF_TO_WEBP_BYTES:
                dst = src.with_suffix(".webp")
                with Image.open(src) as im:
                    frames, durations = [], []
                    for i in range(im.n_frames):
                        im.seek(i)
                        frames.append(im.convert("RGB"))
                        durations.append(im.info.get("duration", 40))
                frames[0].save(dst, "WEBP", save_all=True, append_images=frames[1:],
                               duration=durations, loop=0, quality=70, method=4)
            elif path.endswith(".png") and size > PNG_TO_JPG_BYTES:
                with Image.open(src) as im:
                    if im.mode in ("RGBA", "LA") or "transparency" in im.info:
                        alpha = im.convert("RGBA").getchannel("A")
                        if alpha.getextrema()[0] < 250:
                            continue  # real transparency: keep PNG
                    dst = src.with_suffix(".jpg")
                    im.convert("RGB").save(dst, "JPEG", quality=88, optimize=True, progressive=True)
            else:
                continue
        except Exception as e:  # noqa: BLE001
            print("skip convert", path, e)
            continue
        if dst.stat().st_size < size:
            src.unlink()
            new = dst.relative_to(ROOT).as_posix()
            renames[path] = new
            url_map[url] = new
        else:
            dst.unlink()
    return renames


def write_placeholder(rel, url):
    """Gray placeholder saved at the intended path, so it can simply be overwritten later."""
    dest = IMG / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if Image is None:
        return False
    from PIL import ImageDraw
    im = Image.new("RGB", (800, 600), (233, 238, 246))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 799, 599], outline=(201, 211, 226), width=4)
    d.text((400, 290), "Image missing", fill=(100, 116, 139), anchor="mm")
    d.text((400, 320), rel, fill=(148, 163, 184), anchor="mm")
    fmt = {".png": "PNG", ".gif": "GIF", ".webp": "WEBP"}.get(dest.suffix, "JPEG")
    im.save(dest, fmt)
    return True


def main():
    url_map = json.loads(MAP_FILE.read_text(encoding="utf-8")) if MAP_FILE.exists() else {}
    files = sorted(ROOT.glob("*.html")) + sorted((ROOT / "assets" / "data").glob("*.js"))

    todo = {}
    for f in files:
        folder = "pages" if f.suffix == ".html" else f.stem
        for raw in set(URL_RE.findall(f.read_text(encoding="utf-8"))):
            url = html.unescape(raw)
            if url not in url_map and url not in todo:
                todo[url] = local_name(url, folder)

    def job(item):
        url, rel = item
        dest = IMG / rel
        if dest.exists():
            return url, rel, 0, None
        try:
            data = fetch(url)
            data = optimize(data, rel, rel.split("/")[0])
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            return url, rel, len(data), None
        except Exception as e:  # noqa: BLE001
            return url, rel, 0, e

    failed = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        for i, (url, rel, size, err) in enumerate(pool.map(job, todo.items()), 1):
            if err:
                failed.append((url, err))
            else:
                url_map[url] = "assets/img/" + rel
            if i % 50 == 0:
                print(f"  {i}/{len(todo)}", flush=True)

    # Failed downloads: keep a placeholder at the intended path so the page layout stays
    # intact; replace the file later with the real image (same name).
    missing = []
    for url, err in failed:
        rel = todo[url]
        write_placeholder(rel, url)
        url_map[url] = "assets/img/" + rel
        missing.append(f"assets/img/{rel}\t{url}\t{err}")
    if missing:
        (ROOT / "tools" / "missing_images.txt").write_text(
            "# placeholder file\toriginal URL\terror\n" + "\n".join(missing) + "\n", encoding="utf-8")

    renames = shrink_heavy(url_map)
    MAP_FILE.write_text(json.dumps(url_map, ensure_ascii=False, indent=1), encoding="utf-8")

    for f in files:
        text = f.read_text(encoding="utf-8")
        new = URL_RE.sub(lambda m: url_map.get(html.unescape(m.group(0)), m.group(0)), text)
        for old, nw in renames.items():
            new = new.replace(old, nw)
        if new != text:
            f.write_text(new, encoding="utf-8")

    total = sum(p.stat().st_size for p in IMG.rglob("*") if p.is_file())
    print(f"downloaded {len(todo) - len(failed)} new, {len(failed)} failed (placeholders); "
          f"{len(renames)} converted; {len(url_map)} mapped; assets/img = {total / 1e6:.1f} MB")
    for line in missing:
        print("PLACEHOLDER", line)
    return 0


if __name__ == "__main__":
    sys.exit(main())
