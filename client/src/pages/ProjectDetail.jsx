import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, UserPlus } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', status: 'TODO', dueDate: '' });
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get('/projects'), // We fetch all projects to find this one and check admin status easily
        api.get(`/projects/${id}/tasks`)
      ]);
      const currentProject = projectRes.data.find(p => p._id === id);
      setProject(currentProject);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/tasks`, newTask);
      setTasks([...tasks, res.data]);
      setShowTaskModal(false);
      setNewTask({ title: '', status: 'TODO', dueDate: '' });
    } catch (error) {
      alert('Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      alert('Failed to update task');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/invite`, { email: inviteEmail });
      alert('User invited successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to invite user');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading project...</div>;
  if (!project) return <div className="text-center mt-20 text-red-500">Project not found or access denied.</div>;

  const isAdmin = project.members.some(m => m.userId._id === user.id && m.role === 'ADMIN');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.name}</h1>
          <p className="text-gray-500">{project.description}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
              <UserPlus className="w-4 h-4" /> Invite
            </button>
          )}
          <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
          <div key={status} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-4 flex justify-between items-center">
              {status.replace('_', ' ')}
              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {tasks.filter(t => t.status === status).length}
              </span>
            </h3>
            <div className="space-y-3">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-800 mb-2">{task.title}</h4>
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mb-3">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                  <div className="flex gap-2">
                    {status !== 'TODO' && <button onClick={() => handleUpdateStatus(task._id, 'TODO')} className="text-xs text-gray-500 hover:text-blue-600">Todo</button>}
                    {status !== 'IN_PROGRESS' && <button onClick={() => handleUpdateStatus(task._id, 'IN_PROGRESS')} className="text-xs text-gray-500 hover:text-blue-600">In Progress</button>}
                    {status !== 'DONE' && <button onClick={() => handleUpdateStatus(task._id, 'DONE')} className="text-xs text-gray-500 hover:text-blue-600">Done</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals for Task and Invite (omitted long boilerplate for brevity, implement similar to Dashboard modal) */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Create Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input type="text" placeholder="Task Title" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Invite Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <input type="email" placeholder="User Email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
