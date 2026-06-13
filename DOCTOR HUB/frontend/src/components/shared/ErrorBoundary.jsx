import { Component } from 'react';
import { Link } from 'react-router-dom';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Dashboard error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
          <p className="font-heading text-4xl font-bold text-alert">500</p>
          <h2 className="mt-2 font-heading text-xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-sm text-white/50">Try refreshing the page.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="btn-primary mt-6"
          >
            Try Again
          </button>
          <Link to="/" className="mt-3 text-sm text-teal hover:underline">
            Go Home
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
