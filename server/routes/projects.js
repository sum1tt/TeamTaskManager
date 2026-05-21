const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Get projects where current user is in members array
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ 'members.userId': req.user.id })
      .populate('members.userId', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      members: [{ userId: req.user.id, role: 'ADMIN' }]
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, 'members.userId': req.user.id, 'members.role': 'ADMIN' });
    if (!project) return res.status(403).json({ error: 'Not authorized to delete this project or project not found' });
    
    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invite member
router.post('/:id/invite', async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findOne({ _id: req.params.id, 'members.userId': req.user.id, 'members.role': 'ADMIN' });
    if (!project) return res.status(403).json({ error: 'Not authorized to invite members to this project' });
    
    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ error: 'User not found' });
    
    if (project.members.some(m => m.userId.toString() === userToInvite._id.toString())) {
      return res.status(400).json({ error: 'User is already a member' });
    }
    
    project.members.push({ userId: userToInvite._id, role: 'MEMBER' });
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
