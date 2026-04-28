import './aiOrb.css';

export function AIOrb({ headline, footText, onOpen }) {
  return (
    <button type="button" className="pb-lg pb-w-ai" onClick={onOpen} aria-label="Avaa mentor">
      <div className="pb-w-ai-label">Mentor · AI</div>
      <div className="pb-w-ai-title">
        {headline.before}<em>{headline.em}</em>{headline.after}
      </div>
      <div className="pb-orb-stage">
        <div className="pb-orb">
          <div className="pb-orb-l pb-orb-l1"/>
          <div className="pb-orb-l pb-orb-l2"/>
          <div className="pb-orb-l pb-orb-l3"/>
          <div className="pb-orb-l pb-orb-l4"/>
          <div className="pb-orb-core"/>
        </div>
      </div>
      <div className="pb-ai-foot">
        <div className="pb-ai-foot-dot"/>
        <div className="pb-ai-foot-txt">{footText}</div>
      </div>
    </button>
  );
}
