import { useState, useEffect, useCallback } from "react";
import HeatGrid from "./components/HeatGrid";
import StatsBar from "./components/StatsBar";
import InterventionPanel from "./components/InterventionPanel";
import HotspotsList from "./components/HotspotsList";
import RankingPanel from "./components/RankingPanel";
import "./index.css";

const API = "http://localhost:8000";

export default function App() {
  const [gridData, setGridData] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("simulate"); // simulate | rank

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/grid`).then((r) => r.json()),
      fetch(`${API}/api/hotspots`).then((r) => r.json()),
    ]).then(([grid, hs]) => {
      setGridData(grid);
      setHotspots(hs.hotspots);
      setLoading(false);
    });
  }, []);

  const handleCellSelect = useCallback(async (cell) => {
    setSelectedCell(cell);
    setSimulationResult(null);
    setRankings(null);
    // Auto-fetch rankings
    const res = await fetch(`${API}/api/ranking/${cell.id}`);
    const data = await res.json();
    setRankings(data);
  }, []);

  const handleSimulate = useCallback(
    async (interventionType, units) => {
      if (!selectedCell) return;
      setSimLoading(true);
      const res = await fetch(`${API}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cell_id: selectedCell.id,
          intervention_type: interventionType,
          units,
        }),
      });
      const data = await res.json();
      setSimulationResult(data);
      setSimLoading(false);
    },
    [selectedCell]
  );

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader-pulse" />
        <p>Ingesting satellite thermal data...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <span className="header-badge">LIVE THERMAL FEED</span>
          <h1>Urban Heat<span className="accent"> AI</span></h1>
          <p className="header-sub">Mitigation Intelligence System · {gridData.city}</p>
        </div>
        <StatsBar stats={gridData.stats} />
      </header>

      <div className="app-body">
        {/* Left: grid + hotspots */}
        <aside className="left-panel">
          <div className="panel-label">
            <span className="dot critical" /> THERMAL MAP — 10×10 km GRID
          </div>
          <HeatGrid
            cells={gridData.grid}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
          />
          <HotspotsList hotspots={hotspots} onSelect={handleCellSelect} selectedCell={selectedCell} />
        </aside>

        {/* Right: intervention & results */}
        <main className="right-panel">
          {!selectedCell ? (
            <div className="empty-state">
              <div className="empty-icon">📡</div>
              <h2>Select a zone on the thermal map</h2>
              <p>Click any grid cell to analyze its heat signature and simulate cooling interventions.</p>
            </div>
          ) : (
            <>
              <div className="cell-header">
                <div>
                  <div className={`severity-tag ${selectedCell.severity}`}>
                    {selectedCell.severity.toUpperCase()}
                  </div>
                  <h2>Zone [{selectedCell.row},{selectedCell.col}] · {selectedCell.zone}</h2>
                </div>
                <div className="cell-metrics">
                  <Metric label="LST" value={`${selectedCell.lst}°C`} hot />
                  <Metric label="NDVI" value={selectedCell.ndvi} />
                  <Metric label="NDBI" value={selectedCell.ndbi} />
                </div>
              </div>

              <div className="tab-bar">
                <button
                  className={`tab ${activeTab === "simulate" ? "active" : ""}`}
                  onClick={() => setActiveTab("simulate")}
                >
                  ⚡ Simulate Intervention
                </button>
                <button
                  className={`tab ${activeTab === "rank" ? "active" : ""}`}
                  onClick={() => setActiveTab("rank")}
                >
                  🏆 Cooling ROI Ranking
                </button>
              </div>

              {activeTab === "simulate" && (
                <InterventionPanel
                  onSimulate={handleSimulate}
                  result={simulationResult}
                  loading={simLoading}
                />
              )}
              {activeTab === "rank" && (
                <RankingPanel rankings={rankings} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value, hot }) {
  return (
    <div className={`metric ${hot ? "hot" : ""}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  );
}
