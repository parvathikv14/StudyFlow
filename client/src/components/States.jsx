import { Activity, ArrowRight, CircleHelp, LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Loading your workspace…' }) {
  return <div className="state-card" role="status"><LoaderCircle className="spin" size={21} /> <span>{label}</span></div>;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card state-error" role="alert">
      <CircleHelp size={21} />
      <div><strong>We couldn’t load this yet</strong><p>{message}</p></div>
      {onRetry && <button className="button button-outline button-small" onClick={onRetry}><Activity size={15} /> Try again</button>}
    </div>
  );
}

export function EmptyState({ title, message, action, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Activity size={22} /></div>
      <h3>{title}</h3><p>{message}</p>
      {action && <button className="button button-primary" onClick={onAction}>{action}<ArrowRight size={16} /></button>}
    </div>
  );
}
