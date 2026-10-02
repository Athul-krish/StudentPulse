import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';

export const BannerAlert = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>DEMO / PROTOTYPE DATA ACTIVE:</strong> StudentPulse is operating on synthetic academic evaluation dataset (<code>studentpulse_demo_dataset.csv</code>). Risk scores are decision-support indicators and do not guarantee student outcomes.
        </span>
      </div>
    </div>
  );
};
