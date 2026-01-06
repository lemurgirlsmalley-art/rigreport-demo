import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { Role, DemoUser, Permissions } from '@/lib/types';

const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  admin: {
    canEdit: true,
    canDelete: true,
    canAddBoats: true,
    canManageUsers: true,
    canChangeStatus: true,
    canViewAllOrganizations: true,
    canReportDamage: true,
    canResolveMaintenance: true,
  },
  coach: {
    canEdit: true,
    canDelete: false,
    canAddBoats: true,
    canManageUsers: false,
    canChangeStatus: true,
    canViewAllOrganizations: true,
    canReportDamage: true,
    canResolveMaintenance: true,
  },
  volunteer: {
    canEdit: false,
    canDelete: false,
    canAddBoats: false,
    canManageUsers: false,
    canChangeStatus: false,
    canViewAllOrganizations: true,
    canReportDamage: true,
    canResolveMaintenance: false,
  },
  junior_sailor: {
    canEdit: false,
    canDelete: false,
    canAddBoats: false,
    canManageUsers: false,
    canChangeStatus: false,
    canViewAllOrganizations: false,
    canReportDamage: true,
    canResolveMaintenance: false,
  },
};

const DEMO_USERS: Record<Role, DemoUser> = {
  admin: {
    id: 'demo-admin',
    name: 'Sarah Admin',
    email: 'admin@rigreport.demo',
    role: 'admin',
    organization: 'ASC',
  },
  coach: {
    id: 'demo-coach',
    name: 'Mike Coach',
    email: 'coach@rigreport.demo',
    role: 'coach',
    organization: 'ACS',
  },
  volunteer: {
    id: 'demo-volunteer',
    name: 'Tom Volunteer',
    email: 'volunteer@rigreport.demo',
    role: 'volunteer',
    organization: 'SOA',
  },
  junior_sailor: {
    id: 'demo-junior',
    name: 'Alex Junior',
    email: 'junior@rigreport.demo',
    role: 'junior_sailor',
    organization: 'ASC',
  },
};

interface DemoAuthContextValue {
  user: DemoUser | null;
  role: Role;
  permissions: Permissions;
  setRole: (role: Role) => void;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const DemoAuthContext = createContext<DemoAuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'rigreport_demo_role';

interface DemoAuthProviderProps {
  children: ReactNode;
}

export function DemoAuthProvider({ children }: DemoAuthProviderProps) {
  const [role, setRoleState] = useState<Role>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in ROLE_PERMISSIONS) {
        return stored as Role;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'admin';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // Ignore localStorage errors
    }
  }, [role]);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
  };

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const value: DemoAuthContextValue = {
    user: isAuthenticated ? DEMO_USERS[role] : null,
    role,
    permissions: ROLE_PERMISSIONS[role],
    setRole,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>
  );
}

export function useDemoAuth(): DemoAuthContextValue {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
}
