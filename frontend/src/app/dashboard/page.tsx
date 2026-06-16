"use client";

import { useEffect, useState, Suspense } from "react";
import ReactECharts from "echarts-for-react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, AlertTriangle, Activity, Zap, Cpu, Download } from "lucide-react";
import { useSearchParams } from "next/navigation";

function InsightsDashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"insights" | "forecasting" | "automl">("insights");

  useEffect(() => {
    if (tabParam === "forecasting" || tabParam === "automl") {
      setActiveTab(tabParam as any);
    } else {
      setActiveTab("insights");
    }
  }, [tabParam]);
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // Forecasting State
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastData, setForecastData] = useState<any>(null);
  const [algo, setAlgo] = useState("Prophet");
  const [periods, setPeriods] = useState(12);

  // AutoML State
  const [loadingAutoML, setLoadingAutoML] = useState(false);
  const [autoMLData, setAutoMLData] = useState<any>(null);
  const [taskType, setTaskType] = useState("Classification");
  const [targetCol, setTargetCol] = useState("target");

  // Report State
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState("Executive Summary");
  const [formatType, setFormatType] = useState("PDF");
  const [showReportConfig, setShowReportConfig] = useState(false);

  useEffect(() => {
    // Fetch insights from our FastAPI backend
    const fetchInsights = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/api/insights/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ db_type: "mock" })
        });
        const data = await response.json();
        setInsights(data);
      } catch (error) {
        console.error("Failed to fetch insights", error);
      } finally {
        setLoadingInsights(false);
      }
    };
    
    fetchInsights();
  }, []);

  const handleRunForecast = async () => {
    setLoadingForecast(true);
    try {
      const response = await fetch("/api/forecasting/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db_type: "mock",
          time_col: "date",
          target_col: "sales",
          periods: periods,
          algorithm: algo
        })
      });
      const data = await response.json();
      setForecastData(data);
    } catch (error) {
      console.error("Failed to run forecast", error);
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleRunAutoML = async () => {
    setLoadingAutoML(true);
    try {
      const response = await fetch("/api/automl/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db_type: "mock",
          task_type: taskType,
          target_col: targetCol
        })
      });
      const data = await response.json();
      setAutoMLData(data);
    } catch (error) {
      console.error("Failed to run AutoML", error);
    } finally {
      setLoadingAutoML(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const payload = {
        insights: insights,
        forecasts: forecastData,
        automl: autoMLData
      };
      
      const response = await fetch("/api/advanced-reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          data_payload: payload,
          report_type: reportType,
          format_type: formatType
        })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extensions: any = { "PDF": ".pdf", "DOCX": ".docx", "PPTX": ".pptx" };
      a.download = `Report_${reportType.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}${extensions[formatType]}`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      setShowReportConfig(false);
    } catch (error) {
      console.error("Failed to generate report", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loadingInsights) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[#f0f0f5]">
          <div className="w-12 h-12 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg tracking-wider animate-pulse">Generating Automated Insights...</p>
        </div>
      </div>
    );
  }

  // Mock chart data based on trends for visualization
  const trendOptions = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], axisLine: { lineStyle: { color: '#6b7280' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#ffffff14' } } },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330],
        type: 'line',
        smooth: true,
        lineStyle: { color: '#10b981', width: 3 },
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.4)' }, { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }]
          }
        }
      }
    ]
  };

  // Dynamic Chart for Forecast
  const getForecastChart = () => {
    if (!forecastData) return {};
    
    const xData = Array.from({length: forecastData.forecast.length}, (_, i) => `T+${i+1}`);
    
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: { data: ['Forecast', 'Lower Bound', 'Upper Bound'], textStyle: { color: '#9ea3b0' } },
      xAxis: { type: 'category', data: xData, axisLine: { lineStyle: { color: '#6b7280' } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#ffffff14' } } },
      series: [
        {
          name: 'Upper Bound',
          type: 'line',
          data: forecastData.upper_bound,
          lineStyle: { opacity: 0 },
          stack: 'confidence-band',
          symbol: 'none'
        },
        {
          name: 'Lower Bound',
          type: 'line',
          data: forecastData.lower_bound,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'rgba(99, 102, 241, 0.1)' },
          stack: 'confidence-band',
          symbol: 'none'
        },
        {
          name: 'Forecast',
          type: 'line',
          data: forecastData.forecast,
          smooth: true,
          lineStyle: { color: '#6366f1', width: 3, type: 'dashed' },
          itemStyle: { color: '#6366f1' },
          symbolSize: 6
        }
      ]
    };
  };

  return (
    <div 
      className="bg-[#0a0a0f] text-[#f0f0f5]" 
      style={{ 
        height: '100%', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '24px',
        boxSizing: 'border-box' 
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/?view=chat" className="text-[#9ea3b0] hover:text-[#f0f0f5]" style={{ display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}>
            <ArrowLeft size={18} /> Back to Aura Analyst
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
          <button 
            onClick={() => setShowReportConfig(!showReportConfig)} 
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
             <Download size={18} /> Configure & Export AI Report
          </button>
          
          {showReportConfig && (
            <div 
              className="absolute bg-[#1c1d29] border border-[#ffffff14] rounded-lg shadow-2xl z-50"
              style={{ top: '48px', right: 0, padding: '16px', width: '320px' }}
            >
              <h3 className="text-sm font-semibold text-[#f0f0f5]" style={{ marginBottom: '12px' }}>Generative AI Report Writer</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label className="block text-xs text-[#9ea3b0]" style={{ marginBottom: '4px' }}>Report Template</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-[#13141c] border border-[#ffffff14] rounded text-sm text-[#f0f0f5] outline-none"
                  style={{ padding: '8px' }}
                >
                  <option value="Executive Summary">Executive Summary</option>
                  <option value="Board Report">Board Report</option>
                  <option value="KPI Review">KPI Review</option>
                  <option value="Market Analysis">Market Analysis</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="block text-xs text-[#9ea3b0]" style={{ marginBottom: '4px' }}>Export Format</label>
                <select 
                  value={formatType} 
                  onChange={(e) => setFormatType(e.target.value)}
                  className="w-full bg-[#13141c] border border-[#ffffff14] rounded text-sm text-[#f0f0f5] outline-none"
                  style={{ padding: '8px' }}
                >
                  <option value="PDF">PDF Document</option>
                  <option value="DOCX">Microsoft Word (.docx)</option>
                  <option value="PPTX">PowerPoint (.pptx)</option>
                </select>
              </div>

              <button 
                onClick={handleGenerateReport} 
                disabled={generatingReport} 
                className="btn-primary w-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                 {generatingReport ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...</>
                  ) : (
                    <><Zap size={16} /> Generate & Download</>
                  )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexShrink: 0 }}>
        {[
          { id: "insights", label: "AI Insights & Trends", icon: <TrendingUp size={16} /> },
          { id: "forecasting", label: "Advanced Forecasting", icon: <Activity size={16} /> },
          { id: "automl", label: "AutoML Lab Engine", icon: <Cpu size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              backgroundColor: activeTab === tab.id ? '#6366f1' : '#1c1d29',
              color: activeTab === tab.id ? '#ffffff' : '#9ea3b0',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: activeTab === tab.id ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              transition: 'all 0.3s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Contents */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {activeTab === "insights" && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, overflow: 'hidden' }}>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', flexShrink: 0 }}>
              <div className="glass-panel animate-fade-in" style={{ padding: '16px', animationDelay: '0.1s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p className="text-xs text-[#9ea3b0] uppercase tracking-wider" style={{ marginBottom: '4px' }}>Detected Trend</p>
                    <h3 className="text-lg font-bold text-[#10b981]" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={20} /> {insights?.statistics?.trends?.recent_trend || "Increasing by 14%"}
                    </h3>
                    <p className="text-xs text-[#6b7280]" style={{ marginTop: '4px' }}>in {insights?.statistics?.trends?.target_metric || "Sales"} metric</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel animate-fade-in" style={{ padding: '16px', animationDelay: '0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p className="text-xs text-[#9ea3b0] uppercase tracking-wider" style={{ marginBottom: '4px' }}>Anomalies Detected</p>
                    <h3 className="text-lg font-bold text-[#f59e0b]" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={20} /> {insights?.statistics?.outliers?.count || 0} Outliers
                    </h3>
                    <p className="text-xs text-[#6b7280]" style={{ marginTop: '4px' }}>representing {insights?.statistics?.outliers?.percentage || 0}% of dataset</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel animate-fade-in" style={{ padding: '16px', animationDelay: '0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p className="text-xs text-[#9ea3b0] uppercase tracking-wider" style={{ marginBottom: '4px' }}>Strong Correlations</p>
                    <h3 className="text-lg font-bold text-[#6366f1]" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={20} /> {insights?.statistics?.correlations?.length || 0} Pairs
                    </h3>
                    <p className="text-xs text-[#6b7280]" style={{ marginTop: '4px' }}>Found high covariance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations & Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* AI Business Recommendations */}
              <div 
                className="glass-panel custom-scrollbar" 
                style={{ 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflowY: 'auto',
                  minHeight: 0
                }}
              >
                <h2 className="text-base font-semibold border-b border-[#ffffff14]" style={{ paddingBottom: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap className="text-[#f59e0b]" size={18} /> Business Recommendations
                </h2>
                <div style={{ flex: 1 }}>
                  {insights?.business_recommendations ? (
                    <div className="text-sm leading-relaxed whitespace-pre-line bg-[#13141c]" style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      {insights.business_recommendations}
                    </div>
                  ) : (
                    <p className="text-sm">No recommendations generated.</p>
                  )}
                </div>
              </div>

              {/* Data Visualization */}
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                <h2 className="text-base font-semibold border-b border-[#ffffff14]" style={{ paddingBottom: '10px', marginBottom: '12px' }}>Trend Visualization</h2>
                <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                  <ReactECharts option={trendOptions} style={{ height: '100%', width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "forecasting" && (
          <div className="glass-panel" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#ffffff14]" style={{ paddingBottom: '10px', marginBottom: '12px' }}>
              <Activity className="text-[#6366f1]" size={18} /> Advanced ML Forecasting
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Forecast Controls */}
              <div className="custom-scrollbar" style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '8px' }}>
                <div>
                  <label className="block text-xs text-[#9ea3b0]" style={{ marginBottom: '8px' }}>Algorithm</label>
                  <select 
                    value={algo} 
                    onChange={(e) => setAlgo(e.target.value)}
                    className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md text-[#f0f0f5] outline-none focus:border-[#6366f1] text-sm"
                    style={{ padding: '12px' }}
                  >
                    <option value="Prophet">Facebook Prophet</option>
                    <option value="ARIMA">ARIMA (Statsmodels)</option>
                    <option value="XGBoost">XGBoost Regression</option>
                    <option value="LSTM">LSTM (Deep Learning)</option>
                    <option value="Transformer">Transformers (Deep Learning)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-[#9ea3b0]" style={{ marginBottom: '8px' }}>Periods to Forecast</label>
                  <input 
                    type="number" 
                    value={periods}
                    onChange={(e) => setPeriods(Number(e.target.value))}
                    className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md text-[#f0f0f5] outline-none focus:border-[#6366f1] text-sm"
                    style={{ padding: '12px' }}
                  />
                </div>

                <button 
                  onClick={handleRunForecast}
                  disabled={loadingForecast}
                  className="btn-primary w-full"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                >
                  {loadingForecast ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...</>
                  ) : (
                    <><TrendingUp size={16} /> Run Forecast</>
                  )}
                </button>

                {forecastData && (
                  <div className="bg-[#13141c] rounded-lg border border-[#ffffff14]" style={{ marginTop: '16px', padding: '16px' }}>
                    <h4 className="text-xs font-semibold text-[#10b981] uppercase tracking-wider" style={{ marginBottom: '8px' }}>AI Trend Analysis</h4>
                    <p className="text-xs text-[#9ea3b0] leading-relaxed">
                      {forecastData.trend_explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Forecast Chart */}
              <div 
                className="bg-[#13141c] rounded-xl border border-[#ffffff14]" 
                style={{ 
                  width: '70%', 
                  padding: '16px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  minHeight: 0,
                  height: '100%',
                  overflow: 'hidden'
                }}
              >
                <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                  {forecastData ? (
                    <ReactECharts option={getForecastChart()} style={{ height: '100%', width: '100%' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                      Configure and run a forecast to see the projection.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "automl" && (
          <div className="glass-panel" style={{ height: '100%', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <h2 className="text-base font-bold flex items-center gap-2 border-b border-[#ffffff14]" style={{ paddingBottom: '10px', marginBottom: '12px' }}>
              <Cpu className="text-[#10b981]" size={18} /> AutoML Engine
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* AutoML Controls */}
              <div className="custom-scrollbar" style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '8px' }}>
                <div>
                  <label className="block text-xs text-[#9ea3b0]" style={{ marginBottom: '8px' }}>Machine Learning Task</label>
                  <select 
                    value={taskType} 
                    onChange={(e) => setTaskType(e.target.value)}
                    className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md text-[#f0f0f5] outline-none focus:border-[#10b981] text-sm"
                    style={{ padding: '12px' }}
                  >
                    <option value="Classification">Classification</option>
                    <option value="Regression">Regression</option>
                    <option value="Clustering">Clustering</option>
                  </select>
                </div>
                
                {taskType !== "Clustering" && (
                  <div>
                    <label className="block text-xs text-[#9ea3b0]" style={{ marginBottom: '8px' }}>Target Column</label>
                    <input 
                      type="text" 
                      value={targetCol}
                      onChange={(e) => setTargetCol(e.target.value)}
                      className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md text-[#f0f0f5] outline-none focus:border-[#10b981] text-sm"
                      style={{ padding: '12px' }}
                    />
                  </div>
                )}

                <button 
                  onClick={handleRunAutoML}
                  disabled={loadingAutoML}
                  className="btn-primary w-full"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(to right, #10b981, #059669)', marginTop: '8px' }}
                >
                  {loadingAutoML ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Training Models...</>
                  ) : (
                    <><Cpu size={16} /> Start AutoML</>
                  )}
                </button>
              </div>

              {/* AutoML Results */}
              <div className="custom-scrollbar" style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '8px', minHeight: 0, height: '100%' }}>
                {autoMLData ? (
                  <>
                    <div className="bg-[#13141c] rounded-xl border border-[#ffffff14]" style={{ padding: '16px' }}>
                      <h3 className="text-md font-semibold" style={{ marginBottom: '8px' }}>Best Model: <span className="text-[#10b981]">{autoMLData.best_model}</span></h3>
                      
                      {/* Model Leaderboard */}
                      <h4 className="text-xs font-semibold text-[#9ea3b0] uppercase tracking-wider" style={{ marginBottom: '8px', marginTop: '16px' }}>Leaderboard</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="text-xs text-[#9ea3b0] uppercase bg-[#1c1d29]">
                            <tr>
                              {Object.keys(autoMLData.leaderboard[0] || {}).slice(0, 5).map((key) => (
                                <th key={key} style={{ padding: '8px 16px' }}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {autoMLData.leaderboard.map((row: any, i: number) => (
                              <tr key={i} className="border-b border-[#ffffff14] hover:bg-[#1c1d29]">
                                {Object.keys(row).slice(0, 5).map((key) => (
                                  <td key={key} style={{ padding: '8px 16px' }}>{typeof row[key] === 'number' ? row[key].toFixed(4) : row[key]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Explainability Report */}
                    <div className="bg-[#13141c] rounded-xl border border-[#ffffff14]" style={{ padding: '16px' }}>
                      <h4 className="text-xs font-semibold text-[#6366f1] uppercase tracking-wider" style={{ marginBottom: '8px' }}>Explainability Report</h4>
                      <p className="text-xs text-[#9ea3b0] leading-relaxed whitespace-pre-line">
                        {autoMLData.explainability_report}
                      </p>
                      
                      {/* Feature Importances (if present) */}
                      {autoMLData.feature_importances && autoMLData.feature_importances.length > 0 && (
                         <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                           {autoMLData.feature_importances.map((f: any, i: number) => (
                             <span key={i} className="text-xs bg-[#1c1d29] border border-[#ffffff14] rounded" style={{ padding: '4px 8px' }}>
                               {f.feature} <span className="text-[#10b981] ml-1">({f.importance.toFixed(3)})</span>
                             </span>
                           ))}
                         </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-[#13141c] rounded-xl border border-[#ffffff14] flex flex-col items-center justify-center text-center" style={{ height: '100%', padding: '24px' }}>
                     <Cpu className="text-[#6b7280] opacity-50" size={28} style={{ marginBottom: '8px' }} />
                     <p className="text-xs text-[#6b7280]">Select a task type and target column, then start AutoML. The engine will automatically engineer features, tune hyperparameters, and evaluate models.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InsightsDashboard() {
  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center bg-[#0a0a0f] text-[#f0f0f5]">
        <div className="text-sm text-[#9ea3b0]">Loading Dashboard...</div>
      </div>
    }>
      <InsightsDashboardContent />
    </Suspense>
  );
}

