import { format } from 'date-fns';
import Task from '../models/Task.js';
import { getUserId } from '../middleware/auth.js';

const today = () => format(new Date(), 'yyyy-MM-dd');

// GET /api/tasks
export async function getTasks(req, res, next) {
  try {
    const userId = getUserId(req);
    const tasks = await Task.find({ userId }).sort({ createdAtTimestamp: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks
export async function createTask(req, res, next) {
  try {
    const userId = getUserId(req);
    const { title, description, category, priority, dueDate, dueTime } = req.body;

    const task = await Task.create({
      userId,
      title,
      description: description || '',
      category: category || 'Personal',
      priority: priority || 'medium',
      completed: false,
      createdAt: today(),
      completedAt: null,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// PUT /api/tasks/:id
export async function updateTask(req, res, next) {
  try {
    const userId = getUserId(req);
    const { title, description, category, priority, completed, dueDate, dueTime } = req.body;

    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.category = category ?? task.category;
    task.priority = priority ?? task.priority;

    if ('dueDate' in req.body) task.dueDate = dueDate || null;
    if ('dueTime' in req.body) task.dueTime = dueTime || null;

    if (completed !== undefined) {
      task.completed = completed;
      task.completedAt = completed ? today() : null;
    }

    await task.save();
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tasks/:id
export async function deleteTask(req, res, next) {
  try {
    const userId = getUserId(req);
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tasks/:id/toggle
export async function toggleTask(req, res, next) {
  try {
    const userId = getUserId(req);
    const task = await Task.findOne({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

    task.completed = !task.completed;
    task.completedAt = task.completed ? today() : null;
    await task.save();

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}
