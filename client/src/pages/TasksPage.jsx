import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ListTodo, Plus, Search, X } from 'lucide-react';
import { apiRequest } from '../lib/api.js';
import { ErrorState, LoadingState } from '../components/States.jsx';
import { TaskItem } from '../components/TaskItem.jsx';
import { TaskForm } from '../components/TaskForm.jsx';

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [formOpen, setFormOpen] = useState(searchParams.get('new') === '1');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ limit: '50' });
    if (status !== 'all') query.set('status', status);
    if (appliedSearch.trim()) query.set('search', appliedSearch.trim());
    try {
      const data = await apiRequest(`/tasks?${query}`);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [status, appliedSearch]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function showForm(task = null) {
    setEditingTask(task);
    setFormOpen(true);
    setNotice('');
  }

  async function saveTask(values) {
    setSaving(true);
    setError('');
    try {
      await apiRequest(editingTask ? `/tasks/${editingTask._id}` : '/tasks', {
        method: editingTask ? 'PATCH' : 'POST',
        body: JSON.stringify(values)
      });
      setFormOpen(false);
      setEditingTask(null);
      setNotice(editingTask ? 'Your task has been updated.' : 'Your task has been added.');
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    setError('');
    setNotice('');
    try {
      await apiRequest(`/tasks/${task._id}`, { method: 'DELETE' });
      setNotice('Task deleted.');
      await load();
    } catch (requestError) { setError(requestError.message); }
  }

  async function setTaskStatus(task, nextStatus) {
    setError('');
    try {
      await apiRequest(`/tasks/${task._id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
      setNotice(nextStatus === 'completed' ? 'Nice work — task completed!' : 'Task moved back to your list.');
      await load();
    } catch (requestError) { setError(requestError.message); }
  }

  function searchSubmit(event) {
    event.preventDefault();
    setAppliedSearch(search);
  }

  return (
    <div className="tasks-page">
      <div className="page-heading"><div><div className="date-eyebrow">MAKE IT MANAGEABLE</div><h1>My tasks<span className="wave">✦</span></h1><p>Every big finish starts with a small next step.</p></div><button className="button button-primary heading-button" onClick={() => showForm()}><Plus size={16} /> Add a task</button></div>
      {error && <ErrorState message={error} onRetry={load} />}
      {notice && <div className="success-banner" role="status"><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}><X size={15} /></button></div>}
      <div className="task-toolbar">
        <div className="filter-tabs" role="group" aria-label="Filter tasks by status">{[['all', 'All tasks'], ['todo', 'To do'], ['in_progress', 'In progress'], ['completed', 'Completed']].map(([value, label]) => <button key={value} className={status === value ? 'filter-active' : ''} onClick={() => setStatus(value)}>{label}{status === value && pagination && <span className="filter-count">{pagination.total}</span>}</button>)}</div>
        <div className="task-tools"><form className="search-box" onSubmit={searchSubmit}><Search size={16} /><input aria-label="Search tasks" placeholder="Search tasks…" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit">Search</button></form><span className="filter-label"><Filter size={15} /> Filter</span></div>
      </div>
      <div className="tasks-content">
        {formOpen && <div className="form-card"><TaskForm task={editingTask} onSave={saveTask} onCancel={() => { setFormOpen(false); setEditingTask(null); }} saving={saving} /></div>}
        {loading ? <LoadingState label="Loading your tasks…" /> : error ? null : tasks.length ? <div className="tasks-list">{tasks.map((task) => <TaskItem key={task._id} task={task} onStatusChange={setTaskStatus} onEdit={showForm} onDelete={deleteTask} />)}</div> : <div className="panel"><div className="empty-state"><div className="empty-icon"><ListTodo size={22} /></div><h3>{appliedSearch ? 'No matching tasks' : status !== 'all' ? 'Nothing in this list yet' : 'Your task list starts here'}</h3><p>{appliedSearch ? 'Try a different search or clear the search box.' : 'Add your first task and make that next step feel a little easier.'}</p>{status === 'all' && !appliedSearch && <button className="button button-primary" onClick={() => showForm()}><Plus size={16} /> Add your first task</button>}</div></div>}
      </div>
      {pagination?.pages > 1 && <p className="pagination-note">Showing the first 50 results. Use search or a status filter to narrow your tasks.</p>}
    </div>
  );
}
