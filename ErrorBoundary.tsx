import React, { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Loma Beach]', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          className="min-h-dvh flex flex-col items-center justify-center px-6 py-10 font-sans bg-sand-tan text-deep-sea-blue text-center"
          role="alert"
        >
          <h1 className="font-serif text-2xl md:text-3xl italic mb-4 text-deep-sea-blue">Something went wrong</h1>
          <p className="text-deep-sea-brown/80 font-light max-w-md mb-6 leading-relaxed">
            We&apos;re sorry — please refresh the page or try again. If the problem continues, check the browser console
            for details.
          </p>
          <pre className="w-full max-w-lg text-left text-sm p-4 rounded-2xl bg-white/80 border border-deep-sea-blue/10 overflow-auto mb-8">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="min-h-11 min-w-[11rem] px-8 py-3 rounded-full font-bold bg-sunset-pink text-white hover:bg-deep-sea-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
