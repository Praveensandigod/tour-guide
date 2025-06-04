
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Map, Bookmark, User, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Navigation items for authenticated users
  const authenticatedNavItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
    },
    {
      name: 'Explore',
      path: '/recommendations',
      icon: Search,
    },
    {
      name: 'Map',
      path: '/map',
      icon: Map,
    },
    {
      name: 'Saved',
      path: '/saved',
      icon: Bookmark,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
    },
  ];

  // Navigation items for unauthenticated users
  const unauthenticatedNavItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
    },
    {
      name: 'Login',
      path: '/login',
      icon: LogIn,
    },
  ];

  const navItems = isAuthenticated ? authenticatedNavItems : unauthenticatedNavItems;

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/90 backdrop-blur-sm z-50">
      <div className={`grid max-w-md mx-auto ${isAuthenticated ? 'grid-cols-5' : 'grid-cols-2'}`}>
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-item p-3 ${isActive(item.path) ? 'active' : ''}`}
          >
            <item.icon size={20} className={`mb-1 ${isActive(item.path) ? 'text-primary' : ''}`} />
            <span className={`${isActive(item.path) ? 'text-primary' : ''}`}>{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
