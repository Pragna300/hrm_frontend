import React, { useState, useEffect } from 'react';
import { createCheckoutSession } from '../../api/stripeApi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import PlanCard from '../../components/PlanCard';
import PageHeader from '../../components/ui/PageHeader';

export default function Subscription() {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    api.get('/public/plans')
      .then((res) => setPlans(res.data || []))
      .catch(() => setPlans([]));
  }, []);

  const handleSelect = async (priceId) => {
    setLoadingId(priceId);
    try {
      const { url } = await createCheckoutSession({ priceId });
      // Redirect to Stripe Checkout (test mode)
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error', err);
      alert('Failed to start checkout. See console for details.');
    } finally {
      setLoadingId(null);
    }
  };

  const [searchParams] = useSearchParams();

  // Auto-select or trigger checkout if priceId provided in URL
  useEffect(() => {
    const pid = searchParams.get('priceId');
    if (pid && plans.length) {
      setSelectedPlanId(Number(pid));
    }
  }, [searchParams, plans]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="max-w-7xl mx-auto py-2">
      <PageHeader
        title="Choose a Subscription Plan"
        subtitle="Select the plan that fits your organization's scale. You can upgrade, downgrade, or cancel at any time."
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selectedPlanId === plan.id}
            onSelect={() => setSelectedPlanId(plan.id)}
            disabled={loadingId !== null}
          />
        ))}
      </div>

      {selectedPlan && (
        <div className="mt-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl mx-auto text-center flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">You have selected</span>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{selectedPlan.name} Plan</h3>
          </div>
          
          <button
            onClick={() => handleSelect(selectedPlan.id)}
            disabled={loadingId !== null}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loadingId ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Processing Payment...
              </>
            ) : (
              <>
                Confirm & Pay with Stripe
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
          
          <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold mt-1">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure checkout
            </span>
            <span className="text-slate-200">•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      )}
    </div>
  );
}
