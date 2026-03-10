import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';
import Task from '../models/Task.js';
import { getUserId } from '../middleware/auth.js';

// GET /api/analytics/summary
export async function getSummary(req, res, next) {
  try {
    const userId = getUserId(req);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');

    const [all, todayTasks, yesterdayTasks, weekTasks, monthTasks] = await Promise.all([
      Task.find({ userId }),
      Task.find({ userId, createdAt: todayStr }),
      Task.find({ userId, createdAt: yesterdayStr }),
      Task.find({ userId, createdAt: { $gte: weekStart, $lte: todayStr } }),
      Task.find({ userId, createdAt: { $gte: monthStart, $lte: todayStr } }),
    ]);

    // Streak: consecutive days with at least one completed task
    let streak = 0;
    const completionMap = {};
    all.forEach((t) => {
      if (t.completedAt) completionMap[t.completedAt] = (completionMap[t.completedAt] || 0) + 1;
    });
    for (let i = 0; i < 365; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if ((completionMap[d] || 0) > 0) streak++;
      else if (i > 0) break;
    }

    res.json({
      success: true,
      data: {
        total: all.length,
        completed: all.filter((t) => t.completed).length,
        pending: all.filter((t) => !t.completed).length,
        streak,
        today: {
          total: todayTasks.length,
          completed: todayTasks.filter((t) => t.completed).length,
        },
        yesterday: {
          total: yesterdayTasks.length,
          completed: yesterdayTasks.filter((t) => t.completed).length,
        },
        week: {
          total: weekTasks.length,
          completed: weekTasks.filter((t) => t.completed).length,
        },
        month: {
          total: monthTasks.length,
          completed: monthTasks.filter((t) => t.completed).length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/heatmap?days=365
export async function getHeatmap(req, res, next) {
  try {
    const userId = getUserId(req);
    const days = Math.min(parseInt(req.query.days) || 365, 730);
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const tasks = await Task.find({
      userId,
      completedAt: { $gte: startDate, $lte: todayStr },
    }).select('completedAt');

    // Group by date
    const map = {};
    tasks.forEach((t) => {
      if (t.completedAt) map[t.completedAt] = (map[t.completedAt] || 0) + 1;
    });

    res.json({ success: true, data: map });
  } catch (err) {
    next(err);
  }
}

// GET /api/analytics/breakdown?view=week|month|year&date=yyyy-MM-dd
export async function getBreakdown(req, res, next) {
  try {
    const userId = getUserId(req);
    const view = req.query.view || 'week';
    const refDate = req.query.date ? new Date(req.query.date) : new Date();

    let days = [];

    if (view === 'week') {
      const start = startOfWeek(refDate, { weekStartsOn: 0 });
      const end = endOfWeek(refDate, { weekStartsOn: 0 });
      days = eachDayOfInterval({ start, end });
    } else if (view === 'month') {
      days = eachDayOfInterval({ start: startOfMonth(refDate), end: endOfMonth(refDate) });
    } else {
      // year: last 12 months aggregated by month
      const result = Array.from({ length: 12 }, (_, i) => {
        const m = subMonths(refDate, 11 - i);
        return { label: format(m, 'MMM'), month: format(m, 'yyyy-MM') };
      });
      const startDate = format(startOfMonth(subMonths(refDate, 11)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(refDate), 'yyyy-MM-dd');

      const tasks = await Task.find({
        userId,
        completedAt: { $gte: startDate, $lte: endDate },
      }).select('completedAt');

      const monthMap = {};
      tasks.forEach((t) => {
        if (t.completedAt) {
          const m = t.completedAt.slice(0, 7);
          monthMap[m] = (monthMap[m] || 0) + 1;
        }
      });

      return res.json({
        success: true,
        data: result.map((r) => ({ label: r.label, completed: monthMap[r.month] || 0 })),
      });
    }

    const startStr = format(days[0], 'yyyy-MM-dd');
    const endStr = format(days[days.length - 1], 'yyyy-MM-dd');

    const tasks = await Task.find({
      userId,
      completedAt: { $gte: startStr, $lte: endStr },
    }).select('completedAt');

    const map = {};
    tasks.forEach((t) => { if (t.completedAt) map[t.completedAt] = (map[t.completedAt] || 0) + 1; });

    const data = days.map((d) => {
      const ds = format(d, 'yyyy-MM-dd');
      return { label: view === 'week' ? format(d, 'EEE') : format(d, 'd'), date: ds, completed: map[ds] || 0 };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
