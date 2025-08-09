// lib/data.js - Updated with safe initialization
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data.json");

// Ensure the file exists with proper structure
function ensureFile() {
  if (!fs.existsSync(dataFilePath)) {
    const initialData = { 
      users: [], 
      boards: [], 
      tasks: [] 
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2), "utf8");
  }
}

async function readData() {
  ensureFile();
  const raw = await fs.promises.readFile(dataFilePath, "utf8");
  const data = JSON.parse(raw);
  
  // Ensure all required arrays exist
  if (!data.users) data.users = [];
  if (!data.boards) data.boards = [];
  if (!data.tasks) data.tasks = [];
  
  return data;
}

async function writeData(obj) {
  // Ensure all required arrays exist before writing
  const safeObj = {
    users: obj.users || [],
    boards: obj.boards || [],
    tasks: obj.tasks || []
  };
  await fs.promises.writeFile(dataFilePath, JSON.stringify(safeObj, null, 2), "utf8");
}

// Export readData for external use
export { readData };

export async function getAllUsers() {
  const data = await readData();
  return data.users || [];
}

export async function getUserByUsername(username) {
  const users = await getAllUsers();
  return users.find((u) => u.username === username) || null;
}

export async function addUser(user) {
  const data = await readData();
  data.users = data.users || [];
  data.users.push(user);
  await writeData(data);
  return user;
}

export async function getBoardsByUser(userId) {
  const data = await readData();
  return (data.boards || []).filter((b) => b.userId === userId);
}

export async function addBoard(board) {
  const data = await readData();
  data.boards = data.boards || [];
  data.boards.push(board);
  await writeData(data);
  return board;
}

export async function getTasksByBoard(boardId) {
  const data = await readData();
  return (data.tasks || []).filter((t) => t.boardId === boardId);
}

export async function addTask(task) {
  console.log('addTask called with:', task);
  const data = await readData();
  
  // Ensure tasks array exists
  if (!data.tasks) {
    console.log('Tasks array was missing, creating it');
    data.tasks = [];
  }
  
  data.tasks.push(task);
  console.log('Task added, total tasks now:', data.tasks.length);
  
  await writeData(data);
  return task;
}

export async function updateTaskById(taskId, patch) {
  const data = await readData();
  data.tasks = data.tasks || [];
  const idx = data.tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;
  data.tasks[idx] = { ...data.tasks[idx], ...patch };
  await writeData(data);
  return data.tasks[idx];
}

export async function deleteTaskById(taskId) {
  const data = await readData();
  data.tasks = (data.tasks || []).filter((t) => t.id !== taskId);
  await writeData(data);
  return true;
}