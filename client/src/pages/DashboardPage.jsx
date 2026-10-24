import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, Circle, Flame, ListTodo, Plus, Target, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { TaskItem } from '../components/TaskItem.jsx';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [todoData, activeData, progressData] = await Promise.all([
        apiRequest('/tasks?limit=4&status=todo'),
        apiRequest('/tasks?limit=4&status=in_progress'),
        apiRequest('/tasks/progress')
      ]);
      setData({
        tasks: [...todoData.tasks, ...activeData.tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        progress: progressData.progress
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function setTaskStatus(task, status) {
    try {
      await apiRequest(`/tasks/${task._id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      load();
    } catch (requestError) { setError(requestError.message); }
  }

  const active = data?.tasks?.filter((task) => task.status !== 'completed') || [];
  const displayName = user?.name?.split(' ')[0] || 'there';
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="dashboard-page">
      <div className="page-heading"><div><div className="date-eyebrow">{date.toUpperCase()}</div><h1>{greeting()}, {displayName}<span className="wave">✦</span></h1><p>You don’t have to do it all today. Just start with one thing.</p></div><Link to="/tasks?new=1" className="button button-primary heading-button"><Plus size={16} /> Add a task</Link></div>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading && !data ? <LoadingState label="Getting your study space ready…" /> : data && <>
        <section className="dashboard-stats" aria-label="Task summary">
          <article className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-blue"><ListTodo size={18} /></span><span className="stat-label">ALL TASKS</span></div><strong>{data.progress.total}</strong><span className="stat-caption">tasks in your workspace</span><span className="stat-card-accent accent-blue" /></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-green"><CheckCircle2 size={18} /></span><span className="stat-label">COMPLETED</span></div><strong>{data.progress.completed}</strong><span className="stat-caption">{data.progress.total ? `${data.progress.completionRate}% completion rate` : 'Your wins start here'}</span><span className="stat-card-accent accent-green" /></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-orange"><Zap size={18} /></span><span className="stat-label">IN PROGRESS</span></div><strong>{data.progress.inProgress}</strong><span className="stat-caption">things you’re working on</span><span className="stat-card-accent accent-orange" /></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-violet"><Target size={18} /></span><span className="stat-label">STILL TO DO</span></div><strong>{data.progress.todo}</strong><span className="stat-caption">ready when you are</span><span className="stat-card-accent accent-violet" /></article>
        </section>
        <section className="dashboard-grid">
          <div className="panel tasks-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR FOCUS</span><h2>Up next <span className="heading-count">{active.length}</span></h2></div><Link to="/tasks" className="text-link">All tasks <ArrowRight size={15} /></Link></div>
            {active.length ? <div className="task-list">{active.slice(0, 4).map((task) => <TaskItem key={task._id} task={task} compact onStatusChange={setTaskStatus} />)}</div> : <div className="dashboard-empty"><span><CheckCircle2 size={22} /></span><strong>You’re all caught up.</strong><p>Add a task whenever you’re ready for the next step.</p><Link to="/tasks?new=1" className="text-link">Create a task <ArrowRight size={15} /></Link></div>}
            <div className="panel-bottom"><Link to="/tasks">Open task manager <ArrowUpRight size={14} /></Link><span>{data.progress.total} total {data.progress.total === 1 ? 'task' : 'tasks'}</span></div>
          </div>
          <div className="right-column">
            <div className="progress-card"><div className="progress-card-top"><span className="eyebrow">YOUR PROGRESS</span><Link to="/progress" aria-label="View progress"><ArrowUpRight size={17} /></Link></div><div className="progress-number">{data.progress.completionRate}<small>%</small></div><p>of your tasks completed</p><div className="progress-track"><span style={{ width: `${data.progress.completionRate}%` }} /></div><div className="progress-card-foot"><span><TrendingUp size={14} /> Keep your momentum</span><span>{data.progress.completed}/{data.progress.total}</span></div><div className="progress-decoration"><Flame size={95} /></div></div>
            <div className="focus-card"><div className="focus-icon"><Circle size={19} /></div><div><strong>Progress over perfection.</strong><p>Every task you complete is a step forward. Keep showing up.</p><Link to="/progress">See your progress <ArrowRight size={14} /></Link></div></div>
          </div>
        </section>
      </>}
    </div>
  );
}
