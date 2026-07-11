import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Activity, Heart, Moon } from 'lucide-react';

const hrData = [
  { day: 'Mon', bpm: 72 },
  { day: 'Tue', bpm: 75 },
  { day: 'Wed', bpm: 71 },
  { day: 'Thu', bpm: 78 },
  { day: 'Fri', bpm: 73 },
  { day: 'Sat', bpm: 70 },
  { day: 'Sun', bpm: 72 },
];

const activityData = [
  { day: 'Mon', steps: 6500 },
  { day: 'Tue', steps: 8200 },
  { day: 'Wed', steps: 10500 },
  { day: 'Thu', steps: 7800 },
  { day: 'Fri', steps: 9000 },
  { day: 'Sat', steps: 12000 },
  { day: 'Sun', steps: 8500 },
];

export default function HealthAnalytics() {
  return (
    <div className="health-analytics-container">
      <div className="ha-header">
        <h3>Health Overview</h3>
        <span className="ha-date-range">Last 7 Days</span>
      </div>

      <div className="ha-metrics-row">
        <div className="ha-metric-card">
          <div className="ha-icon-box" style={{ background: '#fef2f2', color: '#ef4444' }}>
            <Heart size={20} />
          </div>
          <div className="ha-metric-info">
            <span className="ha-metric-label">Avg Heart Rate</span>
            <strong className="ha-metric-value">73 <small>bpm</small></strong>
          </div>
        </div>

        <div className="ha-metric-card">
          <div className="ha-icon-box" style={{ background: '#f0fdf4', color: '#22c55e' }}>
            <Activity size={20} />
          </div>
          <div className="ha-metric-info">
            <span className="ha-metric-label">Avg Steps</span>
            <strong className="ha-metric-value">8,928</strong>
          </div>
        </div>

        <div className="ha-metric-card">
          <div className="ha-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <Moon size={20} />
          </div>
          <div className="ha-metric-info">
            <span className="ha-metric-label">Avg Sleep</span>
            <strong className="ha-metric-value">7h 15m</strong>
          </div>
        </div>
      </div>

      <div className="ha-charts-grid">
        {/* Heart Rate Chart */}
        <div className="ha-chart-card">
          <h4>Heart Rate Trend</h4>
          <div className="ha-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={['dataMin - 5', 'dataMax + 5']} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="ha-chart-card">
          <h4>Steps Taken</h4>
          <div className="ha-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="steps" radius={[6, 6, 6, 6]}>
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.steps > 10000 ? '#22c55e' : '#2e666e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
