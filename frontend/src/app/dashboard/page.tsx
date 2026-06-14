"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, AlertTriangle, Activity, Zap, Cpu, Download } from "lucide-react";

export default function InsightsDashboard() {
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
      a.download = `AntiGravity_${reportType.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}${extensions[formatType]}`;
      
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
    <div className="bg-[#0a0a0f] text-[#f0f0f5] p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#9ea3b0] hover:text-[#f0f0f5] flex items-center gap-2 transition-colors">
            <ArrowLeft size={18} /> Back to AI Analyst
          </Link>
        </div>
        <div className="flex gap-3 relative">
          <button 
            onClick={() => setShowReportConfig(!showReportConfig)} 
            className="btn-primary flex items-center gap-2"
          >
             <Download size={18} /> Configure & Export AI Report
          </button>
          
          {showReportConfig && (
            <div className="absolute top-12 right-0 bg-[#1c1d29] border border-[#ffffff14] rounded-lg p-4 w-80 shadow-2xl z-50">
              <h3 className="text-sm font-semibold mb-3 text-[#f0f0f5]">Generative AI Report Writer</h3>
              
              <div className="mb-3">
                <label className="block text-xs text-[#9ea3b0] mb-1">Report Template</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-[#13141c] border border-[#ffffff14] rounded p-2 text-sm text-[#f0f0f5] outline-none"
                >
                  <option value="Executive Summary">Executive Summary</option>
                  <option value="Board Report">Board Report</option>
                  <option value="KPI Review">KPI Review</option>
                  <option value="Market Analysis">Market Analysis</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-[#9ea3b0] mb-1">Export Format</label>
                <select 
                  value={formatType} 
                  onChange={(e) => setFormatType(e.target.value)}
                  className="w-full bg-[#13141c] border border-[#ffffff14] rounded p-2 text-sm text-[#f0f0f5] outline-none"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="DOCX">Microsoft Word (.docx)</option>
                  <option value="PPTX">PowerPoint (.pptx)</option>
                </select>
              </div>

              <button 
                onClick={handleGenerateReport} 
                disabled={generatingReport} 
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
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
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* KPI Cards */}
        <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#9ea3b0] uppercase tracking-wider mb-1">Detected Trend</p>
              <h3 className="text-2xl font-bold text-[#10b981] flex items-center gap-2">
                <TrendingUp size={24} /> {insights?.statistics?.trends?.recent_trend || "Increasing by 14%"}
              </h3>
              <p className="text-sm mt-2 text-[#6b7280]">in {insights?.statistics?.trends?.target_metric || "Sales"} metric</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#9ea3b0] uppercase tracking-wider mb-1">Anomalies Detected</p>
              <h3 className="text-2xl font-bold text-[#f59e0b] flex items-center gap-2">
                <AlertTriangle size={24} /> {insights?.statistics?.outliers?.count || 0} Outliers
              </h3>
              <p className="text-sm mt-2 text-[#6b7280]">representing {insights?.statistics?.outliers?.percentage || 0}% of dataset</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#9ea3b0] uppercase tracking-wider mb-1">Strong Correlations</p>
              <h3 className="text-2xl font-bold text-[#6366f1] flex items-center gap-2">
                <Activity size={24} /> {insights?.statistics?.correlations?.length || 0} Pairs
              </h3>
              <p className="text-sm mt-2 text-[#6b7280]">Found high covariance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Business Recommendations */}
        <div className="lg:col-span-1 glass-panel p-6 flex flex-col animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-semibold mb-4 border-b border-[#ffffff14] pb-3 flex items-center gap-2">
            <Zap className="text-[#f59e0b]" size={20} /> Business Recommendations
          </h2>
          <div className="prose prose-invert prose-p:text-[#9ea3b0] prose-li:text-[#f0f0f5] flex-1">
            {insights?.business_recommendations ? (
              <div className="text-sm leading-relaxed whitespace-pre-line bg-[#13141c] p-4 rounded-lg border border-[#ffffff14]">
                {insights.business_recommendations}
              </div>
            ) : (
              <p>No recommendations generated.</p>
            )}
          </div>
        </div>

        {/* Data Visualization */}
        <div className="lg:col-span-2 glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-semibold mb-4 border-b border-[#ffffff14] pb-3">Trend Visualization</h2>
          <div className="h-[400px] w-full">
            <ReactECharts option={trendOptions} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Advanced Forecasting Module */}
      <div className="mt-8 glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-[#ffffff14] pb-4">
          <Activity className="text-[#6366f1]" /> Advanced ML Forecasting
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Forecast Controls */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div>
              <label className="block text-sm text-[#9ea3b0] mb-2">Algorithm</label>
              <select 
                value={algo} 
                onChange={(e) => setAlgo(e.target.value)}
                className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-[#f0f0f5] outline-none focus:border-[#6366f1]"
              >
                <option value="Prophet">Facebook Prophet</option>
                <option value="ARIMA">ARIMA (Statsmodels)</option>
                <option value="XGBoost">XGBoost Regression</option>
                <option value="LSTM">LSTM (Deep Learning)</option>
                <option value="Transformer">Transformers (Deep Learning)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-[#9ea3b0] mb-2">Periods to Forecast</label>
              <input 
                type="number" 
                value={periods}
                onChange={(e) => setPeriods(Number(e.target.value))}
                className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-[#f0f0f5] outline-none focus:border-[#6366f1]"
              />
            </div>

            <button 
              onClick={handleRunForecast}
              disabled={loadingForecast}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingForecast ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...</>
              ) : (
                <><TrendingUp size={18} /> Run Forecast</>
              )}
            </button>

            {forecastData && (
              <div className="mt-6 bg-[#13141c] p-4 rounded-lg border border-[#ffffff14]">
                <h4 className="text-sm font-semibold text-[#10b981] mb-2 uppercase tracking-wider">AI Trend Analysis</h4>
                <p className="text-sm text-[#9ea3b0] leading-relaxed">
                  {forecastData.trend_explanation}
                </p>
              </div>
            )}
          </div>

          {/* Forecast Chart */}
          <div className="w-full lg:w-2/3 h-[400px] bg-[#13141c] rounded-xl border border-[#ffffff14] p-4 flex items-center justify-center">
            {forecastData ? (
              <ReactECharts option={getForecastChart()} style={{ height: '100%', width: '100%' }} />
            ) : (
              <p className="text-[#6b7280]">Configure and run a forecast to see the projection.</p>
            )}
          </div>
        </div>
      </div>

      {/* AutoML Lab */}
      <div className="mt-8 glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-[#ffffff14] pb-4">
          <Cpu className="text-[#10b981]" /> AutoML Engine
        </h2>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* AutoML Controls */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div>
              <label className="block text-sm text-[#9ea3b0] mb-2">Machine Learning Task</label>
              <select 
                value={taskType} 
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-[#f0f0f5] outline-none focus:border-[#10b981]"
              >
                <option value="Classification">Classification</option>
                <option value="Regression">Regression</option>
                <option value="Clustering">Clustering</option>
              </select>
            </div>
            
            {taskType !== "Clustering" && (
              <div>
                <label className="block text-sm text-[#9ea3b0] mb-2">Target Column</label>
                <input 
                  type="text" 
                  value={targetCol}
                  onChange={(e) => setTargetCol(e.target.value)}
                  className="w-full bg-[#13141c] border border-[#ffffff14] rounded-md p-3 text-[#f0f0f5] outline-none focus:border-[#10b981]"
                />
              </div>
            )}

            <button 
              onClick={handleRunAutoML}
              disabled={loadingAutoML}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
            >
              {loadingAutoML ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Training Models...</>
              ) : (
                <><Cpu size={18} /> Start AutoML</>
              )}
            </button>
          </div>

          {/* AutoML Results */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {autoMLData ? (
              <>
                <div className="bg-[#13141c] p-4 rounded-xl border border-[#ffffff14]">
                  <h3 className="text-lg font-semibold mb-2">Best Model: <span className="text-[#10b981]">{autoMLData.best_model}</span></h3>
                  
                  {/* Model Leaderboard */}
                  <h4 className="text-sm font-semibold text-[#9ea3b0] mb-2 uppercase tracking-wider mt-4">Leaderboard</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-[#9ea3b0] uppercase bg-[#1c1d29]">
                        <tr>
                          {Object.keys(autoMLData.leaderboard[0] || {}).slice(0, 5).map((key) => (
                            <th key={key} className="px-4 py-2">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {autoMLData.leaderboard.map((row: any, i: number) => (
                          <tr key={i} className="border-b border-[#ffffff14] hover:bg-[#1c1d29]">
                            {Object.keys(row).slice(0, 5).map((key) => (
                              <td key={key} className="px-4 py-2">{typeof row[key] === 'number' ? row[key].toFixed(4) : row[key]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Explainability Report */}
                <div className="bg-[#13141c] p-4 rounded-xl border border-[#ffffff14]">
                  <h4 className="text-sm font-semibold text-[#6366f1] mb-2 uppercase tracking-wider">Explainability Report</h4>
                  <p className="text-sm text-[#9ea3b0] leading-relaxed whitespace-pre-line">
                    {autoMLData.explainability_report}
                  </p>
                  
                  {/* Feature Importances (if present) */}
                  {autoMLData.feature_importances && autoMLData.feature_importances.length > 0 && (
                     <div className="mt-4 flex flex-wrap gap-2">
                       {autoMLData.feature_importances.map((f: any, i: number) => (
                         <span key={i} className="text-xs bg-[#1c1d29] border border-[#ffffff14] px-2 py-1 rounded">
                           {f.feature} <span className="text-[#10b981] ml-1">({f.importance.toFixed(3)})</span>
                         </span>
                       ))}
                     </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full bg-[#13141c] rounded-xl border border-[#ffffff14] p-4 flex flex-col items-center justify-center text-center">
                 <Cpu className="text-[#6b7280] mb-2 opacity-50" size={32} />
                 <p className="text-[#6b7280]">Select a task type and target column, then start AutoML. The engine will automatically engineer features, tune hyperparameters, and evaluate models.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
