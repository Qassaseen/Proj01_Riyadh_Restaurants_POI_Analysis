# GeoVis Project

## Overview
This project visualizes Riyadh restaurant data using high-performance mapping tools. It consists of a React frontend for visualization and a FastAPI backend for data serving.

### key Technologies (from Plan)
- **deck.gl**: A high-performance WebGL-based framework for visual analysis of large datasets. Used here as a faster alternative to Kepler.gl.
- **MapLibreGL**: A free and open-source alternative to Mapbox for rendering interactive maps.
- **Plotly**: A Python graphing library (used via `react-plotly.js` in frontend) for creating interactive, publication-quality graphs.

## Architecture

### Frontend (`geovis/frontend`)
Built with **React** and **Vite**.
- **Core Libraries**:
  - `deck.gl` & `react-map-gl`: For map layers and interactions.
  - `maplibre-gl`: Map rendering engine.
  - `react-plotly.js`: For statistical charts.
- **Structure**:
  - `src/components`: Contains Map and Sidebar components.
  - `src/App.jsx`: Main application logic.

### Backend (`geovis/backend`)
Built with **FastAPI**.
- **Entry Point**: `server.py`
- **Functionality**:
  - Serves `riyadh_resturants_clean.csv`.
  - Cleans data (standardizes columns, handles NaNs).
  - Exposure endpoint: `GET /restaurants`
