'use client';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Page not found
      </h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/dashboard"
        style={{
          padding: '0.5rem 1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #ccc',
          background: '#fff',
          textDecoration: 'none',
          fontSize: '0.875rem',
          color: '#333',
        }}
      >
        Go to Dashboard
      </a>
    </div>
  );
}
