
import React from 'react';
import { AIInsight } from '../types';

interface InsightsViewProps {
  insights: AIInsight | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const InsightsView: React.FC<InsightsViewProps> = ({ insights, onAnalyze, isAnalyzing }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">AI Attendance Intelligence</h3>
          <p className="text-sm text-slate-500">Detecting trends and predictive absenteeism risks</p>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-lg transition-all ${
            isAnalyzing ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : 'Generate AI Insights'}
        </button>
      </div>

      {!insights ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
          <div className="mx-auto w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <p className="text-slate-500 font-medium">Click the button to run AI predictive analysis on recent attendance data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Report Summary</h4>
              <p className="text-slate-700 leading-relaxed text-sm">{insights.summary}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3">Growth & Trends</h4>
              <p className="text-slate-700 leading-relaxed text-sm">{insights.trends}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
            <h4 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-4">Students At Risk</h4>
            <div className="space-y-4">
              {insights.riskStudents.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No students currently flagged as high-risk.</p>
              ) : (
                insights.riskStudents.map((risk, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-rose-50 rounded-lg border border-rose-100">
                    <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                      risk.riskLevel === 'High' ? 'bg-rose-500 animate-pulse' : 
                      risk.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-slate-500'
                    }`} />
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{risk.studentName}</h5>
                      <p className="text-xs text-slate-600 mt-1">{risk.reason}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        risk.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : 
                        risk.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {risk.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsView;
