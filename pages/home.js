// pages/home.js - Your main landing page
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem',
          marginBottom: '1rem',
          color: '#333',
          fontWeight: 'bold'
        }}>
          📋 TaskBoard
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Organize your tasks with beautiful, intuitive boards. 
          Create multiple boards for different projects and keep everything organized.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <Link 
            href="/login"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}
          >
            Login
          </Link>
          
          <Link 
            href="/register"
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}
          >
            Sign Up
          </Link>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          <h3 style={{ marginTop: 0, color: '#333', fontSize: '1.2rem' }}>
            ✨ Features
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#666' }}>
            <li>Create multiple task boards</li>
            <li>Add, edit, and delete tasks</li>
            <li>Mark tasks as complete</li>
            <li>Secure user authentication</li>
            <li>Mobile-friendly design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}