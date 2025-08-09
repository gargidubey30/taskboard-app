// pages/api/boards/index.js - Fixed version with safe tasks handling
// import { getBoardsByUser, addBoard, readData } from '@/lib/data';
// import { verifyToken } from '@/lib/auth';
// import * as cookie from 'cookie';
// import fs from 'fs';
// import path from 'path';

// const dataFilePath = path.join(process.cwd(), 'data.json');

// async function writeData(data) {
//   await fs.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
// }

// export default async function handler(req, res) {
//   console.log('Boards API called:', req.method, req.query);
  
//   const { token } = cookie.parse(req.headers.cookie || '');
//   const user = verifyToken(token);
  
//   if (!user) return res.status(401).json({ message: 'Unauthorized' });

//   try {
//     const { id, action } = req.query;

//     // Handle individual board operations when ID is provided
//     if (id) {
//       const data = await readData();
      
//       // Ensure data structure exists
//       if (!data.boards) data.boards = [];
//       if (!data.tasks) data.tasks = [];
//       if (!data.users) data.users = [];
      
//       const boardIndex = data.boards.findIndex(b => b.id === id && b.userId === user.id);
      
//       if (boardIndex === -1) {
//         return res.status(404).json({ message: 'Board not found' });
//       }

//       // Handle PUT request (rename)
//       if (req.method === 'PUT' || action === 'rename') {
//         const { name } = req.body;
        
//         if (!name || !name.trim()) {
//           return res.status(400).json({ message: 'Board name is required' });
//         }
        
//         data.boards[boardIndex].name = name.trim();
//         await writeData(data);
        
//         console.log('Board renamed successfully');
//         return res.status(200).json({ 
//           message: 'Board renamed successfully',
//           board: data.boards[boardIndex]
//         });
//       }

//       // Handle DELETE request
//       if (req.method === 'DELETE' || action === 'delete') {
//         console.log('Before delete - boards:', data.boards.length, 'tasks:', data.tasks.length);
        
//         // Remove the board
//         data.boards.splice(boardIndex, 1);
        
//         // Safely filter tasks (handle case where tasks array might not exist)
//         data.tasks = (data.tasks || []).filter(task => task.boardId !== id);
        
//         console.log('After delete - boards:', data.boards.length, 'tasks:', data.tasks.length);
        
//         await writeData(data);
        
//         console.log('Board deleted successfully');
//         return res.status(200).json({ message: 'Board deleted successfully' });
//       }
//     }

//     // Handle regular board operations
//     if (req.method === 'GET') {
//       const boards = await getBoardsByUser(user.id);
//       return res.status(200).json(boards);
//     }

//     if (req.method === 'POST') {
//       const { name } = req.body;
//       if (!name) return res.status(400).json({ message: 'Board name is required' });

//       const newBoard = { id: Date.now().toString(), userId: user.id, name };
//       await addBoard(newBoard);
//       return res.status(201).json(newBoard);
//     }

//     console.log('Method not allowed:', req.method);
//     res.status(405).json({ message: 'Method not allowed' });
    
//   } catch (error) {
//     console.error('Boards API error:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }

// }

// pages/api/boards/index.js - Fixed imports
import { getBoardsByUser, addBoard, readData } from '@/lib/data';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-this";

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

function verifyToken(token) {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Manual data operations for in-memory storage
async function writeDataManual(data) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Update global memory storage
    global.appData = {
      users: data.users || [],
      boards: data.boards || [],
      tasks: data.tasks || []
    };
    console.log('💾 Updated memory storage');
  } else {
    // Write to file in development
    const fs = await import('fs');
    const path = await import('path');
    const dataFilePath = path.join(process.cwd(), 'data.json');
    await fs.promises.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('💾 Updated file storage');
  }
}

export default async function handler(req, res) {
  console.log('Boards API called:', req.method, req.query);
  
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies.token;
    const user = verifyToken(token);
    
    if (!user) {
      console.log('❌ Unauthorized');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    console.log('✅ User authenticated:', user.username);

    const { id, action } = req.query;

    // Handle individual board operations when ID is provided
    if (id) {
      console.log('🎯 Individual board operation:', { id, action, method: req.method });
      
      const data = await readData();

      // Find board and verify ownership
      const boardIndex = data.boards.findIndex(b => b.id === id && b.userId === user.id);
      
      if (boardIndex === -1) {
        console.log('❌ Board not found or access denied');
        return res.status(404).json({ message: 'Board not found' });
      }

      // Handle PUT request (rename)
      if (req.method === 'PUT' || action === 'rename') {
        const { name } = req.body;
        
        if (!name || !name.trim()) {
          return res.status(400).json({ message: 'Board name is required' });
        }
        
        // Update board name
        data.boards[boardIndex].name = name.trim();
        
        // Save changes
        await writeDataManual(data);
        
        console.log('✅ Board renamed successfully');
        return res.status(200).json({ 
          message: 'Board renamed successfully',
          board: data.boards[boardIndex]
        });
      }

      // Handle DELETE request
      if (req.method === 'DELETE' || action === 'delete') {
        console.log('🗑️ Deleting board:', data.boards[boardIndex].name);
        
        // Remove board
        data.boards.splice(boardIndex, 1);
        
        // Remove associated tasks
        data.tasks = data.tasks.filter(task => task.boardId !== id);
        
        // Save changes
        await writeDataManual(data);
        
        console.log('✅ Board deleted successfully');
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

    console.log('❌ Method not allowed:', req.method);
    res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('💥 Boards API error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

