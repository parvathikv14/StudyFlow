import mongoose from 'mongoose';
import Task from '../models/Task.js';

const statuses = ['todo', 'in_progress', 'completed'];
const priorities = ['low', 'medium', 'high'];

function validateTask(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) body = {};
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length < 2 || body.title.trim().length > 120) {
      errors.push('Title must be between 2 and 120 characters.');
    }
  }
  if (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 1000)) {
    errors.push('Description must be 1000 characters or fewer.');
  }
  if (body.status !== undefined && !statuses.includes(body.status)) {
    errors.push('Choose a valid task status.');
  }
  if (body.priority !== undefined && !priorities.includes(body.priority)) {
    errors.push('Choose a valid priority.');
  }
  if (body.dueDate !== undefined && body.dueDate !== null && body.dueDate !== '') {
    const dueDate = new Date(body.dueDate);
    if (Number.isNaN(dueDate.getTime())) errors.push('Enter a valid due date.');
  }
  return errors;
}

function taskFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  const fields = {};
  for (const key of ['title', 'description', 'status', 'priority']) {
    if (body[key] !== undefined) fields[key] = typeof body[key] === 'string' && key !== 'status' && key !== 'priority'
      ? body[key].trim()
      : body[key];
  }
  if (body.dueDate !== undefined) fields.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  return fields;
}

export async function listTasks(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const filter = { owner: req.userId };
    if (req.query.status && !statuses.includes(req.query.status)) {
      return res.status(400).json({ message: 'Choose a valid task status filter.' });
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search && typeof req.query.search === 'string') {
      const escaped = req.query.search.trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (escaped) filter.title = { $regex: escaped, $options: 'i' };
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Task.countDocuments(filter)
    ]);
    return res.status(200).json({
      tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTask(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'The task identifier is invalid.' });
    const task = await Task.findOne({ _id: req.params.id, owner: req.userId }).lean();
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    return res.status(200).json({ task });
  } catch (error) {
    return next(error);
  }
}

export async function createTask(req, res, next) {
  try {
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const errors = validateTask(body);
    if (errors.length) return res.status(400).json({ message: errors[0], errors });
    const task = await Task.create({ ...taskFields(body), owner: req.userId });
    return res.status(201).json({ task });
  } catch (error) {
    return next(error);
  }
}

export async function updateTask(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'The task identifier is invalid.' });
    const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const errors = validateTask(body, true);
    if (errors.length) return res.status(400).json({ message: errors[0], errors });
    if (!Object.keys(taskFields(body)).length) return res.status(400).json({ message: 'Provide at least one field to update.' });
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { $set: taskFields(body) },
      { new: true, runValidators: true }
    ).lean();
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    return res.status(200).json({ task });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTask(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'The task identifier is invalid.' });
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    return res.status(200).json({ message: 'Task deleted.' });
  } catch (error) {
    return next(error);
  }
}

export async function getProgress(req, res, next) {
  try {
    const [total, completed, inProgress, todo, recent] = await Promise.all([
      Task.countDocuments({ owner: req.userId }),
      Task.countDocuments({ owner: req.userId, status: 'completed' }),
      Task.countDocuments({ owner: req.userId, status: 'in_progress' }),
      Task.countDocuments({ owner: req.userId, status: 'todo' }),
      Task.find({ owner: req.userId }).sort({ updatedAt: -1 }).limit(5).select('title status updatedAt').lean()
    ]);
    return res.status(200).json({
      progress: {
        total,
        completed,
        inProgress,
        todo,
        completionRate: total ? Math.round((completed / total) * 100) : 0,
        recent
      }
    });
  } catch (error) {
    return next(error);
  }
}
