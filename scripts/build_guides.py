#!/usr/bin/env python3
"""Assemble guide articles from HTML fragments into full pages.

Usage: python3 scripts/build_guides.py <fragments_dir>

Each fragment in <fragments_dir>/*.html becomes public/guides/<name>.html,
wrapped in the site chrome (nav, article styling, footer, schema.org
Article JSON-LD). The guides index and sitemap are regenerated from the
GUIDES manifest below, which is the single source of truth for titles
and descriptions.
"""
import html
import json
import pathlib
import re
import sys
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "guides"
BASE = "https://oscar-leung.github.io/restroom-finder"

GUIDES = {
    "restroom-access-laws": {
        "title": "Restroom Access Laws in the US: Ally's Law, State by State",
        "desc": "What the Restroom Access Act (Ally's Law) actually requires, which states have it, who qualifies, and what to do if you're refused.",
    },
    "public-restrooms-san-francisco": {
        "title": "Where to Find Public Restrooms in San Francisco",
        "desc": "Pit Stop locations, library and park restrooms, neighborhood-by-neighborhood tips, and what to do late at night in SF.",
    },
    "public-restrooms-new-york": {
        "title": "Where to Find Public Restrooms in New York City",
        "desc": "The reliable spots: libraries, Bryant Park, transit hubs, department stores — plus borough tips and late-night reality.",
    },
    "traveling-with-ibd": {
        "title": "Traveling with IBD, IBS, or an Overactive Bladder",
        "desc": "A practical bathroom strategy guide: route planning, the I Can't Wait card, Ally's Law, flying, road trips, and easing bathroom anxiety.",
    },
    "road-trip-bathroom-guide": {
        "title": "The Road Trip Bathroom Guide: Rest Stops & Reliable Chains",
        "desc": "How rest areas work, the chains with famously clean restrooms, planning stops with kids, and what to keep in the car.",
    },
    "bathrooms-with-kids": {
        "title": "Finding Bathrooms When You're Out with Kids: A Parent's Guide",
        "desc": "Potty-training reality, where changing tables actually are, family restrooms, the parent kit, and zero-judgment survival tips.",
    },
    "public-restrooms-los-angeles": {
        "title": "Where to Find Public Restrooms in Los Angeles",
        "desc": "Beach restrooms, parks, libraries, malls, and Union Station — plus honest tips for Hollywood Blvd, DTLA, and late nights.",
    },
    "public-restrooms-chicago": {
        "title": "Where to Find Public Restrooms in Chicago",
        "desc": "The Loop, Mag Mile, Harold Washington Library, the Cultural Center, lakefront facilities — and the winter reality check.",
    },
    "public-restrooms-las-vegas": {
        "title": "Finding Restrooms in Las Vegas: The Strip and Beyond",
        "desc": "Casino restrooms are free and everywhere — the real problem is the walk. Strategy for the Strip, Fremont, and off-Strip.",
    },
    "hiking-outdoors-bathroom-guide": {
        "title": "The Outdoor Bathroom Guide: Trailheads, Vault Toilets & Leave No Trace",
        "desc": "What to expect at trailheads, vault toilet survival, the cathole method done right, wag bags, and a gear checklist.",
    },
    "theme-park-bathroom-guide": {
        "title": "The Theme Park Bathroom Strategy Guide",
        "desc": "Disney, Universal, and beyond: when restrooms are empty, baby care centers, the ride-line problem, and summer hydration.",
    },
    "cleanest-public-restrooms": {
        "title": "Which Places Have the Cleanest Public Restrooms? A Field Ranking",
        "desc": "A tier ranking of hotel lobbies, Buc-ee's, libraries, groceries, fast food, and gas stations — and why staffing decides everything.",
    },
    "public-restrooms-seattle": {
        "title": "Where to Find Public Restrooms in Seattle",
        "desc": "Pike Place, the Central Library, Seattle Center, beaches and parks — plus the rainy-day indoor strategy and light-rail reality.",
    },
    "public-restrooms-boston": {
        "title": "Where to Find Public Restrooms in Boston",
        "desc": "Surviving the Freedom Trail, the BPL, Quincy Market, food halls, and the winter shutdown of outdoor facilities.",
    },
    "public-restrooms-washington-dc": {
        "title": "Where to Find Public Restrooms in Washington, DC",
        "desc": "The Smithsonian trick that solves the National Mall, Union Station, Metro reality, and summer survival.",
    },
    "public-restrooms-san-diego": {
        "title": "Where to Find Public Restrooms in San Diego",
        "desc": "Beach facilities from Coronado to La Jolla, Balboa Park, the Gaslamp at night, and year-round outdoor options.",
    },
    "airport-bathroom-guide": {
        "title": "The Airport Bathroom Guide: Layovers, Red-Eyes & Family Restrooms",
        "desc": "Walk two gates further, find the family restrooms, freshen up on a layover, and win the pre-boarding bathroom math.",
    },
    "festival-event-bathroom-guide": {
        "title": "Surviving Festival and Stadium Bathrooms",
        "desc": "The porta-potty timing curve, where the empty banks are, mid-inning stadium strategy, and the essentials kit.",
    },
    "best-restroom-finder-apps": {
        "title": "The Best Restroom Finder Apps and Maps, Compared",
        "desc": "Flush, Refuge Restrooms, Google Maps, city programs, and Gotta Go — an honest comparison of what each does best (yes, we made one of them).",
    },
}

