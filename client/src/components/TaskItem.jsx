import { CalendarDays, Check, Circle, Clock3, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

const statusText = { todo: 'To do', in_progress: 'In progress', completed: 'Completed' };

export function TaskItem({ task, onStatusChange, onEdit, onDelete, compact = false }) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && due < new Date() && task.status !== 'completed';
  return (
    <article className={`task-row ${compact ? 'task-row-compact' : ''}`}>
      <button
        className={`task-check ${task.status === 'completed' ? 'is-checked' : ''}`}
        type="button"
        aria-label={task.status === 'completed' ? `Mark ${task.title} as to do` : `Mark ${task.title} as completed`}
        onClick={() => onStatusChange(task, task.status === 'completed' ? 'todo' : 'completed')}
      >
        {task.status === 'completed' ? <Check size={14} /> : <Circle size={19} />}
      </button>
      <div className="task-main">
        <div className="task-title-line">
          <h3 className={task.status === 'completed' ? 'task-complete' : ''}>{task.title}</h3>
          <span className={`priority priority-${task.priority}`}>{task.priority}</span>
        </div>
        {!compact && task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`status status-${task.status}`}><i />{statusText[task.status]}</span>
          {due && <span className={overdue ? 'due-overdue' : ''}><CalendarDays size={13} />{due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{overdue ? ' · overdue' : ''}</span>}
          {compact && <span><Clock3 size={13} /> Updated {new Date(task.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
        </div>
      </div>
      {!compact && <div className="task-actions">
        <button aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}><Pencil size={15} /></button>
        <button aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}><Trash2 size={15} /></button>
      </div>}
      {compact && <button className="icon-plain" aria-label="Task options"><MoreHorizontal size={19} /></button>}
    </article>
  );
}
