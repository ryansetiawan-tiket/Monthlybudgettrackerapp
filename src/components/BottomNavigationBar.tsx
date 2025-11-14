import { Home, Wallet, Calendar } from 'lucide-react';
import { cn } from './ui/utils';

interface BottomNavigationBarProps {
  activeTab: 'home' | 'pockets' | 'calendar';
  onTabChange: (tab: 'home' | 'pockets' | 'calendar') => void;
}

export function BottomNavigationBar({ activeTab, onTabChange }: BottomNavigationBarProps) {
  const tabs = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'pockets' as const,
      label: 'Kantong',
      icon: Wallet,
    },
    {
      id: 'calendar' as const,
      label: 'Kalender',
      icon: Calendar,
    },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50", // Increase z-index to 50 (above FAB z-40)
        "bg-card border-t border-border",
        "h-16",
        "md:hidden", // Mobile only
        "safe-area-pb" // iOS safe area
      )}
      style={{
        // Force hardware acceleration untuk prevent janky movement
        transform: 'translateZ(0)',
        willChange: 'auto',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <div className="h-full flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center",
                "flex-1 h-full",
                "transition-colors duration-200",
                "active:scale-95",
                "min-w-0" // Prevent overflow
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  "w-6 h-6 mb-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-xs transition-colors truncate",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}