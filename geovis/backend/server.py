from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "riyadh_resturants_clean.csv")

@app.get("/restaurants")
def get_restaurants():
    try:
        df = pd.read_csv(DATA_PATH)
        
        # 1. Standardize column names
        df.columns = df.columns.str.strip().str.lower()
        
        # 2. Ensure critical coordinates are numeric
        df['lat'] = pd.to_numeric(df['lat'], errors='coerce')
        df['lng'] = pd.to_numeric(df['lng'], errors='coerce')
        
        # 3. Drop rows with invalid coordinates (essential for map)
        df.dropna(subset=['lat', 'lng'], inplace=True)
        
        # 4. Handle Infinity and NaN for JSON compliance
        # Replace infinity with NaN first
        df.replace([np.inf, -np.inf], np.nan, inplace=True)
        
        # Replace NaN with None (which becomes null in JSON)
        # We use strict object replacement to avoid type issues
        df = df.astype(object).where(pd.notnull(df), None)
        
        return df.to_dict(orient="split")
    except Exception as e:
        print(f"Error loading data: {e}") # Log to server console
        return {"error": str(e)}
