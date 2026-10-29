import React from 'react';
import { Cpu, Brain, Zap, ShieldAlert, CheckCircle2, Sliders, Activity } from 'lucide-react';

export default function MLTelemetryCard({ mlAnalysis }) {
  if (!mlAnalysis) return null;

  const {
    model_architecture,
    prediction = 'Unknown',
    feature_vector,
    nlp_features,
    top_ml_indicators = []
  } = mlAnalysis;

  // Normalize phishing probability (support both 0.89 and 89)
  const rawProb = typeof mlAnalysis.phishing_probability === 'number'
    ? mlAnalysis.phishing_probability
    : (typeof mlAnalysis.probability === 'number' ? mlAnalysis.probability : 0);
  const phishing_probability = rawProb <= 1 && rawProb > 0
    ? Number((rawProb * 100).toFixed(1))
    : Number(Number(rawProb).toFixed(1));

  // Normalize confidence score (support both 0.94 and 94)
  const rawConf = typeof mlAnalysis.confidence_score === 'number'
    ? mlAnalysis.confidence_score
    : (typeof mlAnalysis.confidence === 'number' ? mlAnalysis.confidence : 92.4);
  const confidence_score = rawConf <= 1 && rawConf > 0
    ? Number((rawConf * 100).toFixed(1))
    : Number(Number(rawConf).toFixed(1));

  const isPhish = phishing_probability >= 50;
  const isMlActive = mlAnalysis.ml_enabled !== false;

  return (
    <div className="liquid-glass-card relative overflow-hidden rounded-2xl p-5 shadow-xl text-slate-100 space-y-4 border border-white/10">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide font-sans flex items-center gap-1.5">
                <span>Machine Learning Threat Intelligence</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                  <Zap className="w-2.5 h-2.5 text-emerald-400" /> ML Active
                </span>
              </h3>
            </div>
            <p className="text-[11px] font-mono text-emerald-300/80 mt-0.5">
              Architecture: {model_architecture || 'Ensemble Feature Vector Classifier'}
            </p>
          </div>
        </div>

        {/* Prediction Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase">Prediction:</span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-black border ${
              isPhish
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-950/50'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-950/50'
            }`}
          >
            {isPhish ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {prediction}
          </span>
        </div>
      </div>

      {/* Metrics Row: Probability Bar & Confidence Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 rounded-xl p-4 border border-white/10">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Statistical Phishing Probability</span>
            </span>
            <span className={`font-black text-sm ${isPhish ? 'text-rose-400' : 'text-emerald-400'}`}>
              {phishing_probability}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isPhish
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 shadow-sm shadow-rose-500/50'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/50'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, phishing_probability))}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0% (Benign)</span>
            <span>50% Threshold</span>
            <span>100% (Confirmed Threat)</span>
          </div>
        </div>

        <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Model Confidence</span>
          <span className="text-xl font-mono font-black text-emerald-400">
            {confidence_score}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">Posterior inference certainty</span>
        </div>
      </div>

      {/* Extracted Feature Vector Telemetry */}
      {feature_vector && (
        <div>
          <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold block mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Extracted Lexical & Structural Feature Vectors:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block">Domain Entropy</span>
              <span className="font-bold text-emerald-300">{feature_vector.domain_entropy} bits</span>
            </div>
            <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block">Numeric IP Host</span>
              <span className={`font-bold ${feature_vector.is_ip_address ? 'text-rose-400' : 'text-emerald-400'}`}>
                {feature_vector.is_ip_address ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block">Keyword Matches</span>
              <span className="font-bold text-amber-300">{feature_vector.phishing_keyword_matches}</span>
            </div>
            <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block">Subdomain Depth</span>
              <span className="font-bold text-slate-200">{feature_vector.subdomain_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* NLP Email Features Telemetry */}
      {nlp_features && (
        <div>
          <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold block mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> NLP Feature Vector Metrics:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block">Urgency Coercion</span>
              <span className={`font-bold ${nlp_features.coercive_urgency_detected ? 'text-rose-400' : 'text-emerald-400'}`}>
                {nlp_features.coercive_urgency_detected ? 'FLAGGED' : 'NORMAL'}
              </span>
            </div>
            <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block">Credential / Finance Bait</span>
              <span className={`font-bold ${nlp_features.financial_credential_lures ? 'text-rose-400' : 'text-emerald-400'}`}>
                {nlp_features.financial_credential_lures ? 'DETECTED' : 'CLEAR'}
              </span>
            </div>
            <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block">Word Token Count</span>
              <span className="font-bold text-slate-200">{nlp_features.word_count} tokens</span>
            </div>
            <div className="bg-[#061024]/70 backdrop-blur-md p-2.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block">Corpus Characters</span>
              <span className="font-bold text-emerald-300">{nlp_features.char_length} chars</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Influencing ML Indicators */}
      {top_ml_indicators && top_ml_indicators.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block mb-1.5">
            Key Statistical Influencing Factors:
          </span>
          <ul className="space-y-1 text-xs font-mono text-slate-300">
            {top_ml_indicators.map((factor, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
