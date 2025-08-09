// pages/api/boards/index.js - Fixed version with safe tasks handling
import { getBoardsByUser, addBoard, readData } from '@/lib/data';
import { verifyToken } from '@/lib/auth';
import * as cookie from 'cookie';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function writeData(data) {
  await fs.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export default async function handler(req, res) {
  console.log('Boards API called:', req.method, req.query);
  
  const { token } = cookie.parse(req.headers.cookie || '');
  const user = verifyToken(token);
  
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { id, action } = req.query;

    // Handle individual board operations when ID is provided
    if (id) {
      const data = await readData();
      
      // Ensure data structure exists
      if (!data.boards) data.boards = [];
      if (!data.tasks) data.tasks = [];
      if (!data.users) data.users = [];
      
      const boardIndex = data.boards.findIndex(b => b.id === id && b.userId === user.id);
      
      if (boardIndex === -1) {
        return res.status(404).json({ message: 'Board not found' });
      }

      // Handle PUT request (rename)
      if (req.method === 'PUT' || action === 'rename') {
        const { name } = req.body;
        
        if (!name || !name.trim()) {
          return res.status(400).json({ message: 'Board name is required' });
        }
        
        data.boards[boardIndex].name = name.trim();
        await writeData(data);
        
        console.log('Board renamed successfully');
        return res.status(200).json({ 
          message: 'Board renamed successfully',
          board: data.boards[boardIndex]
        });
      }

      // Handle DELETE request
      if (req.method === 'DELETE' || action === 'delete') {
        console.log('Before delete - boards:', data.boards.length, 'tasks:', data.tasks.length);
        
        // Remove the board
        data.boards.splice(boardIndex, 1);
        
        // Safely filter tasks (handle case where tasks array might not exist)
        data.tasks = (data.tasks || []).filter(task => task.boardId !== id);
        
        console.log('After delete - boards:', data.boards.length, 'tasks:', data.tasks.length);
        
        await writeData(data);
        
        console.log('Board deleted successfully');
        return res.status(200).json({ message: 'Board deleted successfully' });
      }
    }

    // Handle regular board operations
    if (req.method === 'GET') {
      const boards = await getBoardsByUser(user.id);
      return res.status(200).json(boards);
    }

    if (req.method === 'POST') {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: 'Board name is required' });

      const newBoard = { id: Date.now().toString(), userId: user.id, name };
      await addBoard(newBoard);
      return res.status(201).json(newBoard);
    }

    console.log('Method not allowed:', req.method);
    res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Boards API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}