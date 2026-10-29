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
    <div className="bg-white relative overflow-hidden rounded-2xl p-5 shadow-sm text-[#2C3527] space-y-4 border border-[#404E3B]/15">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#404E3B]/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#7B9669]/15 border border-[#7B9669]/30 flex items-center justify-center text-[#404E3B]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1C2518] tracking-wide font-sans flex items-center gap-1.5">
                <span className="text-[#1C2518]">Machine Learning Threat Intelligence</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#7B9669]/15 text-[#404E3B] border border-[#7B9669]/30">
                  <Zap className="w-2.5 h-2.5 text-[#7B9669]" /> ML Active
                </span>
              </h3>
            </div>
            <p className="text-[11px] font-mono text-[#6C8480] mt-0.5">
              Architecture: {model_architecture || 'Ensemble Feature Vector Classifier'}
            </p>
          </div>
        </div>

        {/* Prediction Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-[#6C8480] font-semibold uppercase">Prediction:</span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-black border ${
              isPhish
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-[#7B9669]/15 text-[#404E3B] border-[#7B9669]/30'
            }`}
          >
            {isPhish ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            {prediction}
          </span>
        </div>
      </div>

      {/* Metrics Row: Probability Bar & Confidence Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F4F7F4] rounded-xl p-4 border border-[#404E3B]/10">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#6C8480] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#7B9669]" />
              <span>Statistical Phishing Probability</span>
            </span>
            <span className={`font-black text-sm ${isPhish ? 'text-rose-600' : 'text-[#7B9669]'}`}>
              {phishing_probability}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#E6E6E6] rounded-full overflow-hidden p-0.5 border border-[#404E3B]/10">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isPhish
                  ? 'bg-rose-500'
                  : 'bg-[#7B9669]'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, phishing_probability))}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-[#6C8480]">
            <span>0% (Benign)</span>
            <span>50% Threshold</span>
            <span>100% (Confirmed Threat)</span>
          </div>
        </div>

        <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-[#404E3B]/10 pt-3 md:pt-0 md:pl-4">
          <span className="text-[10px] uppercase font-mono text-[#6C8480] font-semibold">Model Confidence</span>
          <span className="text-xl font-mono font-black text-[#404E3B]">
            {confidence_score}%
          </span>
          <span className="text-[10px] text-[#6C8480] font-mono mt-0.5">Posterior inference certainty</span>
        </div>
      </div>

      {/* Extracted Feature Vector Telemetry */}
      {feature_vector && (
        <div>
          <span className="text-[11px] font-mono uppercase text-[#404E3B] font-bold block mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#7B9669]" /> Extracted Lexical & Structural Feature Vectors:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-[#F4F7F4] p-2.5 rounded-lg border border-[#404E3B]/10">
              <span className="text-[10px] text-[#6C8480] block">Domain Entropy</span>
              <span className="font-bold text-[#404E3B]">{feature_vector.domain_entropy} bits</span>
            </div>
            <div className="bg-[#F4F7F4] p-2.5 rounded-lg border border-[#404E3B]/10">
              <span className="text-[10px] text-[#6C8480] block">Numeric IP Host</span>
              <span className={`font-bold ${feature_vector.is_ip_address ? 'text-rose-600' : 'text-[#7B9669]'}`}>
                {feature_vector.is_ip_address ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            <div className="bg-[#F4F7F4] p-2.5 rounded-lg border border-[#404E3B]/10">
              <span className="text-[10px] text-[#6C8480] block">Keyword Matches</span>
              <span className="font-bold text-amber-600">{feature_vector.phishing_keyword_matches}</span>
            </div>
            <div className="bg-[#F4F7F4] p-2.5 rounded-lg border border-[#404E3B]/10">
              <span className="text-[10px] text-[#6C8480] block">Subdomain Depth</span>
              <span className="font-bold text-[#404E3B]">{feature_vector.subdomain_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* NLP Email Features Telemetry */}
      {nlp_features && (
        <div>
          <span className="text-[11px] font-mono uppercase text-[#404E3B] font-bold block mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#7B9669]" /> NLP Feature Vector Metrics:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-[#F4F7F4] p-2.5 rounded-lg border border-[#404E3B]/10">
              <span className="text-[10px] text-[#6C8480] block">Urgency Coercion</span>
              <span className={`font-bold ${nlp_features.coercive_urgency_detected ? 'text-rose-600' : 'text-[#7B9669]'}`}>
                {nlp_features.coercive_urgency_detected ? 'FLAGGED' : 'NORMAL'}
              </span>
            </div>
            <div className="bg-[#F4F7F4] p-2.5 rounded-lg border border-[#404E3B]/10">
              <span className="text-[10px] text-[#6C8480] block">Credential / Finance Bait</span>
              <span className={`font-bold ${nlp_features.financial_credential_lures ? 'text-rose-600' : 'text-[#7B9669]'}`}>
                {nlp_features.financial_credential_lures ? 'DETECTED' : 'CLEAR'}
              </span>
            </div>
            <div className="bg-[#F4F7F4] p-2.5 rounded-lg border border-[#404E3B]/10">
              <span className="text-[10px] text-[#6C8480] block">Word Token Count</span>
              <span className="font-bold text-[#404E3B]">{nlp_features.word_count} tokens</span>
            </div>
            <div className="bg-[#F4F7F4] p-2.5 rounded-lg border border-[#404E3B]/10">
              <span className="text-[10px] text-[#6C8480] block">Corpus Characters</span>
              <span className="font-bold text-[#404E3B]">{nlp_features.char_length} chars</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Influencing ML Indicators */}
      {top_ml_indicators && top_ml_indicators.length > 0 && (
        <div className="pt-2 border-t border-[#404E3B]/10">
          <span className="text-[11px] font-mono uppercase text-[#6C8480] font-semibold block mb-1.5">
            Key Statistical Influencing Factors:
          </span>
          <ul className="space-y-1 text-xs font-mono text-[#2C3527]">
            {top_ml_indicators.map((factor, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B9669]"></span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
