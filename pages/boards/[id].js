// pages/boards/[id].js - Fixed version with safe array handling
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function BoardDetailPage() {
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]); // Initialize as empty array
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchBoardAndTasks();
    }
  }, [id]);

  const fetchBoardAndTasks = async () => {
    try {
      // Fetch board details first
      const boardRes = await fetch('/api/boards', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (boardRes.status === 401) {
        router.push('/login');
        return;
      }

      if (boardRes.ok) {
        const boards = await boardRes.json();
        const currentBoard = boards.find(b => b.id === id);
        if (!currentBoard) {
          setError('Board not found');
          setLoading(false);
          return;
        }
        setBoard(currentBoard);
      }

      // Fetch tasks for this board
      const tasksRes = await fetch(`/api/boards/${id}/tasks`, {
        method: 'GET',
        credentials: 'include',
      });

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        console.log('Tasks data received:', tasksData);
        // Ensure we always set an array
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } else {
        console.error('Failed to fetch tasks, status:', tasksRes.status);
        setTasks([]); // Set empty array on error
      }
    } catch (err) {
      setError('Failed to load board data');
      console.error('Error fetching board data:', err);
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      const res = await fetch(`/api/boards/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || ''
        }),
      });
      
      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskDescription('');
        fetchBoardAndTasks();
        setError('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Failed to create task');
      console.error('Create task error:', err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchBoardAndTasks();
        setError('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchBoardAndTasks();
        setError('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const editTask = async (taskId, newTitle, newDescription) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title: newTitle,
          description: newDescription 
        }),
      });

      if (res.ok) {
        fetchBoardAndTasks();
        setError('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleEditTask = (task) => {
    const newTitle = prompt('Enter new task title:', task.title);
    if (newTitle === null) return;
    
    const newDescription = prompt('Enter new description:', task.description || '');
    if (newDescription === null) return;

    if (newTitle.trim()) {
      editTask(task.id, newTitle.trim(), newDescription.trim());
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!board) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Board not found</h1>
        <Link href="/dashboard" style={{ color: '#007bff' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // Safe array filtering with fallback
  const safeTasksArray = Array.isArray(tasks) ? tasks : [];
  const pendingTasks = safeTasksArray.filter(task => task.status === 'Pending');
  const completedTasks = safeTasksArray.filter(task => task.status === 'Completed');

  console.log('Rendering with tasks:', safeTasksArray.length, 'pending:', pendingTasks.length, 'completed:', completedTasks.length);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href="/dashboard" 
          style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            fontSize: '16px',
            marginBottom: '1rem',
            display: 'inline-block'
          }}
        >
          ← Back to Dashboard
        </Link>
        <h1 style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📁 {board.name}
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          {safeTasksArray.length} task{safeTasksArray.length !== 1 ? 's' : ''} total • {pendingTasks.length} pending • {completedTasks.length} completed
        </p>
      </div>

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: '1rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Add New Task */}
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ marginTop: 0 }}>Add New Task</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            placeholder="Task title (required)"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && createTask()}
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <textarea
            placeholder="Task description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            rows="3"
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              resize: 'vertical'
            }}
          />
          <button 
            onClick={createTask}
            disabled={!newTaskTitle.trim()}
            style={{
              alignSelf: 'flex-start',
              backgroundColor: newTaskTitle.trim() ? '#007bff' : '#ccc',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              cursor: newTaskTitle.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px'
            }}
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Tasks Display */}
      <div style={{ 
        display: 'grid', 
        gap: '2rem', 
        gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr'
      }}>
        
        {/* Pending Tasks */}
        <div>
          <h3 style={{ 
            color: '#856404',
            backgroundColor: '#fff3cd',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            margin: '0 0 1rem 0'
          }}>
            📋 Pending ({pendingTasks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingTasks.map((task) => (
              <div 
                key={task.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                  {task.title}
                </h4>
                {task.description && (
                  <p style={{ margin: '0 0 1rem 0', color: '#666', fontSize: '14px' }}>
                    {task.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'Completed')}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✓ Complete
                  </button>
                  <button
                    onClick={() => handleEditTask(task)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#666',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px dashed #ddd'
              }}>
                <p>No pending tasks</p>
                <small>Add a task above to get started!</small>
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div>
          <h3 style={{ 
            color: '#155724',
            backgroundColor: '#d4edda',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            margin: '0 0 1rem 0'
          }}>
            ✅ Completed ({completedTasks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {completedTasks.map((task) => (
              <div 
                key={task.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  opacity: 0.8
                }}
              >
                <h4 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: '#666',
                  textDecoration: 'line-through'
                }}>
                  {task.title}
                </h4>
                {task.description && (
                  <p style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#999', 
                    fontSize: '14px',
                    textDecoration: 'line-through'
                  }}>
                    {task.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updateTaskStatus(task.id, 'Pending')}
                    style={{
                      backgroundColor: '#ffc107',
                      color: 'black',
                      padding: '0.4rem 0.8rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ↺ Reopen
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      padding: '0.4rem 0.8rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {completedTasks.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#666',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px dashed #ddd'
              }}>
                <p>No completed tasks yet</p>
                <small>Complete some tasks to see them here!</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}