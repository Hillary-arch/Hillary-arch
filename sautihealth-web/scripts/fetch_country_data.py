#!/usr/bin/env python3
"""Rebuild data/countries.csv from the World Bank World Development Indicators API.

Covers every country the World Bank classifies as low income (LIC) or lower-middle
income (LMC). Uses the most recent non-empty value for each indicator.

Health insurance coverage is not in the WDI. It comes from Barasa et al. (2021),
BMJ Global Health 6:e004712, Table 2, and is kept in INSURANCE below.

Usage:
    python scripts/fetch_country_data.py            # writes data/countries.csv
    python scripts/fetch_country_data.py --stdout   # prints instead
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
import urllib.request
from pathlib import Path

API = "https://api.worldbank.org/v2"
INDICATORS = {
    "population_m_2025": "SP.POP.TOTL",
    "crude_birth_rate_2024": "SP.DYN.CBRT.IN",
    "life_expectancy_2024": "SP.DYN.LE00.IN",
    "gdp_per_capita_usd": "NY.GDP.PCAP.CD",
    "road_deaths_per_100k_2019": "SH.STA.TRAF.P5",
    "maternal_mortality_per_100k_2023": "SH.STA.MMRT",
    "mobile_subs_per_100": "IT.CEL.SETS.P2",
}
# Any health insurance, % of population, latest DHS (Barasa et al. 2021, Table 2).
INSURANCE = {
    "RWA": 78.7, "GHA": 58.2, "BDI": 22.0, "KEN": 19.9, "NAM": 18.8, "ZWE": 11.6,
    "TZA": 9.2, "SEN": 6.9, "SWZ": 6.2, "ETH": 5.9, "AGO": 5.8, "TGO": 5.8,
    "MLI": 5.6, "LBR": 5.3, "COM": 5.3, "COD": 5.0, "CIV": 4.6, "MDG": 3.8,
    "COG": 3.3, "CMR": 3.2, "MOZ": 2.7, "GMB": 2.6, "ZMB": 2.5, "NGA": 2.3,
    "STP": 2.2, "LSO": 2.1, "NER": 2.0, "MWI": 1.8, "GIN": 1.6, "UGA": 1.5,
    "SLE": 1.5, "TCD": 1.2, "BEN": 1.2, "BFA": 0.9,
}
OUT = Path(__file__).resolve().parent.parent / "data" / "countries.csv"


def get(url: str) -> list:
    with urllib.request.urlopen(url, timeout=60) as resp:
        payload = json.load(resp)
    return payload[1] or []


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--stdout", action="store_true", help="print CSV instead of writing the file")
    args = parser.parse_args()

    countries = [
        c for c in get(f"{API}/country?format=json&per_page=400")
        if c["incomeLevel"]["id"] in {"LIC", "LMC"}
    ]
    ids = ";".join(c["id"] for c in countries)
    values: dict[str, dict[str, float]] = {c["id"]: {} for c in countries}
    for column, code in INDICATORS.items():
        for obs in get(f"{API}/country/{ids}/indicator/{code}?format=json&mrnev=1&per_page=500"):
            iso, value = obs["countryiso3code"], obs["value"]
            if iso in values and value is not None:
                values[iso][column] = round(value / 1e6, 2) if code == "SP.POP.TOTL" else round(value, 1)

    out = sys.stdout if args.stdout else OUT.open("w", newline="")
    writer = csv.writer(out)
    writer.writerow(["iso3", "name", *INDICATORS, "health_insurance_coverage_pct"])
    for c in sorted(countries, key=lambda c: c["id"]):
        row = values[c["id"]]
        writer.writerow([c["id"], c["name"], *(row.get(k, "") for k in INDICATORS), INSURANCE.get(c["id"], "")])
    if not args.stdout:
        out.close()
        print(f"Wrote {len(countries)} countries to {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
