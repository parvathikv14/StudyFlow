import { useState } from 'react';
import { X } from 'lucide-react';

const emptyForm = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' };

export function TaskForm({ task, onSave, onCancel, saving }) {
  const [form, setForm] = useState(task ? {
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
  } : emptyForm);
  const [validationError, setValidationError] = useState('');

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setValidationError('');
  }

  function submit(event) {
    event.preventDefault();
    if (form.title.trim().length < 2) return setValidationError('Give your task a title of at least 2 characters.');
    if (form.title.trim().length > 120) return setValidationError('Task titles can be up to 120 characters.');
    onSave({ ...form, title: form.title.trim(), dueDate: form.dueDate || null });
  }

  return (
    <form className="task-form" onSubmit={submit} noValidate>
      <div className="form-heading"><div><span className="eyebrow">TASK DETAILS</span><h2>{task ? 'Edit task' : 'Add a task'}</h2></div><button type="button" className="icon-plain" onClick={onCancel} aria-label="Close form"><X size={20} /></button></div>
      {validationError && <div className="inline-error" role="alert">{validationError}</div>}
      <label>Task name <span className="required">*</span><input name="title" value={form.title} onChange={update} placeholder="e.g. Review chapter three" required maxLength={120} autoFocus /></label>
      <label>Description <span className="optional">Optional</span><textarea name="description" value={form.description} onChange={update} placeholder="Add a few details…" rows={3} maxLength={1000} /></label>
      <div className="form-grid">
        <label>Priority<select name="priority" value={form.priority} onChange={update}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        {task && <label>Status<select name="status" value={form.status} onChange={update}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>}
        <label>Due date <span className="optional">Optional</span><input name="dueDate" type="date" value={form.dueDate} onChange={update} /></label>
      </div>
      <div className="form-actions"><button type="button" className="button button-outline" onClick={onCancel}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
    </form>
  );
}
