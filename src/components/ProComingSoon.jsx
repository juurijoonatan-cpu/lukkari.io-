import { useCallback } from 'react';
import { ProInfoHero } from './pro/info/ProInfoHero';
import { ProInfoStats } from './pro/info/ProInfoStats';
import { ProInfoFlow } from './pro/info/ProInfoFlow';
import { ProInfoFeatures } from './pro/info/ProInfoFeatures';
import { ProInfoSignup } from './pro/info/ProInfoSignup';
import { enableDemo } from '../utils/demo';
import './pro/info/proInfo.css';

export function ProComingSoon() {
  const tryDemo = useCallback(() => {
    if (!enableDemo()) {
      // Demo disabled in production builds — direct users to the subscribe flow.
      window.location.hash = '/pro';
      return;
    }
    window.location.hash = '/pro-app';
  }, []);

  return (
    <div className="pi pro-pad" style={{ maxWidth: 760, margin: "0 auto", padding: "56px 20px 80px", position: "relative" }}>
      <ProInfoHero onTryDemo={tryDemo} />
      <ProInfoStats />
      <ProInfoFlow />
      <ProInfoFeatures />
      <ProInfoSignup />
    </div>
  );
}
