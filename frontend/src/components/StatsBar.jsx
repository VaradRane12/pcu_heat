export default function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      <StatCard label="Max LST" value={`${stats.max_lst}°C`} accent="red" />
      <StatCard label="Avg LST" value={`${stats.avg_lst}°C`} accent="orange" />
      <StatCard label="Min LST" value={`${stats.min_lst}°C`} accent="green" />
      <StatCard label="Critical Zones" value={stats.critical_zones} accent="red" />
      <StatCard label="High Risk" value={stats.high_zones} accent="orange" />
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
