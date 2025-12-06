# Data Engineering – Riyadh Restaurants POI Project

This folder contains all **data engineering** work for the **Riyadh Restaurants (20K)** project.

> Role: **Member 1 – Data Engineer (The Foundation)**  
> Scope: Download, clean, and prepare the data. Create the sample district subset.  
> Deliverables: **Cleaned CSV**, **GeoJSON**, **sample district subset**, and **documentation**.

The outputs in this folder are the **single source of truth** for all other team members:
- Spatial Analyst (maps, spatial queries)
- Business Analyst (non-spatial analysis)
- Dashboard Developer (Streamlit / web app)

---

## 1. Dataset Overview

**Source:** Kaggle – *Riyadh Restaurants 20K* (Foursquare POIs)  
**Unit of observation:** One row = one restaurant / cafe in Riyadh.

### Core Columns (after cleaning)

| Column          | Type      | Description                                                |
|-----------------|-----------|------------------------------------------------------------|
| `name`          | string    | Restaurant name (Arabic or English).                      |
| `categories`    | string    | Comma-separated categories (e.g. `coffee shop, bakery`).  |
| `address`       | string    | Informal address / location description.                  |
| `lat`           | float     | Latitude (WGS 84, EPSG:4326).                             |
| `lng`           | float     | Longitude (WGS 84, EPSG:4326).                            |
| `price`         | category  | Cleaned price level (`cheap`, `moderate`, `expensive`, `very expensive`). |
| `likes`         | float     | Number of likes on Foursquare.                            |
| `photos`        | int       | Number of photos.                                         |
| `tips`          | int       | Number of text tips / comments (count only).              |
| `rating`        | float     | Average user rating (0–10 scale).                         |
| `ratingSignals` | float     | Number of users who rated the place (often missing).      |
| `postcode`      | string    | 5-digit postal code extracted from `address` when present. |
| `price_code`    | int       | Encoded price level (`cheap=0`, `moderate=1`, `expensive=2`, `very expensive=3`). |

> `postcode` and `price_code` are **engineered columns** created by the Data Engineer for easier analysis.

---

## 2. Row Counts & Missing Values

### Row Counts

- **Raw dataset:** `19,361` rows  
- **Cleaned dataset:** `19,355` rows  
- **Sample district subset:** `1,804` rows  

The difference of 6 rows is mainly due to **duplicate removal** and basic quality checks.

### Missing Values After Cleaning (original source columns)

| Column          | Missing |
|-----------------|---------|
| `name`          | 0       |
| `categories`    | 0       |
| `address`       | 0       |
| `lat`           | 0       |
| `lng`           | 0       |
| `price`         | 0       |
| `likes`         | 0       |
| `photos`        | 0       |
| `tips`          | 0       |
| `rating`        | 0       |
| `ratingSignals` | 11,409  |

Notes:

- All **critical analysis columns** (`price`, `rating`, `lat`, `lng`, `likes`) are complete.
- `ratingSignals` is missing for many restaurants (as in the original source) and is left as `NaN` on purpose.
- **Engineered columns:**
  - `price_code` has no missing values (derived directly from cleaned `price`).
  - `postcode` can be `NaN` when no 5-digit pattern is found in `address`.

---

## 3. Folder Structure

Inside `data_engineering/`:

```text
data_engineering/
  data/
    raw/
      riyadh_resturants_raw.csv
    clean/
      riyadh_restaurants_clean.csv
      riyadh_restaurants_clean.geojson
    boundaries/
      districts_sample_200.geojson
      districts_EPSG4326.geojson
    sample_district/
      restaurants_sample_district.geojson
      restaurants_sample_district.csv
  notebooks/
    01_explore_raw.ipynb
    02_clean_data.ipynb
    03_export_geojson.ipynb
```

---

## 4. Environment & Requirements

The notebooks are designed to run with:

- **Python**: 3.10+  
- **Core libraries**:
  - `pandas`
  - `numpy`
  - `geopandas`
  - `shapely`
- **CLI tools**:
  - `gdal` / `ogr2ogr` (installed at system level, used for clipping)

Example setup (conda):

```bash
conda create -n riyadh-restaurants python=3.10
conda activate riyadh-restaurants

pip install pandas numpy geopandas shapely
# GDAL is installed via system package manager (e.g. apt) or conda-forge
```

---

## 5. Data Engineering Pipeline

The pipeline is implemented in **three notebooks** plus **two GDAL commands**.

### 5.1 `01_explore_raw.ipynb` – Raw Data Exploration

