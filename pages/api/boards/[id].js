// pages/api/boards/[id].js
import { verifyToken } from '@/lib/auth';
import { readData } from '@/lib/data';
import cookie from 'cookie';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function writeData(data) {
  await fs.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export default async function handler(req, res) {
  try {
    // Parse cookies and verify user
    const { token } = cookie.parse(req.headers.cookie || '');
    const user = verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    // Read current data
    const data = await readData();
    const boardIndex = data.boards.findIndex(b => b.id === id && b.userId === user.id);
    
    if (boardIndex === -1) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Handle PUT request (rename)
    if (req.method === 'PUT') {
      const { name } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Board name is required' });
      }

      data.boards[boardIndex].name = name.trim();
      await writeData(data);
      
      return res.status(200).json({ 
        message: 'Board renamed successfully',
        board: data.boards[boardIndex]
      });
    }

    // Handle DELETE request
    if (req.method === 'DELETE') {
      // Remove the board
      data.boards.splice(boardIndex, 1);
      
      // Remove all tasks associated with this board
      data.tasks = data.tasks.filter(task => task.boardId !== id);
      
      await writeData(data);
      
      return res.status(200).json({ message: 'Board deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Board API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}