import React from "react";
import Plot from "react-plotly.js";

export default function Sidebar({ theme, setTheme, onLoadData, data, isLoading }) {
    const isDark = theme === "dark";
    const bg = isDark ? "#333" : "#fafafa";
    const fg = isDark ? "#fff" : "#000";
    const border = isDark ? "#555" : "#ccc";

    // Simple aggregation for charts (mock logic or real if needed later)
    // For now, keeping the static charts from original code or user can update later
    // We will just show the control panel prominently

    return (
        <div
            style={{
                width: "350px",
                borderRight: `1px solid ${border}`,
                padding: "20px",
                overflowY: "auto",
                background: bg,
                color: fg,
                display: "flex",
                flexDirection: "column",
                gap: "20px"
            }}
        >
            <h2 style={{ margin: 0 }}>Riyadh Dashboard</h2>

            {/* Controls Section */}
            <div style={{ padding: "15px", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius: "8px" }}>
                <h4 style={{ marginTop: 0 }}>Controls</h4>

                {/* Theme Toggle */}
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ marginRight: "10px", fontWeight: "bold" }}>Theme:</label>
                    <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                        <button
                            onClick={() => setTheme("light")}
                            style={{
                                flex: 1,
                                padding: "8px",
                                cursor: "pointer",
                                border: theme === "light" ? "2px solid #007bff" : `1px solid ${border}`,
                                background: isDark ? "#444" : "#fff",
                                color: isDark ? "#fff" : "#333",
                                borderRadius: "4px"
                            }}
                        >
                            Light
                        </button>
                        <button
                            onClick={() => setTheme("dark")}
                            style={{
                                flex: 1,
                                padding: "8px",
                                cursor: "pointer",
                                border: theme === "dark" ? "2px solid #007bff" : `1px solid ${border}`,
                                background: isDark ? "#444" : "#fff",
                                color: isDark ? "#fff" : "#333",
                                borderRadius: "4px"
                            }}
                        >
                            Dark
                        </button>
                    </div>
                </div>

                {/* Load Data Button */}
                <div>
                    <label style={{ marginRight: "10px", fontWeight: "bold" }}>Data Source:</label>
                    <button
                        onClick={onLoadData}
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            marginTop: "5px",
                            padding: "10px",
                            background: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? "Loading..." : "Load Restaurants from Backend"}
                    </button>
                </div>

                {data && data.data && (
                    <div style={{ marginTop: "10px", fontSize: "0.9em", color: "green" }}>
                        Loaded {data.data.length} records.
                    </div>
                )}
            </div>

            {/* Existing Charts (Static for now, can be made dynamic later) */}
            <div>
                <h4 style={{ marginTop: 0 }}>Overview</h4>
                <Plot
                    data={[
                        {
                            x: ["Fast Food", "Cafe", "Arabic", "Indian"],
                            y: [12, 8, 20, 5],
                            type: "bar",
                            marker: { color: "rgb(66, 135, 245)" }
                        }
                    ]}
                    layout={{
                        width: 300,
                        height: 200,
                        margin: { t: 30, b: 30, l: 30, r: 10 },
                        paper_bgcolor: "rgba(0,0,0,0)",
                        plot_bgcolor: "rgba(0,0,0,0)",
                        font: { color: fg }
                    }}
                    config={{ displayModeBar: false }}
                />
            </div>
        </div>
    );
}
