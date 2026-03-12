import { useState } from "react";

const SEVERITY_COLORS = {
  critical: { bg: "#ff2d2d", text: "#fff" },
  high:     { bg: "#ff7b00", text: "#fff" },
  moderate: { bg: "#ffd500", text: "#111" },
  low:      { bg: "#4cde80", text: "#111" },
};

function tempToColor(lst, min, max) {
  const t = (lst - min) / (max - min);
  // Gradient: cool blue → yellow → red
  if (t < 0.5) {
    const r = Math.round(255 * t * 2);
    const g = Math.round(180 * t * 2);
    const b = Math.round(100 * (1 - t * 2));
    return `rgb(${r},${g},${b})`;
  } else {
    const t2 = (t - 0.5) * 2;
    const r = 255;
    const g = Math.round(180 * (1 - t2));
    const b = 0;
    return `rgb(${r},${g},${b})`;
  }
}

export default function HeatGrid({ cells, selectedCell, onCellSelect }) {
  const [hovered, setHovered] = useState(null);

  const lsts = cells.map((c) => c.lst);
  const minLst = Math.min(...lsts);
  const maxLst = Math.max(...lsts);

  return (
    <div className="heat-grid-wrapper">
      <div className="heat-grid">
        {cells.map((cell) => {
          const color = tempToColor(cell.lst, minLst, maxLst);
          const isSelected = selectedCell?.id === cell.id;
          const isHovered = hovered === cell.id;

          return (
            <div
              key={cell.id}
              className={`grid-cell ${isSelected ? "selected" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => onCellSelect(cell)}
              onMouseEnter={() => setHovered(cell.id)}
              onMouseLeave={() => setHovered(null)}
              title={`${cell.zone} · ${cell.lst}°C`}
            >
              {(isSelected || isHovered) && (
                <span className="cell-temp">{cell.lst.toFixed(1)}</span>
              )}
              {isSelected && <div className="cell-ring" />}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="legend">
        <span className="legend-label">{minLst.toFixed(1)}°C</span>
        <div className="legend-bar" />
        <span className="legend-label">{maxLst.toFixed(1)}°C</span>
      </div>

      {/* Severity legend */}
      <div className="severity-legend">
        {Object.entries(SEVERITY_COLORS).map(([key, val]) => (
          <div key={key} className="sev-item">
            <span className="sev-dot" style={{ background: val.bg }} />
            <span>{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
