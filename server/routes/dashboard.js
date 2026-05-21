const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    // 1. Find projects where user is a member to get task universe
    const projects = await Project.find({ 'members.userId': req.user.id }, '_id');
    const projectIds = projects.map(p => p._id);
    
    // 2. Aggregate tasks count by status assigned to user OR in user's projects
    // Wait, the prompt says "a count of the user's tasks grouped by status"
    // Let's assume "user's tasks" means tasks assigned to the user.
    const counts = await Task.aggregate([
      { $match: { assigneeId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const statusCounts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    counts.forEach(c => {
      if (statusCounts[c._id] !== undefined) {
        statusCounts[c._id] = c.count;
      }
    });

    // 3. Overdue tasks
    const now = new Date();
    const overdueTasks = await Task.find({
      assigneeId: req.user.id,
      dueDate: { $lt: now },
      status: { $ne: 'DONE' }
    }).populate('projectId', 'name');

    res.json({ counts: statusCounts, overdueTasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