# Related-guides links rendered on each article. Grouped by audience so the
# links are genuinely relevant, not a random blogroll.
CLUSTERS = [
    ["public-restrooms-san-francisco", "public-restrooms-new-york", "public-restrooms-los-angeles",
     "public-restrooms-chicago", "public-restrooms-las-vegas", "public-restrooms-seattle",
     "public-restrooms-boston", "public-restrooms-washington-dc", "public-restrooms-san-diego"],
    ["restroom-access-laws", "traveling-with-ibd", "cleanest-public-restrooms", "best-restroom-finder-apps"],
    ["road-trip-bathroom-guide", "hiking-outdoors-bathroom-guide", "airport-bathroom-guide",
     "festival-event-bathroom-guide", "bathrooms-with-kids", "theme-park-bathroom-guide"],
]


def related(slug):
    """Up to 3 same-cluster slugs, wrapping around the cluster order."""
    for cluster in CLUSTERS:
        if slug in cluster:
            i = cluster.index(slug)
            rest = cluster[i + 1:] + cluster[:i]
            return [r for r in rest if r in GUIDES][:3]
    return []

CHROME_CSS = """
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #8b5cf6; --primary-dark: #7c3aed; --accent: #ec4899;
      --text: #0f172a; --text-muted: #64748b; --bg-soft: #fafaff;
      --border: #e2e8f0; --radius: 16px;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, system-ui, sans-serif;
      color: var(--text); line-height: 1.65;
      background:
        radial-gradient(1100px 700px at 90% -10%, rgba(236,72,153,.08), transparent 55%),
        radial-gradient(900px 600px at -10% 20%, rgba(139,92,246,.08), transparent 55%),
        var(--bg-soft);
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--primary-dark); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .wrap { max-width: 760px; margin: 0 auto; padding: 0 24px; }
    nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 0; }
    .logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; letter-spacing: -.4px; color: var(--text); }
    .logo img { width: 32px; height: 32px; border-radius: 8px; }
    .nav-links { display: flex; gap: 20px; align-items: center; font-size: 14px; }
    .nav-links a { color: var(--text-muted); }
    .nav-cta {
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff !important; padding: 9px 18px; border-radius: 999px;
      font-weight: 600; box-shadow: 0 6px 20px rgba(139,92,246,.25);
    }
    .nav-cta:hover { text-decoration: none; }
    article { background: #fff; border: 1px solid var(--border); border-radius: var(--radius);
      padding: clamp(24px, 5vw, 56px); margin: 16px 0 40px; box-shadow: 0 1px 3px rgba(15,23,42,.05); }
    article h1 { font-size: clamp(28px, 4.5vw, 40px); letter-spacing: -1px; line-height: 1.15; margin-bottom: 14px; }
    article h2 { font-size: clamp(21px, 3vw, 26px); letter-spacing: -.5px; margin: 36px 0 12px; }
    article h3 { font-size: 17px; margin: 22px 0 8px; }
    article p { margin: 0 0 16px; color: #1e293b; }
    article ul, article ol { margin: 0 0 16px 22px; }
    article li { margin-bottom: 6px; }
    article em { color: var(--text-muted); }
    article table { width: 100%; border-collapse: collapse; margin: 0 0 20px; font-size: 15px; }
    article th, article td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); }
    article th { color: var(--text-muted); font-size: 13px; text-transform: uppercase; letter-spacing: .4px; }
    .crumbs { font-size: 13px; color: var(--text-muted); margin: 8px 0 0; }
    .related { margin: 40px 0 0; padding-top: 8px; border-top: 1px solid var(--border); }
    .related h2 { font-size: 16px !important; text-transform: uppercase; letter-spacing: .6px; color: var(--text-muted); margin: 16px 0 10px !important; }
    .related ul { list-style: none; margin: 0 !important; }
    .related li { margin-bottom: 8px; }
    .cta-box { margin: 36px 0 8px; padding: 22px; border-radius: 12px; text-align: center;
      background: linear-gradient(135deg, rgba(139,92,246,.08), rgba(236,72,153,.08));
      border: 1px solid var(--border); }
    .cta-box a.btn { display: inline-block; margin-top: 10px; background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff; padding: 12px 26px; border-radius: 999px; font-weight: 700; }
    footer { padding: 26px 0 44px; font-size: 13px; color: var(--text-muted); text-align: center; }
    footer a { color: var(--text-muted); margin: 0 8px; }
"""

