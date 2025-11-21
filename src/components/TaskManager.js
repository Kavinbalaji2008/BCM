import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  IconButton,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  Flag,
  Assignment,
  TrendingUp,
  Person,
  Save,
  Cancel
} from '@mui/icons-material';
import { optimizedToast as toast } from '../utils/toastUtils';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [taskDialog, setTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: '',
    category: 'general'
  });

  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('bcm_tasks');
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse saved tasks:', err);
      localStorage.removeItem('bcm_tasks');
    }
  }, []);

  useEffect(() => {
    try {
      if (tasks.length >= 0 && typeof Storage !== 'undefined' && localStorage) {
        localStorage.setItem('bcm_tasks', JSON.stringify(tasks));
      }
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  }, [tasks]);

  const handleTaskSubmit = () => {
    try {
      if (!taskForm.title?.trim()) {
        toast.error('Task title is required');
        return;
      }

      const taskData = {
        ...taskForm,
        id: editingTask?.id || Date.now().toString(),
        createdAt: editingTask?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingTask) {
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? taskData : task
        ));
        toast.success('✅ Task updated successfully!');
      } else {
        try {
          if (!Array.isArray(tasks)) {
            console.error('Tasks state is not an array, resetting');
            setTasks([taskData]);
          } else {
            // Validate taskData before adding
            if (!taskData || typeof taskData !== 'object') {
              throw new Error('Invalid task data');
            }
            setTasks(prev => [...prev, taskData]);
          }
          toast.success('✅ Task created successfully!');
        } catch (stateError) {
          console.error('Error adding task to state:', stateError);
          toast.error('Failed to add task to list');
          return;
        }
      }

      setTaskDialog(false);
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        assignedTo: '',
        category: 'general'
      });
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleEditTask = (task) => {
    try {
      if (!task || !task.id) {
        toast.error('Invalid task data');
        return;
      }
      setEditingTask(task);
      setTaskForm(task);
      setTaskDialog(true);
    } catch (error) {
      console.error('Error editing task:', error);
      toast.error('Failed to edit task');
    }
  };

  const handleDeleteTask = (taskId) => {
    try {
      if (taskId && window.confirm('Are you sure you want to delete this task?')) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        toast.success('🗑️ Task deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    try {
      if (taskId && newStatus) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
        ));
        toast.success(`Task marked as ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#64748B';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#0EA5E9';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#64748B';
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length
  };

  const completionRate = taskStats.total > 0 ? 
    Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  const TaskCard = ({ task }) => (
    <Card sx={{
      mb: 2,
      borderRadius: 3,
      border: `1px solid ${getStatusColor(task.status)}20`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px ${getStatusColor(task.status)}25`
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="600" color="#0F172A" gutterBottom>
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {task.description}
            </Typography>
            
            <Box display="flex" gap={1} mb={2}>
              <Chip
                label={task.priority}
                size="small"
                sx={{
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white',
                  fontWeight: 600
                }}
                icon={<Flag sx={{ color: 'white !important' }} />}
              />
              <Chip
                label={task.status}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(task.status),
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Chip
                label={task.category}
                size="small"
                variant="outlined"
                sx={{ borderColor: '#0EA5E9', color: '#0EA5E9' }}
              />
            </Box>

            {task.dueDate && (
              <Box display="flex" alignItems="center" mb={1}>
                <Schedule sx={{ fontSize: 16, mr: 1, color: '#64748B' }} />
                <Typography variant="caption" color="text.secondary">
                  Due: {(() => {
                    try {
                      return new Date(task.dueDate).toLocaleDateString();
                    } catch (error) {
                      console.error('Error formatting date:', error);
                      return 'Invalid date';
                    }
                  })()}
                </Typography>
              </Box>
            )}

            {task.assignedTo && (
              <Box display="flex" alignItems="center">
                <Person sx={{ fontSize: 16, mr: 1, color: '#64748B' }} />
                <Typography variant="caption" color="text.secondary">
                  Assigned to: {task.assignedTo}
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <IconButton
              size="small"
              onClick={() => handleEditTask(task)}
              sx={{ color: '#0EA5E9' }}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteTask(task.id)}
              sx={{ color: '#EF4444' }}
            >
              <Delete fontSize="small" />
            </IconButton>
            {task.status !== 'completed' && (
              <IconButton
                size="small"
                onClick={() => handleStatusChange(task.id, 'completed')}
                sx={{ color: '#10B981' }}
              >
                <CheckCircle fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Task Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Assignment sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="700">{taskStats.total}</Typography>
              <Typography variant="body2">Total Tasks</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="700">{taskStats.completed}</Typography>
              <Typography variant="body2">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #EAB308 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="700">{taskStats.pending}</Typography>
              <Typography variant="body2">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
            color: 'white'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <TrendingUp sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="700">{completionRate}%</Typography>
              <Typography variant="body2">Completion Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Task Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="600" color="#0F172A">
          Task Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setTaskDialog(true)}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)'
            }
          }}
        >
          Add Task
        </Button>
      </Box>

      {/* Progress Bar */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">Overall Progress</Typography>
            <Typography variant="h6" color="#0EA5E9" fontWeight="700">
              {completionRate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
                borderRadius: 6
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Assignment sx={{ fontSize: 80, color: '#0EA5E9', mb: 3 }} />
            <Typography variant="h5" color="#0F172A" gutterBottom fontWeight="600">
              No Tasks Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              Create your first task to get started with task management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setTaskDialog(true)}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)'
              }}
            >
              Create Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} md={6} key={task.id}>
              <TaskCard task={task} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Task Dialog */}
      <Dialog
        open={taskDialog}
        onClose={() => setTaskDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Task Title"
            margin="normal"
            value={taskForm.title}
            onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={taskForm.description}
            onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Due Date"
            type="date"
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
          />

          <TextField
            fullWidth
            label="Assigned To"
            margin="normal"
            value={taskForm.assignedTo}
            onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={taskForm.category}
              onChange={(e) => setTaskForm({...taskForm, category: e.target.value})}
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="client">Client Work</MenuItem>
              <MenuItem value="vendor">Vendor Management</MenuItem>
              <MenuItem value="partner">Partnership</MenuItem>
              <MenuItem value="admin">Administrative</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setTaskDialog(false)}
            startIcon={<Cancel />}
            sx={{ color: '#64748B' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTaskSubmit}
            startIcon={<Save />}
            sx={{
              background: 'linear-gradient(135deg, #0EA5E9 0%, #3B82F6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)'
              }
            }}
          >
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TaskManager;