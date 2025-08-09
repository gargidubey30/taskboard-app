// // pages/index.js - Redirect approach if direct routing fails
// import { useEffect } from 'react';
// import { useRouter } from 'next/router';
// import Link from 'next/link';

// export default function IndexPage() {
//   const router = useRouter();

//   // Simple component that works as home page
//   return (
//     <div style={{ 
//       minHeight: '100vh',
//       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '2rem'
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '3rem',
//         borderRadius: '12px',
//         boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
//         textAlign: 'center',
//         maxWidth: '500px',
//         width: '100%'
//       }}>
//         <h1 style={{ 
//           fontSize: '2.5rem',
//           marginBottom: '1rem',
//           color: '#333',
//           fontWeight: 'bold'
//         }}>
//           📋 TaskBoard
//         </h1>
        
//         <p style={{ 
//           fontSize: '1.2rem',
//           color: '#666',
//           marginBottom: '2rem',
//           lineHeight: '1.6'
//         }}>
//           Organize your tasks with beautiful, intuitive boards. 
//           Create multiple boards for different projects and keep everything organized.
//         </p>

//         <div style={{
//           display: 'flex',
//           gap: '1rem',
//           justifyContent: 'center',
//           flexWrap: 'wrap',
//           marginBottom: '2rem'
//         }}>
//           <button
//             onClick={() => router.push('/login')}
//             style={{
//               backgroundColor: '#007bff',
//               color: 'white',
//               padding: '0.75rem 1.5rem',
//               borderRadius: '8px',
//               border: 'none',
//               fontSize: '1.1rem',
//               fontWeight: '500',
//               cursor: 'pointer'
//             }}
//           >
//             Login
//           </button>
          
//           <button
//             onClick={() => router.push('/register')}
//             style={{
//               backgroundColor: '#28a745',
//               color: 'white',
//               padding: '0.75rem 1.5rem',
//               borderRadius: '8px',
//               border: 'none',
//               fontSize: '1.1rem',
//               fontWeight: '500',
//               cursor: 'pointer'
//             }}
//           >
//             Sign Up
//           </button>
//         </div>

//         <div style={{
//           backgroundColor: '#f8f9fa',
//           padding: '1.5rem',
//           borderRadius: '8px',
//           textAlign: 'left'
//         }}>
//           <h3 style={{ marginTop: 0, color: '#333', fontSize: '1.2rem' }}>
//             ✨ Features
//           </h3>
//           <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#666' }}>
//             <li>Create multiple task boards</li>
//             <li>Add, edit, and delete tasks</li>
//             <li>Mark tasks as complete</li>
//             <li>Secure user authentication</li>
//             <li>Mobile-friendly design</li>
//           </ul>
//         </div>

//         <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#999' }}>
//           Index page is working! ✅
//         </div>
//       </div>
//     </div>
//   );
// }
// pages/index.js - Simple redirect solution
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '1.2rem'
    }}>
      <div>Redirecting to home...</div>
    </div>
  );
}
