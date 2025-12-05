# Backend Service

## Overview
This is the FastAPI backend for the GeoVis project. It serves cleaned restaurant data from `data/riyadh_resturants_clean.csv`.

## Installation

1.  Navigate to the backend directory:
    ```bash
    cd geovis/backend
    ```

2.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate.ps1
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Server

Start the development server:
```bash
uvicorn server:app --reload --port 5000
```

The API will be available at `http://127.0.0.1:5000`.
- Documentation: `http://127.0.0.1:5000/docs`
- Restaurants Endpoint: `http://127.0.0.1:5000/restaurants`
