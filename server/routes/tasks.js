const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// List tasks for a project
router.get('/:id/tasks', async (req, res) => {
  try {
    // Verify user is in project
    const project = await Project.findOne({ _id: req.params.id, 'members.userId': req.user.id });
    if (!project) return res.status(403).json({ error: 'Not authorized to view tasks for this project' });
    
    const tasks = await Task.find({ projectId: req.params.id }).populate('assigneeId', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task
router.post('/:id/tasks', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, 'members.userId': req.user.id });
    if (!project) return res.status(403).json({ error: 'Not authorized' });
    
    const { title, status, dueDate, assigneeId } = req.body;
    const task = new Task({
      title,
      status,
      dueDate,
      projectId: req.params.id,
      assigneeId: assigneeId || null
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.patch('/:id/tasks/:taskId', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, 'members.userId': req.user.id });
    if (!project) return res.status(403).json({ error: 'Not authorized' });
    
    const { status, assigneeId } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, projectId: req.params.id },
      { $set: { ...(status && { status }), ...(assigneeId !== undefined && { assigneeId }) } },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
