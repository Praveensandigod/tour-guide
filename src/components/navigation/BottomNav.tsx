
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Compass, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="container mx-auto px-2">
        <div className="h-16 flex items-center justify-between">
          <div className="absolute top-0 left-4 transform -translate-y-1/2 bg-background p-2 rounded-full border shadow-sm">
            <Logo />
          </div>
          <div className="flex justify-around items-center w-full">
            <NavItem 
              to="/" 
              icon={<Home className={cn("h-5 w-5", isActive('/') ? "text-primary" : "text-muted-foreground")} />} 
              label="Home"
              active={isActive('/')}
            />
            <NavItem 
              to="/recommendations" 
              icon={<Compass className={cn("h-5 w-5", isActive('/recommendations') ? "text-primary" : "text-muted-foreground")} />} 
              label="Explore"
              active={isActive('/recommendations')}
            />
            <NavItem 
              to="/map" 
              icon={<Map className={cn("h-5 w-5", isActive('/map') ? "text-primary" : "text-muted-foreground")} />} 
              label="Map"
              active={isActive('/map')}
            />
            <NavItem 
              to="/saved" 
              icon={<Bookmark className={cn("h-5 w-5", isActive('/saved') ? "text-primary" : "text-muted-foreground")} />} 
              label="Saved"
              active={isActive('/saved')}
            />
            <NavItem 
              to="/profile" 
              icon={<User className={cn("h-5 w-5", isActive('/profile') ? "text-primary" : "text-muted-foreground")} />} 
              label="Profile"
              active={isActive('/profile')}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => (
  <Link 
    to={to} 
    className={cn(
      "flex flex-col items-center justify-center w-16",
      active ? "text-primary" : "text-muted-foreground"
    )}
  >
    <div>{icon}</div>
    <span className="text-xs mt-1">{label}</span>
  </Link>
);

export default BottomNav;
