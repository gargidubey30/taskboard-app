// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function DashboardPage() {
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch boards');
      }
      
      const data = await res.json();
      setBoards(data);
    } catch (err) {
      setError('Failed to load boards');
      console.error('Error fetching boards:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newBoardName.trim()) return;
    
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  
        body: JSON.stringify({ name: newBoardName.trim() }),
      });
      
      if (res.ok) {
        setNewBoardName('');
        fetchBoards();
        setError('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create board');
      }
    } catch (err) {
      setError('Failed to create board');
      console.error('Create board error:', err);
    }
  };

  // Replace your renameBoard and deleteBoard functions in dashboard.js with these safer versions:

const renameBoard = async (id) => {
  const currentBoard = boards.find(b => b.id === id);
  const newName = prompt('Enter new board name:', currentBoard?.name || '');
  
  if (!newName || !newName.trim()) return;
  if (newName.trim() === currentBoard?.name) return;

  try {
    console.log('Renaming board:', id, 'to:', newName.trim());
    
    const res = await fetch(`/api/boards?id=${id}&action=rename`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: newName.trim() }),
    });

    console.log('Rename response status:', res.status);
    
    // Check if response is OK first
    if (res.ok) {
      // Try to parse JSON, but handle empty responses
      let data = {};
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.log('Response was not JSON:', text);
        }
      }
      
      fetchBoards(); // Refresh boards list
      setError('');
      console.log('Board renamed successfully');
    } else {
      // Handle error responses
      const text = await res.text();
      console.log('Error response:', text);
      
      let errorMessage = 'Failed to rename board';
      try {
        const data = JSON.parse(text);
        errorMessage = data.message || errorMessage;
      } catch (e) {
        // If not JSON, use the text as error
        errorMessage = text || errorMessage;
      }
      
      setError(errorMessage);
    }
  } catch (err) {
    console.error('Rename board error:', err);
    setError('Failed to rename board - network error');
  }
};

const deleteBoard = async (id) => {
  const boardToDelete = boards.find(b => b.id === id);
  const confirmMessage = `Are you sure you want to delete "${boardToDelete?.name}"? This will also delete all tasks in this board.`;
  
  if (!confirm(confirmMessage)) return;

  try {
    console.log('Deleting board:', id);
    
    const res = await fetch(`/api/boards?id=${id}&action=delete`, { 
      method: 'DELETE',
      credentials: 'include'
    });

    console.log('Delete response status:', res.status);

    if (res.ok) {
      const text = await res.text();
      if (text) {
        try {
          const data = JSON.parse(text);
          console.log('Delete success:', data);
        } catch (e) {
          console.log('Response was not JSON:', text);
        }
      }
      
      fetchBoards(); // Refresh boards list
      setError('');
      console.log('Board deleted successfully');
    } else {
      const text = await res.text();
      console.log('Delete error response:', text);
      
      let errorMessage = 'Failed to delete board';
      try {
        const data = JSON.parse(text);
        errorMessage = data.message || errorMessage;
      } catch (e) {
        errorMessage = text || errorMessage;
      }
      
      setError(errorMessage);
    }
  } catch (err) {
    console.error('Delete board error:', err);
    setError('Failed to delete board - network error');
  }
};

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',  
      });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>📋 My Task Boards</h1>
        <button 
          onClick={logout}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
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

      {/* Create Board Section */}
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ marginTop: 0 }}>Create New Board</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Board name (e.g., Work, Personal, Shopping)"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createBoard()}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <button 
            onClick={createBoard}
            disabled={!newBoardName.trim()}
            style={{
              backgroundColor: newBoardName.trim() ? '#007bff' : '#ccc',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              cursor: newBoardName.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px'
            }}
          >
            Create Board
          </button>
        </div>
      </div>

      {/* Boards List */}
      <div>
        <h3>Your Boards ({boards.length})</h3>
        {boards.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px dashed #ddd'
          }}>
            <h4>No boards yet!</h4>
            <p>Create your first board to get started organizing your tasks.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {boards.map((board) => (
              <div 
                key={board.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div>
                  <Link 
                    href={`/boards/${board.id}`}
                    style={{ 
                      textDecoration: 'none',
                      color: '#007bff',
                      fontSize: '1.2rem',
                      fontWeight: '500'
                    }}
                  >
                    📁 {board.name}
                  </Link>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    Board ID: {board.id}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => renameBoard(board.id)}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteBoard(board.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      padding: '0.5rem 1rem',
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
          </div>
        )}
      </div>
    </div>
  );
}