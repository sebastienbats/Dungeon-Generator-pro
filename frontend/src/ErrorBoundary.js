import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error Boundary a capturé une erreur:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" style={{ 
          padding: '2rem', 
          textAlign: 'center',
          background: '#1a1a2e',
          borderRadius: '16px',
          border: '1px solid #d63031',
          color: '#e0e0e0',
          margin: '1rem'
        }}>
          <h2 style={{ color: '#d63031' }}>⚠️ Une erreur est survenue</h2>
          <p style={{ color: '#888' }}>{this.state.error?.message || 'Erreur inconnue'}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#6c5ce7',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem',
              fontSize: '1rem'
            }}
          >
            🔄 Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
