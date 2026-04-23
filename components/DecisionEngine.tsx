'use client';

import React from 'react';

// Modular Logic for future improvements
export type DecisionInput = {
  volatilityScore: number;
  sentimentScore: number;
  priceTrend: 'up' | 'down' | 'flat';
};

export type DecisionOutput = {
  action: 'Buy' | 'Hold' | 'Avoid';
  confidence: number;
  explanation: string;
};

export function evaluateDecision(input: DecisionInput): DecisionOutput {
  const { volatilityScore, sentimentScore, priceTrend } = input;

  let action: 'Buy' | 'Hold' | 'Avoid' = 'Hold';
  let confidence = 50;
  let explanation = 'Wait and observe the market.';

  // High sentiment + low volatility = Buy
  if (sentimentScore >= 70 && volatilityScore <= 40) {
    action = 'Buy';
    confidence = Math.min((sentimentScore + (100 - volatilityScore)) / 2 + (priceTrend === 'up' ? 5 : 0), 99);
    explanation = 'Strong positive sentiment with low risk indicates a clear buying opportunity.';
  } 
  // Low sentiment + high volatility = Avoid
  else if (sentimentScore <= 40 && volatilityScore >= 60) {
    action = 'Avoid';
    confidence = Math.min(((100 - sentimentScore) + volatilityScore) / 2 + (priceTrend === 'down' ? 5 : 0), 99);
    explanation = 'Negative sentiment coupled with high volatility suggests it is best to avoid.';
  } 
  // Else = Hold
  else {
    action = 'Hold';
    confidence = 50 + (100 - Math.abs(sentimentScore - 50)); 
    explanation = 'Conditions are mixed or neutral. Holding is the safest approach.';
  }

  return { action, confidence: Math.round(confidence), explanation };
}

type Props = {
  volatilityScore: number;
  sentimentScore: number;
  priceTrend: 'up' | 'down' | 'flat';
};

export default function DecisionEngine({ volatilityScore, sentimentScore, priceTrend }: Props) {
  const decision = evaluateDecision({ volatilityScore, sentimentScore, priceTrend });

  const colorMap = {
    Buy: 'text-emerald-500',
    Hold: 'text-yellow-500',
    Avoid: 'text-rose-500',
  };

  const borderMap = {
    Buy: 'border-emerald-500/20 bg-emerald-500/5',
    Hold: 'border-yellow-500/20 bg-yellow-500/5',
    Avoid: 'border-rose-500/20 bg-rose-500/5',
  };

  return (
    <div className={`p-8 rounded-2xl border ${borderMap[decision.action]} flex flex-col items-center text-center`}>
      <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">AI Decision Engine</h3>
      
      <div className={`text-6xl font-bold tracking-tight mb-4 ${colorMap[decision.action]}`}>
        {decision.action}
      </div>
      
      <div className="text-lg font-medium text-zinc-300 mb-2">
        Confidence: <span className="font-mono">{decision.confidence}%</span>
      </div>
      
      <p className="text-zinc-400 max-w-sm text-sm leading-relaxed">
        {decision.explanation}
      </p>
    </div>
  );
}
