import csv
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "data" / "raw"
PROCESSED_DIR = ROOT / "data" / "processed"


def normalize_name(value):
    value = value.strip().lower()
    value = value.replace("&", "and")
    value = value.replace("(", " ").replace(")", " ")
    value = value.replace("/", " ")
    value = value.replace("-", " ")
    value = re.sub(r"[^a-z0-9 ]+", "", value)
    value = re.sub(r"\s+", " ", value)

    aliases = {
        "bhubaneshwar": "bhubaneswar",
        "vishakapatnam": "visakhapatnam",
        "vishakhapatnam": "visakhapatnam",
        "tirupathy": "tirupati",
        "tirmalai": "tirumala",
        "masulipatnam": "machilipatnam",
        "cuddapah": "kadapa",
        "dolphine nose cdr visakhapatnam": "visakhapatnam",
        "gannavaram a": "gannavaram",
        "car nicobar": "car nicobar",
        "central delhi": "delhi",
    }

    return aliases.get(value, value)


def read_csv(path):
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return list(csv.DictReader(handle))


def build_temperature_rows():
    rows = read_csv(RAW_DIR / "temperature_table_full.csv")
    state = ""
    cleaned = []

    for row in rows:
        raw_state = row["State"].strip()
        if raw_state:
            state = raw_state

        station = row["Station"].strip()
        cleaned.append(
            {
                "state": state,
                "station": station,
                "station_key": normalize_name(station),
                "max_temp": row["Max."].strip(),
                "min_temp": row["Min."].strip(),
            }
        )

    return cleaned


def build_seismic_rows():
    rows = read_csv(RAW_DIR / "seismic_table_full.csv")
    return [
        {
            "town": row["Town"].strip(),
            "town_key": normalize_name(row["Town"]),
            "zone": row["Zone"].strip(),
            "zone_factor": row["Z"].strip(),
        }
        for row in rows
    ]


def build_wind_rows():
    rows = read_csv(RAW_DIR / "wind_table_full.csv")
    return [
        {
            "town": row["City/Town"].strip(),
            "town_key": normalize_name(row["City/Town"]),
            "wind_speed": row["Basic wind Speed"].strip(),
        }
        for row in rows
    ]


def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    temperature_rows = build_temperature_rows()
    seismic_rows = build_seismic_rows()
    wind_rows = build_wind_rows()

    temp_by_key = {row["station_key"]: row for row in temperature_rows}
    seismic_by_key = {row["town_key"]: row for row in seismic_rows}
    wind_by_key = {row["town_key"]: row for row in wind_rows}

    temp_keys = set(temp_by_key)
    seismic_keys = set(seismic_by_key)
    wind_keys = set(wind_by_key)

    triple_overlap = sorted(temp_keys & seismic_keys & wind_keys)
    wind_seismic_overlap = sorted(seismic_keys & wind_keys)
    temp_wind_overlap = sorted(temp_keys & wind_keys)
    temp_seismic_overlap = sorted(temp_keys & seismic_keys)

    merge_report = {
        "summary": {
            "temperature_rows": len(temperature_rows),
            "seismic_rows": len(seismic_rows),
            "wind_rows": len(wind_rows),
            "temperature_unique_keys": len(temp_keys),
            "seismic_unique_keys": len(seismic_keys),
            "wind_unique_keys": len(wind_keys),
            "triple_overlap_count": len(triple_overlap),
            "wind_seismic_overlap_count": len(wind_seismic_overlap),
            "temperature_wind_overlap_count": len(temp_wind_overlap),
            "temperature_seismic_overlap_count": len(temp_seismic_overlap),
        },
        "triple_overlap_keys": triple_overlap,
        "wind_seismic_overlap_cities": [
            {
                "city": wind_by_key[key]["town"],
                "wind_speed": wind_by_key[key]["wind_speed"],
                "seismic_zone": seismic_by_key[key]["zone"],
                "zone_factor": seismic_by_key[key]["zone_factor"],
            }
            for key in wind_seismic_overlap
        ],
        "temperature_wind_overlap_stations": [
            {
                "station": temp_by_key[key]["station"],
                "state": temp_by_key[key]["state"],
                "wind_city": wind_by_key[key]["town"],
                "wind_speed": wind_by_key[key]["wind_speed"],
                "max_temp": temp_by_key[key]["max_temp"],
                "min_temp": temp_by_key[key]["min_temp"],
            }
            for key in temp_wind_overlap
        ],
        "notes": [
            "The raw CSV files do not contain any exact city key present in all three datasets.",
            "Temperature data is station-based and mostly covers Andaman and Andhra Pradesh stations.",
            "Wind and seismic data overlap well, but temperature requires a separate mapping table before a full merged project-location dataset can be generated safely.",
        ],
    }

    processed_tables = {
        "temperature": temperature_rows,
        "seismic": seismic_rows,
        "wind": wind_rows,
    }

    (PROCESSED_DIR / "source_tables.json").write_text(
        json.dumps(processed_tables, indent=2),
        encoding="utf-8",
    )
    (PROCESSED_DIR / "merge_report.json").write_text(
        json.dumps(merge_report, indent=2),
        encoding="utf-8",
    )

    print(f"Wrote {PROCESSED_DIR / 'source_tables.json'}")
    print(f"Wrote {PROCESSED_DIR / 'merge_report.json'}")
    print(f"Exact triple overlaps: {len(triple_overlap)}")


if __name__ == "__main__":
    main()
