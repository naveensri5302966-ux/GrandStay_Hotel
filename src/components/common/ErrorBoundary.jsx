import { Component } from "react";
import Button from "./Button";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unexpected rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#F8FBFF]">
          <div className="max-w-xl w-full border border-[#D7E2EA] bg-white p-8 md:p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600 border border-red-200">
              ⚠
            </div>

            <p className="mt-5 text-[9px] tracking-[3px] uppercase text-[#2F7FC1] font-semibold">
              Error Boundary Activated
            </p>

            <h2 className="mt-2 font-serif text-3xl text-[#0F2942]">
              Something went wrong
            </h2>

            <p className="mt-3 text-xs leading-6 text-[#5A738E]">
              An unexpected error occurred while rendering this section of the application.
              Our error boundary caught it gracefully to prevent full-screen crashes.
            </p>

            {this.state.error && (
              <div className="mt-6 border border-red-200 bg-red-50/50 p-4 text-left">
                <p className="text-[10px] font-mono text-red-700 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                variant="primary"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
