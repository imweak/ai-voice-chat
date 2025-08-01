'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, User } from 'lucide-react';
import { useCallback } from 'react';

interface BottomNavItem {
  id: 'home' | 'profile';
  label: string;
  icon: React.ReactNode;
  path: string;
  activeIcon?: React.ReactNode;
}

const navigationItems: BottomNavItem[] = [
  {
    id: 'home',
    label: '홈',
    icon: <Home className="w-5 h-5" />,
    activeIcon: <Home className="w-5 h-5 fill-current" />,
    path: '/'
  },
  {
    id: 'profile',
    label: '프로필',
    icon: <User className="w-5 h-5" />,
    activeIcon: <User className="w-5 h-5 fill-current" />,
    path: '/profile'
  }
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // 하단바를 표시할 페이지인지 확인
  const shouldShowBottomNav = pathname === '/' || pathname === '/profile';

  if (!shouldShowBottomNav) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex flex-col items-center justify-center min-w-0 px-2 py-1 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-purple-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <div className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}>
                  {isActive ? item.activeIcon : item.icon}
                </div>
                
                <span className={`text-xs font-medium mt-0.5 transition-all duration-200 ${
                  isActive 
                    ? 'text-purple-400 opacity-100' 
                    : 'text-gray-400 opacity-75'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 