Tasks:

- Load `data/raw/riyadh_resturants_raw.csv`.
- Inspect columns, data types, and initial distributions.
- Check:
  - coordinate ranges for `lat` and `lng`,
  - rating range (`rating` roughly 4.4–9.6),
  - presence of missing values.
- No modifications are written to disk here — this notebook is **exploratory only**.

---

### 5.2 `02_clean_data.ipynb` – Cleaning & Preprocessing

This is the **core cleaning notebook**. Main steps:

#### 5.2.1 Start from Raw Data

```python
import pandas as pd
import numpy as np

df = pd.read_csv("../data/raw/riyadh_resturants_raw.csv")
df_clean = df.copy()
```

#### 5.2.2 Coordinates

```python
df_clean["lat"] = pd.to_numeric(df_clean["lat"], errors="coerce")
df_clean["lng"] = pd.to_numeric(df_clean["lng"], errors="coerce")
```

- Ensures `lat` and `lng` are numeric.
- In this dataset, no rows end up `NaN` after conversion.

#### 5.2.3 Duplicate Removal

```python
df_clean = df_clean.drop_duplicates()
df_clean = df_clean.drop_duplicates(subset=["name", "lat", "lng"])
```

- First removes exact full-row duplicates.
- Then removes likely duplicates of the **same physical restaurant** (same `name`, `lat`, `lng`).

#### 5.2.4 Price Cleaning

```python
df_clean["price"] = df_clean["price"].str.strip().str.lower()
df_clean["price"] = df_clean["price"].replace("nan", np.nan)

price_mode = df["price"].mode()[0]
price_mode = price_mode.strip().lower()
df_clean["price"] = df_clean["price"].fillna(price_mode)
```

- Normalizes `price` strings: trims whitespace, forces lowercase.
- Treats literal `"nan"` strings as missing.
- Fills missing `price` with the **global mode** (most frequent price level in the original data).

Resulting `price` categories include:

- `cheap`
- `moderate`
- `expensive`
- `very expensive`

#### 5.2.5 Price Encoding (`price_code`)

```python
price_map = {
    "cheap": 0,
    "moderate": 1,
    "expensive": 2,
    "very expensive": 3,
}

df_clean["price_code"] = df_clean["price"].map(price_map)
```

- Adds a numeric column `price_code` for modeling / correlations:
  - `cheap = 0`
  - `moderate = 1`
  - `expensive = 2`
  - `very expensive = 3`
- `price` remains as human-readable labels.

#### 5.2.6 Rating Imputation

```python
rating_mean = df_clean["rating"].mean()
df_clean["rating"] = df_clean["rating"].fillna(rating_mean)
```

- `rating` is already numeric.
- Missing ratings are filled with the **overall mean rating**.

#### 5.2.7 Likes & Other Fields

```python
df_clean["likes"] = df_clean["likes"].fillna(0)
```

- `likes`: missing values → `0` (interpreted as “no recorded likes”).

Other columns:

- `photos`, `tips` → already complete, left unchanged.
- `ratingSignals` → many missing values, intentionally left as `NaN`.

#### 5.2.8 Text Normalization

```python
for col in ["name", "categories", "address"]:
    if col in df_clean.columns:
        df_clean[col] = df_clean[col].astype(str).str.strip()
```

- Removes leading and trailing whitespace from `name`, `categories`, and `address`.
- **Preserves** original capitalization and internal punctuation (`o'reilly`, `mcdonald's`, etc.).

#### 5.2.9 Postcode Extraction

```python
import re
import numpy as np

def extract_postcode(addr):
    if pd.isna(addr):
        return np.nan
    addr = str(addr)
    matches = re.findall(r"(\d{5})", addr)
    if not matches:
        return np.nan
    return matches[-1]

df_clean["postcode"] = df_clean["address"].apply(extract_postcode)
```

- Searches each `address` for **5-digit numbers**.
- If multiple 5-digit blocks exist, uses the **last one** (usually the postcode at the end).
- If no 5-digit pattern is found, `postcode` is set to `NaN`.

#### 5.2.10 Save Cleaned CSV

```python
df_clean.to_csv("../data/clean/riyadh_restaurants_clean.csv", index=False)
```

Output:

- `data/clean/riyadh_restaurants_clean.csv`
- `19,355` cleaned rows, including engineered columns `postcode` and `price_code`.

---

### 5.3 `03_export_geojson.ipynb` – GeoJSON Export

Converts the cleaned CSV into a spatial file for the Spatial/Dashboard teams.

