// pages/api/boards/[id]/tasks.js
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
  console.log(`Tasks API - ${req.method} - Board: ${req.query.id}`);
  
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies.token;
    const user = verifyToken(token);
    
    if (!user) {
      console.log('❌ Unauthorized');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log('✅ User authenticated:', user.username);

    const { id: boardId } = req.query;
    const data = await readData();
    console.log('📊 Data loaded - Boards:', data.boards.length, 'Tasks:', data.tasks.length);

    const board = data.boards.find(b => b.id === boardId && b.userId === user.id);
    if (!board) {
      console.log('❌ Board not found');
      return res.status(404).json({ message: 'Board not found' });
    }
    
    console.log('✅ Board found:', board.name);

    if (req.method === 'GET') {
      const tasks = data.tasks.filter(task => task.boardId === boardId && task.userId === user.id);
      console.log('✅ Returning', tasks.length, 'tasks');
      return res.status(200).json(tasks);
    }

    if (req.method === 'POST') {
      const { title, description } = req.body;
      console.log('📝 Creating task:', title);
      
      if (!title?.trim()) {
        return res.status(400).json({ message: 'Task title is required' });
      }

      const newTask = {
        id: Date.now().toString(),
        boardId,
        userId: user.id,
        title: title.trim(),
        description: (description || '').trim(),
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      data.tasks.push(newTask);
      const saved = await writeData(data);
      
      if (!saved) {
        return res.status(500).json({ message: 'Failed to save task' });
      }

      console.log('✅ Task created successfully:', newTask.title);
      return res.status(201).json(newTask);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('💥 Tasks API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}