NAV = """<nav class="wrap">
  <a class="logo" href="../about.html"><img src="../icon-192.svg" alt="" /> Gotta Go</a>
  <div class="nav-links">
    <a href="./index.html">Guides</a>
    <a href="../about.html">About</a>
    <a class="nav-cta" href="../index.html">Open the app</a>
  </div>
</nav>"""

CTA = """<div class="cta-box">
  <strong>Need a restroom right now?</strong><br />
  <span style="color:var(--text-muted)">Gotta Go shows the closest open public restroom and gets you directions in one tap. Free, no signup.</span><br />
  <a class="btn" href="../index.html">Find the nearest restroom &rarr;</a>
</div>"""

FOOTER = """<footer class="wrap">
  <a href="./index.html">All guides</a> &middot;
  <a href="../about.html">About Gotta Go</a> &middot;
  <a href="../index.html">Open the app</a> &middot;
  <a href="https://buymeacoffee.com/holymushy" rel="noopener">Tip the dev</a>
  <div style="margin-top:8px">&copy; Gotta Go. Data from OpenStreetMap &amp; Refuge Restrooms.</div>
</footer>"""


def _strip_tags(x: str) -> str:
    return re.sub(r"<[^>]+>", "", x).strip()


def extract_faq(fragment: str):
    """(question, answer-text) pairs from the trailing FAQ section, if any."""
    m = re.search(r"<h2[^>]*>\s*FAQ[^<]*</h2>(.*)$", fragment, re.I | re.S)
    if not m:
        return []
    return [(_strip_tags(q), _strip_tags(a))
            for q, a in re.findall(r"<h3[^>]*>(.*?)</h3>\s*<p[^>]*>(.*?)</p>",
                                   m.group(1), re.S)]


def related_block(slug: str) -> str:
    links = related(slug)
    if not links:
        return ""
    items = "\n".join(
        f'    <li><a href="./{r}.html">{html.escape(GUIDES[r]["title"])}</a></li>'
        for r in links)
    return f"""<div class="related">
  <h2>Keep reading</h2>
  <ul>
{items}
  </ul>
</div>"""


def page(slug: str, meta: dict, fragment: str, today: str) -> str:
    title = html.escape(meta["title"])
    desc = html.escape(meta["desc"])
    url = f"{BASE}/guides/{slug}.html"
    faq = extract_faq(fragment)
    faq_ld = ""
    if faq:
        faq_ld = "\n  <script type=\"application/ld+json\">" + json.dumps({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": q,
                 "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in faq],
        }) + "</script>"
    related_html = related_block(slug)
    ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": meta["title"],
        "description": meta["desc"],
        "datePublished": today,
        "dateModified": today,
        "mainEntityOfPage": url,
        "author": {"@type": "Organization", "name": "Gotta Go"},
        "publisher": {"@type": "Organization", "name": "Gotta Go",
                      "logo": {"@type": "ImageObject", "url": f"{BASE}/icon-512.svg"}},
    }, indent=2)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} &mdash; Gotta Go</title>
  <meta name="description" content="{desc}" />
  <meta name="theme-color" content="#8b5cf6" />
  <link rel="canonical" href="{url}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:image" content="{BASE}/icon-512.svg" />
  <meta property="og:url" content="{url}" />
  <meta name="twitter:card" content="summary" />
  <link rel="icon" href="../icon-192.svg" type="image/svg+xml" />
  <script type="application/ld+json">{ld}</script>{faq_ld}
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2007583955528498" crossorigin="anonymous"></script>
  <style>{CHROME_CSS}</style>
