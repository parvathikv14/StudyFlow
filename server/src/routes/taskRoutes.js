import { Router } from 'express';
import { createTask, deleteTask, getProgress, getTask, listTasks, updateTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', listTasks);
router.get('/progress', getProgress);
router.post('/', createTask);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
