import React from 'react';
import { formatInr } from '../lib/formatMoney';

export default function PlanCard({ plan, onSelect, selected, disabled }) {
  const price = plan.monthlyPrice !== undefined ? formatInr(Number(plan.monthlyPrice)) : '₹0';
  
  // Clean flat configurations (solid border/badge colors)
  const configs = {
    free: {
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      badge: null,
    },
    starter: {
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badge: null,
    },
    pro: {
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: 'Popular',
    },
    enterprise: {
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'Enterprise',
    }
  };

  const config = configs[plan.slug] || configs.free;

  return (
    <div
      onClick={disabled ? undefined : onSelect}
      className={`relative bg-white border rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm h-full
        ${selected 
          ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/10' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
        }
        ${disabled ? 'opacity-65 cursor-not-allowed' : ''}`}
    >
      {/* Plan Badge */}
      {config.badge && (
        <div className="absolute top-4 right-4">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${config.badgeBg}`}>
            {config.badge}
          </span>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-slate-800">
          {plan.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[32px]">
          {plan.description}
        </p>

        {/* Pricing */}
        <div className="flex items-baseline gap-1 my-4">
          <span className="text-2xl font-extrabold text-slate-900">{price}</span>
          <span className="text-xs font-semibold text-slate-400">/ month</span>
        </div>

        {/* Features List */}
        <div className="border-t border-slate-100 pt-4 mt-3">
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Up to <strong className="text-slate-800">{plan.seatLimit.toLocaleString()}</strong> seats
            </li>
            {plan.features && plan.features.split(',').map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                {feature.trim()}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Select button inside Card */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          className={`w-full py-2 px-4 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 flex items-center justify-center gap-1.5
            ${selected
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
            }`}
        >
          {selected ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              Selected
            </>
          ) : (
            'Select Plan'
          )}
        </button>
      </div>
    </div>
  );
}
