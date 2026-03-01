import React, { Component, ErrorInfo, ReactNode } from "react";
import ButtonPrimary from "./buttons/ButtonPrimary";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50 p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-indigo-100">
            <div className="text-6xl mb-4">😅</div>
            <h1 className="text-2xl font-bold text-indigo-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-indigo-600 mb-6">
              The application encountered an unexpected error. Don't worry, your
              data is safe!
            </p>
            {this.state.error && (
              <pre className="text-left bg-gray-50 p-4 rounded-lg text-xs text-red-600 mb-6 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <ButtonPrimary
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Reload Page
            </ButtonPrimary>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