Core code:

```python
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

df_clean = pd.read_csv("../data/clean/riyadh_restaurants_clean.csv")

geometry = [Point(xy) for xy in zip(df_clean["lng"], df_clean["lat"])]
gdf_rest = gpd.GeoDataFrame(df_clean, geometry=geometry, crs="EPSG:4326")

gdf_rest.to_file("../data/clean/riyadh_restaurants_clean.geojson",
                 driver="GeoJSON")
```

Output:

- `data/clean/riyadh_restaurants_clean.geojson`
- Geometry type: **Point**
- CRS: **EPSG:4326 (WGS 84)**
- Includes all attributes from the CSV (`postcode`, `price_code`, etc.).

---

## 6. Sample District Creation (GDAL / OGR)

To focus analysis on a **sample district/study area**, a polygon boundary layer is provided:

- `data/boundaries/districts_sample_200.geojson`

### 6.1 Reproject Districts to EPSG:4326

```bash
ogr2ogr -t_srs EPSG:4326   data/boundaries/districts_EPSG4326.geojson   data/boundaries/districts_sample_200.geojson
```

- Ensures district polygons use the same CRS (EPSG:4326) as the restaurant points.

### 6.2 Clip Restaurants to the Sample District

```bash
ogr2ogr -f "GeoJSON"   data/sample_district/restaurants_sample_district.geojson   data/clean/riyadh_restaurants_clean.geojson   -clipsrc data/boundaries/districts_EPSG4326.geojson
```

- Keeps only restaurant points inside the district polygons.
- Output:
  - `data/sample_district/restaurants_sample_district.geojson`
  - Features: **1,804** restaurants.

### 6.3 CSV Export of Sample District

```bash
ogr2ogr -f "CSV"   data/sample_district/restaurants_sample_district.csv   data/sample_district/restaurants_sample_district.geojson
```

- Output:
  - `data/sample_district/restaurants_sample_district.csv`
  - Same attributes as the full cleaned CSV, including `postcode` and `price_code`, but subset to the study region.

---

## 7. How Other Team Members Should Use These Files

### 7.1 Spatial Analyst (Member 2)

Use:

- **City-wide:**
  - `data/clean/riyadh_restaurants_clean.geojson`
- **Sample district:**
  - `data/sample_district/restaurants_sample_district.geojson`

Both are in **EPSG:4326**, ready for:

- GeoPandas,
- QGIS,
- Web maps (Leaflet, Mapbox, etc.).

You can also group or filter by `postcode` for local patterns.

### 7.2 Business Analyst (Member 3)

Use:

- **Global analysis:**
  - `data/clean/riyadh_restaurants_clean.csv`
- **Local (sample district) analysis:**
  - `data/sample_district/restaurants_sample_district.csv`

Notes:

- `price` and `rating` have **no missing values** → safe for correlations and plots.
- `price_code` is ideal for numeric analysis (correlations, models).
- `ratingSignals` has many `NaN` → filter or treat explicitly when used.
- `postcode` can be used to summarize results by postal code where available.

### 7.3 Dashboard Developer (Member 4)

Use:

- CSVs for tables and non-spatial charts.
- GeoJSONs for map visualizations.

Example pages:

- **All Riyadh overview** → use full cleaned dataset.
- **Sample District deep-dive** → use `restaurants_sample_district` files.
- Extra filters: by `price`, `price_code`, or `postcode`.

---

## 8. Reproducing the Pipeline

To completely reproduce the data engineering outputs:

1. Place the raw Kaggle file as:

   ```text
   data/raw/riyadh_resturants_raw.csv
   ```

2. Run notebooks in this order:

   1. `notebooks/01_explore_raw.ipynb` (optional, for understanding)
   2. `notebooks/02_clean_data.ipynb`
   3. `notebooks/03_export_geojson.ipynb`

3. Run the GDAL commands:

   ```bash
   ogr2ogr -t_srs EPSG:4326      data/boundaries/districts_EPSG4326.geojson      data/boundaries/districts_sample_200.geojson

   ogr2ogr -f "GeoJSON"      data/sample_district/restaurants_sample_district.geojson      data/clean/riyadh_restaurants_clean.geojson      -clipsrc data/boundaries/districts_EPSG4326.geojson

   ogr2ogr -f "CSV"      data/sample_district/restaurants_sample_district.csv      data/sample_district/restaurants_sample_district.geojson
   ```

After these steps, all files used by Spatial, Business, and Dashboard roles will be regenerated from scratch.

