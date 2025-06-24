import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // You can also log error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: '#b91c1c', background: '#fef2f2', borderRadius: 8, margin: 32 }}>
          <h2>Something went wrong in this part of the app.</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>
            {this.state.error && this.state.error.toString()}
            {'\n'}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
} 