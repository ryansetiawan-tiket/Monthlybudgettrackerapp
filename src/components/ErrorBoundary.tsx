import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Oops! Terjadi Kesalahan</CardTitle>
              <CardDescription>
                Aplikasi mengalami error yang tidak terduga. Silakan refresh untuk mencoba lagi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Details (collapsible) */}
              {this.state.error && (
                <details className="p-4 bg-muted rounded-lg text-sm">
                  <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">
                    Detail Error (untuk developer)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <p className="font-mono text-xs text-destructive break-all">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={this.handleRefresh}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="size-4 mr-2" />
                  Refresh Aplikasi
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Home className="size-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Jika masalah terus berlanjut, coba:</p>
                <ul className="mt-2 space-y-1 text-left list-disc list-inside">
                  <li>Periksa koneksi internet Anda</li>
                  <li>Clear cache browser</li>
                  <li>Tutup dan buka aplikasi kembali</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
