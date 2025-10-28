import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout, updateUserRole } from '@/store/slices/authSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Role } from '@/lib/types';

export const TopBar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleRoleChange = (role: Role) => {
    if (user) {
      dispatch(updateUserRole({ ...user, role }));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = (role: Role) => {
    const roleMap = {
      manager: 'Manager',
      sales_rep: 'Sales Rep',
      viewer: 'Viewer',
    };
    return roleMap[role];
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary">Pactle</h1>
          <span className="text-sm text-muted-foreground">Quotation Manager</span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{getRoleDisplay(user.role)}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Switch Role
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('manager')}
                    className={`cursor-pointer focus:!bg-primary/10 focus:!text-foreground ${
                      user.role === 'manager' 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    <UserIcon className={`mr-2 h-4 w-4 ${
                      user.role === 'manager' ? 'text-primary-foreground' : ''
                    }`} />
                    Manager
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('sales_rep')}
                    className={`cursor-pointer focus:!bg-primary/10 focus:!text-foreground ${
                      user.role === 'sales_rep' 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    <UserIcon className={`mr-2 h-4 w-4 ${
                      user.role === 'sales_rep' ? 'text-primary-foreground' : ''
                    }`} />
                    Sales Representative
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange('viewer')}
                    className={`cursor-pointer focus:!bg-primary/10 focus:!text-foreground ${
                      user.role === 'viewer' 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-primary/10'
                    }`}
                  >
                    <UserIcon className={`mr-2 h-4 w-4 ${
                      user.role === 'viewer' ? 'text-primary-foreground' : ''
                    }`} />
                    Viewer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
