import requests
import json
import math

try:
    response = requests.get("http://127.0.0.1:5000/restaurants")
    
    if response.status_code == 200:
        data = response.json()
        
        if 'columns' not in data or 'data' not in data:
            print("Failed: Response does not have 'columns' and 'data' keys (expected split format).")
        else:
            cols = data['columns']
            rows = data['data']
            print(f"Success! Loaded {len(rows)} records in split format.")
            
            try:
                lat_idx = cols.index('lat')
                lng_idx = cols.index('lng')
            except ValueError:
                print("Failed: 'lat' or 'lng' column missing.")
                exit(1)

            # Check integrity
            clean = True
            for i, item in enumerate(rows):
                # Check coordinates using indices
                if item[lat_idx] is None or item[lng_idx] is None:
                     print(f"Record {i} has None coordinates: {item}")
                     clean = False
                     continue
                
                if not isinstance(item[lat_idx], (int, float)) or not isinstance(item[lng_idx], (int, float)):
                     print(f"Record {i} coordinates not numbers: {item}")
                     clean = False
                     
            if clean:
                print("Data integrity check passed: all records have valid coordinates.")
            else:
                print("Data integrity check FAILED.")
            
    else:
        print(f"Failed: HTTP {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"Verification script failed: {e}")
