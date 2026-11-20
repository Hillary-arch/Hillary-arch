# sautihealth-web

Website and investor memo for [Sauti Health](https://sautihealth.com) (Sauti Dispatch Limited).

> Source for the Sauti Health website and investor memo. The model, data and copy belong to Sauti Dispatch Limited; see LICENSE.

## Contents

| Path | What it is |
| --- | --- |
| `site/index.html` | Current homepage (static, self-contained). |
| `site/investors/` | Investor memo with the interactive ten-year model. Served at `sautihealth.com/investors`, which the QR code on our business cards opens. |
| `site/investors/assets/model.js` | Model logic: contracts, revenue, unit economics, impact, return, Monte Carlo, country ranking. |
| `site/investors/assets/countries.js` | Country data used by the model. |
| `site/investors/assets/styles.css` | Memo styles (light and dark themes). |
| `data/countries.csv` | The same country data as a table, with indicator names and years. |
| `scripts/fetch_country_data.py` | Rebuilds `data/countries.csv` from the World Bank API. |
| `design/homepage-demo.html` | Reference design for the next homepage, for the web developer. |
| `docs/model.md` | How the model works, every input, and where each number comes from. |

## Run locally

Static files only, no build step.

```bash
cd sautihealth-web/site
python3 -m http.server 8000
# open http://localhost:8000 and http://localhost:8000/investors/
```

## Deploy

Upload the contents of `site/` to the web root of sautihealth.com. Keep the path `investors/index.html`, because printed QR codes point to `/investors`.

The investor page carries `noindex, nofollow` so it stays out of search results.

## Update the country data

```bash
python3 scripts/fetch_country_data.py
```

Then copy any changed values into `site/investors/assets/countries.js`.

## Conventions

- No em dashes or charity language in copy. Plain, specific English.
- Every figure on the investor page cites a source; inputs are labelled data, market or assumption.
- No round size, valuation or government partner names on public pages.
