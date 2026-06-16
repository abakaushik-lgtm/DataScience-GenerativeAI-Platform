'use client';

import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';

export default function AdvancedMLDashboard() {
  const [activeTab, setActiveTab] = useState<'ab' | 'anomaly' | 'shap'>('ab');
  
  // A/B Test State
  const [abParams, setAbParams] = useState({ controlSize: 1000, controlConvs: 100, treatmentSize: 1000, treatmentConvs: 150 });
  const [abResult, setAbResult] = useState<any>(null);

  // Anomaly State
  const [anomalyResult, setAnomalyResult] = useState<any>(null);

  // SHAP State
  const [shapResult, setShapResult] = useState<any>(null);

  const runABTest = async () => {
    try {
      const res = await fetch('/api/advanced-ml/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          control_conversions: abParams.controlConvs,
          control_size: abParams.controlSize,
          treatment_conversions: abParams.treatmentConvs,
          treatment_size: abParams.treatmentSize
        })
      });
      const data = await res.json();
      setAbResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const runAnomalyDetection = async () => {
    // Generate synthetic time series with a spike
    const data = Array.from({length: 100}, () => Math.random() * 10);
    data[45] = 45.5; // Inject anomaly
    data[80] = -20.0; // Inject anomaly

    try {
      const res = await fetch('/api/advanced-ml/anomalies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      const result = await res.json();
      setAnomalyResult({ raw: data, ...result });
    } catch (e) {
      console.error(e);
    }
  };

  const runShap = async () => {
    // Generate synthetic X matrix
    const X = Array.from({length: 50}, () => Array.from({length: 5}, () => Math.random()));
    try {
      const res = await fetch('/api/advanced-ml/shap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_type: 'random_forest', X })
      });
      const data = await res.json();
      setShapResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-[#0a0a0f] text-[#f0f0f5] p-8 custom-scrollbar" style={{ height: '100%', overflowY: 'auto' }}>
      
      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8">
        {['ab', 'anomaly', 'shap'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab 
              ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
              : 'bg-surface hover:bg-surfaceHover border border-border'
            }`}
          >
            {tab === 'ab' ? 'A/B Testing' : tab === 'anomaly' ? 'Anomaly Detection' : 'SHAP Explainability'}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8 backdrop-blur-glass shadow-glass">
        
        {/* A/B Testing Tab */}
        {activeTab === 'ab' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Statistical Validations</h2>
              <p className="text-gray-400 mb-6">Calculate true statistical significance using SciPy Two-Proportion Z-Tests.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Control Size" value={abParams.controlSize} onChange={e => setAbParams({...abParams, controlSize: +e.target.value})} className="bg-black/50 border border-border rounded p-3 w-full"/>
                  <input type="number" placeholder="Control Convs" value={abParams.controlConvs} onChange={e => setAbParams({...abParams, controlConvs: +e.target.value})} className="bg-black/50 border border-border rounded p-3 w-full"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Treatment Size" value={abParams.treatmentSize} onChange={e => setAbParams({...abParams, treatmentSize: +e.target.value})} className="bg-black/50 border border-border rounded p-3 w-full"/>
                  <input type="number" placeholder="Treatment Convs" value={abParams.treatmentConvs} onChange={e => setAbParams({...abParams, treatmentConvs: +e.target.value})} className="bg-black/50 border border-border rounded p-3 w-full"/>
                </div>
                <button onClick={runABTest} className="w-full bg-success text-black font-bold py-3 rounded-lg hover:brightness-110 transition">Run Inference</button>
              </div>
            </div>

            {abResult && (
              <div className={`p-6 rounded-xl border ${abResult.significant ? 'border-success bg-success/10' : 'border-danger bg-danger/10'}`}>
                <h3 className="text-xl font-bold mb-4">{abResult.significant ? 'Statistically Significant! 🚀' : 'No Significance Detected 📉'}</h3>
                <div className="space-y-2 text-lg">
                  <p><strong>P-Value:</strong> {abResult.p_value.toFixed(4)}</p>
                  <p><strong>Uplift:</strong> {(abResult.uplift * 100).toFixed(2)}%</p>
                  <p><strong>Control Rate:</strong> {(abResult.control_conversion_rate * 100).toFixed(2)}%</p>
                  <p><strong>Treatment Rate:</strong> {(abResult.treatment_conversion_rate * 100).toFixed(2)}%</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Anomaly Detection Tab */}
        {activeTab === 'anomaly' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Isolation Forest Anomaly Detection</h2>
            <p className="text-gray-400 mb-6">Automatically detect multidimensional statistical outliers.</p>
            <button onClick={runAnomalyDetection} className="bg-primary px-8 py-3 rounded-lg font-bold hover:brightness-110 transition mb-8">Analyze Random Data Stream</button>

            {anomalyResult && (
              <ReactECharts
                option={{
                  tooltip: { trigger: 'axis' },
                  xAxis: { type: 'category', data: anomalyResult.raw.map((_:any, i:number) => `T${i}`) },
                  yAxis: { type: 'value' },
                  series: [{
                    data: anomalyResult.raw.map((v:number) => ({
                      value: v,
                      itemStyle: { color: anomalyResult.anomalies.includes(v) ? '#ef4444' : '#6366f1' }
                    })),
                    type: 'scatter',
                    symbolSize: (data:any) => anomalyResult.anomalies.includes(data[1]) ? 20 : 8
                  }]
                }}
                style={{ height: '400px', width: '100%' }}
                theme="dark"
              />
            )}
          </div>
        )}

        {/* SHAP Tab */}
        {activeTab === 'shap' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">SHAP Explainable AI</h2>
            <p className="text-gray-400 mb-6">Demystify Black Box Models using SHapley Additive exPlanations.</p>
            <button onClick={runShap} className="bg-warning text-black px-8 py-3 rounded-lg font-bold hover:brightness-110 transition mb-8">Calculate Feature Importance</button>

            {shapResult && (
              <ReactECharts
                option={{
                  tooltip: { trigger: 'axis' },
                  xAxis: { type: 'value', name: 'Mean Absolute SHAP Value' },
                  yAxis: { type: 'category', data: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'] },
                  series: [{
                    data: shapResult.feature_importance,
                    type: 'bar',
                    itemStyle: { color: '#f59e0b' }
                  }]
                }}
                style={{ height: '400px', width: '100%' }}
                theme="dark"
              />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
