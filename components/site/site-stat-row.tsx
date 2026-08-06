import { PRACTICE_FACTS } from '@/lib/site-content';

/**
 * Figures CureRays publishes about the practice. Presented as marketing facts,
 * deliberately not as clinical status pills — those carry a different meaning.
 */
export function SiteStatRow() {
  return (
    <dl className="site-stat-row">
      {PRACTICE_FACTS.map((fact) => (
        <div key={fact.label} className="site-stat">
          <dt className="site-stat-value">{fact.value}</dt>
          <dd>
            <span className="site-stat-label">{fact.label}</span>
            <span className="site-stat-detail">{fact.detail}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
