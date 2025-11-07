import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { motion } from 'motion/react';

interface ErrorFallbackProps {
  error?: Error | string;
  resetErrorBoundary?: () => void;
  type?: 'network' | 'database' | 'unknown';
  onRetry?: () => void;
}

export function ErrorFallback({ 
  error, 
  resetErrorBoundary, 
  type = 'unknown',
  onRetry 
}: ErrorFallbackProps) {
  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          title: 'Koneksi Terputus',
          description: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
        };
      case 'database':
        return {
          icon: AlertTriangle,
          title: 'Database Error',
          description: 'Terjadi masalah saat mengakses data. Silakan coba lagi.',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Terjadi Kesalahan',
          description: 'Aplikasi mengalami error. Silakan refresh untuk mencoba lagi.',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[400px] flex items-center justify-center p-4"
    >
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className={`mx-auto w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center`}
          >
            <Icon className={`size-8 ${config.color}`} />
          </motion.div>
          <div>
            <CardTitle className="text-xl">{config.title}</CardTitle>
            <CardDescription className="mt-2">
              {config.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Message */}
          {error && typeof error === 'string' && (
            <div className="p-3 bg-muted rounded-lg text-sm text-center text-muted-foreground">
              {error}
            </div>
          )}

          {/* Retry Button */}
          <Button
            onClick={handleRefresh}
            className="w-full"
            size="lg"
          >
            <RefreshCw className="size-4 mr-2" />
            Coba Lagi
          </Button>

          {/* Online Status Indicator */}
          {type === 'network' && (
            <div className="flex items-center justify-center gap-2 text-sm">
              {navigator.onLine ? (
                <>
                  <Wifi className="size-4 text-green-500" />
                  <span className="text-muted-foreground">Internet Terhubung</span>
                </>
              ) : (
                <>
                  <WifiOff className="size-4 text-destructive" />
                  <span className="text-muted-foreground">Tidak Ada Koneksi</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