</head>
<body>
{NAV}
<main class="wrap">
  <p class="crumbs"><a href="./index.html">Guides</a> / {title}</p>
  <article>
{fragment}
{related_html}
{CTA}
  </article>
</main>
{FOOTER}
</body>
</html>
"""


def index_page(today: str) -> str:
    cards = "\n".join(
        f'''  <a class="card" href="./{slug}.html">
    <h2>{html.escape(m["title"])}</h2>
    <p>{html.escape(m["desc"])}</p>
    <span class="more">Read the guide &rarr;</span>
  </a>''' for slug, m in GUIDES.items())
    ld = json.dumps({
        "@context": "https://schema.org", "@type": "CollectionPage",
        "name": "Gotta Go Guides",
        "description": "Practical guides to finding and using public restrooms in the US.",
        "url": f"{BASE}/guides/index.html",
    })
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Guides &mdash; Gotta Go</title>
  <meta name="description" content="Practical guides to finding public restrooms: city guides, restroom access laws, road trips, traveling with IBD, and parenting survival tips." />
  <meta name="theme-color" content="#8b5cf6" />
  <link rel="canonical" href="{BASE}/guides/index.html" />
  <meta property="og:title" content="Gotta Go Guides" />
  <meta property="og:description" content="Practical guides to finding and using public restrooms in the US." />
  <meta property="og:url" content="{BASE}/guides/index.html" />
  <link rel="icon" href="../icon-192.svg" type="image/svg+xml" />
  <script type="application/ld+json">{ld}</script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2007583955528498" crossorigin="anonymous"></script>
  <style>{CHROME_CSS}
    .grid {{ display: grid; gap: 16px; margin: 24px 0 40px; }}
    .card {{ display: block; background: #fff; border: 1px solid var(--border); border-radius: var(--radius);
      padding: 24px; color: var(--text); box-shadow: 0 1px 3px rgba(15,23,42,.05); }}
    .card:hover {{ text-decoration: none; border-color: var(--primary); }}
    .card h2 {{ font-size: 19px; letter-spacing: -.4px; margin-bottom: 6px; }}
    .card p {{ color: var(--text-muted); font-size: 14.5px; margin-bottom: 10px; }}
    .card .more {{ color: var(--primary-dark); font-weight: 600; font-size: 14px; }}
    .pagehead {{ padding: 28px 0 4px; }}
    .pagehead h1 {{ font-size: clamp(30px, 5vw, 44px); letter-spacing: -1px; }}
    .pagehead p {{ color: var(--text-muted); margin-top: 8px; max-width: 560px; }}
  </style>
</head>
<body>
{NAV}
<main class="wrap">
  <div class="pagehead">
    <h1>Guides</h1>
    <p>Everything we know about finding (and gracefully using) public restrooms in the US &mdash; from the people who built an app about it.</p>
  </div>
  <div class="grid">
{cards}
  </div>
</main>
{FOOTER}
</body>
</html>
"""


def sitemap(today: str) -> str:
    urls = [f"{BASE}/", f"{BASE}/about.html", f"{BASE}/guides/index.html"] + [
        f"{BASE}/guides/{slug}.html" for slug in GUIDES]
    entries = "\n".join(
        f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>" for u in urls)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            f"{entries}\n</urlset>\n")


def main():
    frag_dir = pathlib.Path(sys.argv[1])
    today = date.today().isoformat()
    OUT.mkdir(parents=True, exist_ok=True)
    built = []
    for slug, meta in GUIDES.items():
        src = frag_dir / f"{slug}.html"
        if not src.exists():
            print(f"MISSING fragment: {src}")
            continue
        fragment = src.read_text().strip()
        # strip any accidental full-document wrapping from a fragment
        fragment = re.sub(r"<!doctype[^>]*>|</?(html|head|body)[^>]*>", "",
                          fragment, flags=re.I).strip()
        (OUT / f"{slug}.html").write_text(page(slug, meta, fragment, today))
        built.append(slug)
    (OUT / "index.html").write_text(index_page(today))
    (ROOT / "public" / "sitemap.xml").write_text(sitemap(today))
    print(f"built: {len(built)} articles + index + sitemap")
    for s in built:
        print("  ", s)


if __name__ == "__main__":
    main()
