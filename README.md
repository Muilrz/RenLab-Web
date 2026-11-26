# 任斌课题组官网（新版）

A redesign of https://bren.xmu.edu.cn/ built with plain HTML/CSS/JS: no build step, no external CDNs or fonts (so it loads reliably on networks inside mainland China).

## Local preview

```powershell
python -m http.server 8765
```

Then open http://localhost:8765/. Opening the HTML file directly also works, but some browsers block local scripts, so the server is recommended.

## Pages

| File | Content |
| --- | --- |
| `index.html` | Home: hero, stats, highlights carousel, about and hiring, research directions, latest news and papers |
| `research.html` | The four research directions, with a sticky table of contents |
| `members.html` | Members: filter by group, search, alumni |
| `pi.html` | Prof. Ren's profile |
| `publications.html` | All papers: filter by year, full-text search |
| `news.html` | News timeline, filterable by type |
| `lab.html` | Lab photos, instruments, group-life albums by year |
| `join.html` | Recruitment, contacts, useful links |

## Directory layout

```
assets/
  css/style.css        Global styles (color and spacing tokens are in :root)
  js/layout.js         Shared header/footer, lightbox, scroll animations
  js/home.js …         Page scripts
  data/*.js            Content data: members, publications, news, slides, lab, gallery
tools/
  build_data.py        Regenerates assets/data/*.js from the crawl JSON
  crawl*.json          Raw content crawled from the old site
```

## Updating content

Lists like members, publications and news live in `assets/data/*.js`. **Edit those files directly** to update them; no HTML changes needed. For example, to add a paper, put a new entry at the top of the array in `publications.js`:

```js
{ "n": 297, "year": 2026, "title": "…", "authors": "…, Bin Ren*", "source": "J. Am. Chem. Soc. 2026", "doi": "10.1021/…", "link": "https://doi.org/10.1021/…", "img": "…" }
```

Member `group` values: `leader` / `faculty` / `postdoc` / `phd` / `master` / `visiting` / `collaborator` / `alumni`.

## Before going live

- **Images are local**: all 651 images were downloaded into `assets/img/` (organized by page: `slides` / `members` / `publications` / `gallery` / `lab` / `pages`), and references now use relative paths. The site no longer depends on the old site.
  - To add a new image: put the file under `assets/img/` and point the corresponding entry in `assets/data/*.js` at it.
  - After re-running `tools/build_data.py` (which regenerates data with old-site URLs), also run `python tools/localize_images.py`. Already-downloaded files are skipped, and the script swaps the references back to local paths.
  - If a download fails, the script writes a gray "Image missing" placeholder at the intended path and lists it in `tools/missing_images.txt`. Overwrite the placeholder with a real image of the same name; no code changes are needed.
  - To keep the site light, the script scales down oversized images, turns large opaque PNGs into JPGs, and converted the 73 MB GIF (Gallery 2022, "The party in May 2022") to an 11.7 MB animated WebP. The originals are still on the old site.
- The old site runs on the university's VSB (博达) CMS. To keep publishing through the CMS, this static version can serve as the design reference for templating; if you can host static files directly, upload the whole directory as-is.
- Alumni personal email addresses (mostly QQ / 163 mailboxes) are no longer shown on the new site. Current members' email addresses are kept.
