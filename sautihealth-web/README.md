# sautihealth-web

Website and investor memo for [Sauti Health](https://sautihealth.com) (Sauti Dispatch Limited).

> Source for the Sauti Health website and investor memo. The model, data and copy belong to Sauti Dispatch Limited; see LICENSE.

## Contents

| Path | What it is |
| --- | --- |
| `site/index.html` | Current homepage (static, self-contained). |
| `site/investors/` | Investor memo with the interactive ten-year model. Served at `sautihealth.com/investors`, which the QR code on our business cards opens. |
| `site/investors/assets/core.js` | Calculation core: contracts, revenue, unit economics, impact, return, Monte Carlo, country ranking. No DOM, so it runs in Node and is unit-tested. |
| `site/investors/assets/params.js` | Every model input with its default, range and type (data, market price or assumption). |
| `site/investors/assets/app.js` | Page behaviour: controls, charts and tables. |
| `site/investors/assets/countries.js` | Country data used by the model. |
| `site/investors/assets/styles.css` | Memo styles (light and dark themes). |
| `tests/` | Unit tests for the calculation core. |
| `data/countries.csv` | The same country data as a table, with indicator names and years. |
| `scripts/fetch_country_data.py` | Rebuilds `data/countries.csv` from the World Bank API. |
| `design/homepage-demo.html` | Reference design for the next homepage, for the web developer. |
| `docs/model.md` | How the model works, every input, and where each number comes from. |

## Run locally

Static files only, no build step.

```bash
cd sautihealth-web
npm run serve
# open http://localhost:8000 and http://localhost:8000/investors/
```

## Tests and linting

Requires Node 20 or later.

```bash
npm ci          # install ESLint
npm test        # unit tests for the calculation core
npm run lint    # ESLint
npm run check   # both
```

GitHub Actions runs lint and tests on every push and pull request that touches this folder.

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
