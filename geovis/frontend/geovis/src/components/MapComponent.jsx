import React, { useMemo } from "react";
import { DeckGL } from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const INITIAL_VIEW = {
    longitude: 46.6753,
    latitude: 24.7136,
    zoom: 11,
    pitch: 0,
    bearing: 0
};

const MAP_STYLES = {
    light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
};

export default function MapComponent({ theme, data }) {
    const mapStyle = MAP_STYLES[theme] || MAP_STYLES.light;

    const { layers, getTooltip } = useMemo(() => {
        if (!data || !data.data || !data.columns) return { layers: [], getTooltip: () => null };

        const cols = data.columns;
        const latIdx = cols.indexOf("lat");
        const lngIdx = cols.indexOf("lng");
        const nameIdx = cols.indexOf("name");
        const catIdx = cols.indexOf("categories");

        const layer = new ScatterplotLayer({
            id: "restaurants-layer",
            data: data.data,
            getPosition: d => [d[lngIdx], d[latIdx]],
            getFillColor: [255, 140, 0],
            getRadius: 40,
            radiusMinPixels: 1,
            radiusMaxPixels: 5,
            pickable: true,
            onClick: ({ object }) => {
                if (object) alert(`Restaurant: ${object[nameIdx]}\nCategory: ${object[catIdx]}`);
            }
        });

        return {
            layers: [layer],
            getTooltip: ({ object }) => object && `${object[nameIdx]}`
        };
    }, [data]);

    return (
        <div style={{ flex: 1, position: "relative" }}>
            <DeckGL
                controller={true}
                initialViewState={INITIAL_VIEW}
                style={{ width: "100%", height: "100%" }}
                layers={layers}
                getTooltip={getTooltip}
            >
                <Map
                    mapStyle={mapStyle}
                    reuseMaps
                />
            </DeckGL>
        </div>
    );
}
