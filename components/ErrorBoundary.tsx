'use client';

import React, { ReactNode, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.reset) || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-offwhite to-white px-4">
            <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h1 className="text-xl font-black text-red-600">Something went wrong</h1>
              </div>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                We encountered an unexpected error. Try refreshing the page or contact support if the problem persists.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200 max-h-32 overflow-auto">
                <p className="text-xs font-mono text-slate-600">
                  {this.state.error.message}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={this.reset}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 px-4 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
