import { Component } from 'react';
import { Link } from 'react-router-dom';

class RouteErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // Preserve the original exception in development tools; the boundary only
    // provides a recovery screen and must not turn failures into silent ones.
    console.error('Route render failure:', error, errorInfo);
  }

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-error/20 bg-error-container p-8 text-center shadow-soft">
          <span className="material-symbols-outlined text-4xl text-error" aria-hidden="true">error</span>
          <h1 className="mt-3 text-headline-md font-headline-md text-error">This page could not be displayed</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            The issue has been logged to the browser console. You can safely return to the catalogue.
          </p>
          {import.meta.env.DEV ? (
            <p className="mt-3 break-words rounded-xl bg-surface-container-lowest/70 p-3 text-left font-mono text-xs text-error">
              {error.message}
            </p>
          ) : null}
          <Link
            to="/"
            onClick={() => this.setState({ error: null })}
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary"
          >
            Return to products
          </Link>
        </div>
      </div>
    );
  }
}

export default RouteErrorBoundary;
