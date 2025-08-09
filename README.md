# TaskBoard Application

A full-stack task management application built with Next.js.

## Features

- **User Authentication**: Secure registration and login system with JWT
- **Multiple Boards**: Create and manage multiple task boards (e.g., Work, Personal, Shopping)
- **Task Management**: Add, edit, complete, and delete tasks within boards
- **Secure Access**: Users can only access their own boards and tasks
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js (React), CSS-in-JS styling
- **Backend**: Next.js API routes (RESTful)
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies
- **Database**: JSON file storage
- **Security**: Protected routes, user data isolation

## Live Demo

This application is deployed and running on CodeSandbox.

## How to Use

1. **Register**: Create a new account with username and password
2. **Login**: Access your personal dashboard
3. **Create Boards**: Add boards for different categories (Work, Personal, etc.)
4. **Manage Tasks**: Click on any board to add, edit, complete, or delete tasks
5. **Stay Organized**: Tasks are automatically organized by status (Pending/Completed)

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET/POST /api/boards` - List/Create boards
- `PUT/DELETE /api/boards/[id]` - Update/Delete boards
- `GET/POST /api/boards/[id]/tasks` - List/Create tasks
- `PUT/DELETE /api/tasks/[id]` - Update/Delete tasks

## Development

Built as part of a full-stack development assessment, demonstrating:
- React/Next.js frontend development
- RESTful API design
- Authentication and authorization
- Database operations
- User interface design
- Error handling and validation
