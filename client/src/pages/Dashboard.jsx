import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { ClipboardList, Clock, CheckCircle2, Plus } from 'lucide-react';

const Dashboard = () => {
  const [counts, setCounts] = useState({ TODO: 0, IN_PROGRESS: 0, DONE: 0 });
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setCounts(res.data.counts);
      setOverdueTasks(res.data.overdueTasks);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowProjectModal(false);
      setNewProject({ name: '', description: '' });
      // You can redirect to the project detail or show a success message
      alert('Project created successfully!');
    } catch (error) {
      alert('Failed to create project');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Dashboard</h1>
        <button 
          onClick={() => setShowProjectModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-100 text-gray-600 rounded-lg"><ClipboardList className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">To Do</p>
            <h3 className="text-2xl font-bold text-gray-800">{counts.TODO}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">In Progress</p>
            <h3 className="text-2xl font-bold text-gray-800">{counts.IN_PROGRESS}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Done</p>
            <h3 className="text-2xl font-bold text-gray-800">{counts.DONE}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Overdue Tasks</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {overdueTasks.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No overdue tasks! You're all caught up.</div>
          ) : (
            overdueTasks.map(task => (
              <div key={task._id} className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{task.title}</h4>
                  <p className="text-sm text-gray-500 flex gap-2 items-center mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{task.projectId?.name || 'Project'}</span>
                    <span className="text-red-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </p>
                </div>
                <Link to={`/projects/${task.projectId?._id}`} className="text-blue-600 hover:underline text-sm font-medium">View Project</Link>
              </div>
            ))
          )}
        </div>
      </div>

      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input 
                  type="text" required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="E.g., Website Redesign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows="3" placeholder="Project goals and details..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
