import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validateTask, checkValidation } from '../validators/taskValidator.js';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from '../controllers/taskController.js';

const router = Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', validateTask, checkValidation, createTask);
router.put('/:id', validateTask, checkValidation, updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTask);

export default router;
