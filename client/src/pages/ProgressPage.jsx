import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowUpRight, CheckCircle2, Circle, Clock3, Flame, Target, TrendingUp, Zap } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { ErrorState, LoadingState } from '../components/States.jsx';

const labels = { todo: 'To do', in_progress: 'In progress', completed: 'Completed' };

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/tasks/progress');
      setProgress(data.progress);
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="progress-page">
      <div className="page-heading"><div><div className="date-eyebrow">LOOK HOW FAR YOU’VE COME</div><h1>Your progress<span className="wave">✦</span></h1><p>Every finished task is proof you’re moving forward.</p></div><div className="progress-heading-icon"><TrendingUp size={25} /></div></div>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState label="Gathering your progress…" /> : progress && <>
        <section className="progress-overview">
          <div className="progress-main-card"><div><span className="eyebrow">OVERALL COMPLETION</span><div className="big-progress-number">{progress.completionRate}<small>%</small></div><p>{progress.total === 0 ? 'Add your first task to start tracking your progress.' : `${progress.completed} of ${progress.total} ${progress.total === 1 ? 'task' : 'tasks'} completed`}</p></div><div className="progress-ring" style={{ '--progress': `${progress.completionRate}%` }}><div><CheckCircle2 size={25} /><strong>{progress.completionRate}%</strong><small>complete</small></div></div><div className="main-card-decoration"><Target size={200} /></div></div>
          <article className="progress-summary-card"><span className="summary-icon summary-icon-green"><CheckCircle2 size={19} /></span><span className="eyebrow">COMPLETED</span><strong>{progress.completed}</strong><p>tasks finished</p><span className="summary-foot"><TrendingUp size={14} /> Keep it going</span></article>
          <article className="progress-summary-card"><span className="summary-icon summary-icon-orange"><Zap size={19} /></span><span className="eyebrow">IN PROGRESS</span><strong>{progress.inProgress}</strong><p>tasks underway</p><span className="summary-foot"><Activity size={14} /> You’re in motion</span></article>
        </section>
        <section className="progress-detail-grid">
          <article className="panel breakdown-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR WORKLOAD</span><h2>Task breakdown</h2></div><span className="breakdown-icon"><Target size={18} /></span></div><div className="breakdown-bar" aria-label="Task completion breakdown">{progress.total > 0 && <><span className="bar-completed" style={{ width: `${progress.completed / progress.total * 100}%` }} /><span className="bar-active" style={{ width: `${progress.inProgress / progress.total * 100}%` }} /><span className="bar-todo" style={{ width: `${progress.todo / progress.total * 100}%` }} /></>}</div><div className="breakdown-items"><div><span className="legend-dot dot-completed" /><span>Completed</span><strong>{progress.completed}</strong></div><div><span className="legend-dot dot-active" /><span>In progress</span><strong>{progress.inProgress}</strong></div><div><span className="legend-dot dot-todo" /><span>To do</span><strong>{progress.todo}</strong></div></div><div className="workload-note"><Circle size={15} /><span>{progress.total === 0 ? 'Your progress will show up here when you add a task.' : `You have ${progress.todo + progress.inProgress} ${progress.todo + progress.inProgress === 1 ? 'task' : 'tasks'} left in your current list. One at a time.`}</span></div></article>
          <article className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">RECENT UPDATES</span><h2>Activity</h2></div><span className="activity-live"><i /> LIVE</span></div>{progress.recent.length ? <div className="activity-list">{progress.recent.map((task) => <div className="activity-item" key={task._id}><span className={`activity-mark activity-${task.status}`}>{task.status === 'completed' ? <CheckCircle2 size={15} /> : task.status === 'in_progress' ? <Zap size={14} /> : <Clock3 size={14} />}</span><div><strong>{task.title}</strong><small>{labels[task.status]} · {new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</small></div><ArrowUpRight size={15} /></div>)}</div> : <div className="activity-empty"><Flame size={20} /><strong>Your story starts with one task.</strong><p>When you update or finish a task, you’ll see it here.</p></div>}</article>
        </section>
        <div className="encouragement-banner"><span className="encourage-icon"><Flame size={20} /></span><div><strong>Keep showing up for yourself.</strong><p>Progress isn’t always a straight line. Every small effort matters.</p></div><span className="encourage-spark">✦</span></div>
      </>}
    </div>
  );
}
