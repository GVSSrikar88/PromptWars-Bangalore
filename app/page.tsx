'use client';

import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, CloudLightning, ShieldAlert, FileText, Camera, TreePine, CloudRain, DollarSign, Stethoscope, Siren, Globe } from 'lucide-react';

type StructuredResponse = {
  assigned_agent: string;
  scenario_type: string;
  risk_assessment: 'Critical' | 'High' | 'Medium' | 'Low';
  extracted_entities: Record<string, string>;
  action_plan: { step: string; is_urgent: boolean }[];
};

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StructuredResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcessIntent = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/process-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process intent. System may be offline.');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'risk-critical';
      case 'high': return 'risk-high';
      case 'medium': return 'risk-medium';
      case 'low': return 'risk-low';
      default: return 'risk-medium';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return <ShieldAlert size={16} />;
      case 'high': return <AlertTriangle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getThemeClass = (agentName?: string) => {
    if (!agentName) return 'theme-general';
    const lower = agentName.toLowerCase();
    if (lower.includes('environment')) return 'theme-environment';
    if (lower.includes('weather')) return 'theme-weather';
    if (lower.includes('finance')) return 'theme-finance';
    if (lower.includes('medical')) return 'theme-medical';
    if (lower.includes('emergency')) return 'theme-emergency';
    return 'theme-general';
  };

  const getAgentIcon = (agentName?: string, size: number = 24, className: string = "logo-icon") => {
    if (!agentName) return <Globe size={size} className={className} />;
    const lower = agentName.toLowerCase();
    if (lower.includes('environment')) return <TreePine size={size} className={className} />;
    if (lower.includes('weather')) return <CloudRain size={size} className={className} />;
    if (lower.includes('finance')) return <DollarSign size={size} className={className} />;
    if (lower.includes('medical')) return <Stethoscope size={size} className={className} />;
    if (lower.includes('emergency')) return <Siren size={size} className={className} />;
    return <Globe size={size} className={className} />;
  };

  return (
    <div className={`dashboard-grid ${getThemeClass(result?.assigned_agent)}`}>
      {/* Input Panel */}
      <section className="panel">
        <h2 className="panel-title">
          <CloudLightning className="logo-icon" size={24} />
          Unstructured Input Feed
        </h2>
        
        <div className="input-area">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Paste raw text, messy medical records, emergency logs, or financial appeals. VitalBridge will auto-route to the best Agent.
          </p>
          
          <textarea
            className="messy-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"e.g. URGENT!! Highway 9, mile marker 45. Multi-car pileup, 2 people trapped... OR Huge chemical spill detected in the local river..."}
          />
          
          <div className="upload-zone" onClick={() => alert('Image/Audio upload mock for demo purposes. Switch to text for now.')}>
            <Camera size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
            <p>Drag and drop images (medical notes, scene photos) or voice logs here.</p>
          </div>
          
          <button 
            className="btn-process" 
            onClick={handleProcessIntent}
            disabled={loading || !input.trim()}
          >
            {loading ? 'Routing to Specialized Agent...' : 'Structure Intent & Generate Plan'}
          </button>
          
          {error && (
            <div style={{ color: 'var(--urgent-color)', marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Output Panel */}
      <section className="panel" style={{ minHeight: '500px' }}>
        <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getAgentIcon(result?.assigned_agent)}
            {result?.assigned_agent || 'Awaiting Routing'}
          </div>
          {result && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', border: '1px solid var(--accent-glow)', padding: '0.25rem 0.5rem', borderRadius: '12px' }}>
              ACTIVE
            </span>
          )}
        </h2>
        
        {loading ? (
          <div className="loader">
            <div className="spinner"></div>
            <p className="typewriter">Analyzing semantics & invoking specialist agent...</p>
          </div>
        ) : result ? (
          <div className="structured-output">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>Detected Scenario</span>
                <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{result.scenario_type}</h3>
              </div>
              <div className={`badge-risk ${getRiskClass(result.risk_assessment)}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {getRiskIcon(result.risk_assessment)}
                Risk Level: {result.risk_assessment}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <span style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>Extracted Entities</span>
              <div className="entity-list">
                {Object.entries(result.extracted_entities).map(([key, value]) => (
                  <div key={key} className="entity-tag">
                    {key.replace(/_/g, ' ').toUpperCase()}: <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <span style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>Verified Action Plan</span>
              <ol className="action-list" style={{ marginTop: '1rem' }}>
                {result.action_plan.map((action, idx) => (
                  <li key={idx} className={`action-item ${action.is_urgent ? 'urgent' : ''}`}>
                    <div className="action-icon">
                      {action.is_urgent ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div>
                      <span style={{ fontWeight: action.is_urgent ? 600 : 400, color: action.is_urgent ? 'var(--urgent-color)' : 'var(--text-primary)' }}>
                        {action.step}
                      </span>
                      {action.is_urgent && <div style={{ fontSize: '0.75rem', color: 'var(--urgent-color)', marginTop: '0.25rem', opacity: 0.8 }}>IMMEDIATE ACTION REQUIRED</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <div>
              <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
              <p>System idle. Waiting for raw input data to assign Agent.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
