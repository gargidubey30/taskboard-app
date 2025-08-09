// pages/api/tasks/[id].js
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";
const dataFilePath = path.join(process.cwd(), 'data.json');

function verifyToken(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function parseCookies(cookieString) {
  const cookies = {};
  if (!cookieString) return cookies;
  
  cookieString.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

async function readData() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const initialData = { users: [], boards: [], tasks: [] };
      await fs.promises.writeFile(dataFilePath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    
    const raw = await fs.promises.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(raw);
    
    if (!data.users) data.users = [];
    if (!data.boards) data.boards = [];
    if (!data.tasks) data.tasks = [];
    
    return data;
  } catch (error) {
    console.error('Error reading data:', error);
    return { users: [], boards: [], tasks: [] };
  }
}

async function writeData(data) {
  try {
    await fs.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

export default async function handler(req, res) {
  console.log(`Individual Task API - ${req.method} - Task: ${req.query.id}`);
  
  try {
    // Parse cookies and authenticate
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies.token;
    const user = verifyToken(token);
    
    if (!user) {
      console.log('❌ Unauthorized - no valid token');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log('✅ User authenticated:', user.username);

    const { id: taskId } = req.query;
    const data = await readData();

    // Find the task and verify ownership
    const taskIndex = data.tasks.findIndex(t => t.id === taskId && t.userId === user.id);
    
    if (taskIndex === -1) {
      console.log('❌ Task not found or access denied');
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    const task = data.tasks[taskIndex];
    console.log('✅ Task found:', task.title);

    // Handle PUT request (update task)
    if (req.method === 'PUT') {
      const { title, description, status } = req.body;
      console.log('📝 Updating task:', { title, description, status });
      
      // Update task properties
      if (title !== undefined) {
        data.tasks[taskIndex].title = title.trim();
      }
      if (description !== undefined) {
        data.tasks[taskIndex].description = description.trim();
      }
      if (status !== undefined) {
        data.tasks[taskIndex].status = status;
      }

      // Save changes
      const saved = await writeData(data);
      
      if (!saved) {
        console.log('❌ Failed to save task updates');
        return res.status(500).json({ message: 'Failed to update task' });
      }

      console.log('✅ Task updated successfully');
      return res.status(200).json(data.tasks[taskIndex]);
    }

    // Handle DELETE request
    if (req.method === 'DELETE') {
      console.log('🗑️ Deleting task:', task.title);
      
      // Remove task from array
      data.tasks.splice(taskIndex, 1);
      
      // Save changes
      const saved = await writeData(data);
      
      if (!saved) {
        console.log('❌ Failed to save after task deletion');
        return res.status(500).json({ message: 'Failed to delete task' });
      }

      console.log('✅ Task deleted successfully');
      return res.status(200).json({ message: 'Task deleted successfully' });
    }

    // Method not allowed
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('💥 Individual Task API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}