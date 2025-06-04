import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { UserRole } from './clientsService';

interface UserContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isAdmin: boolean;
}

const defaultContext: UserContextType = {
  userRole: 'user',
  setUserRole: () => {},
  isAdmin: false
};

export const UserContext = createContext<UserContextType>(defaultContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>(() => {
    // Initialize from localStorage if available
    const savedRole = localStorage.getItem('userRole');
    return (savedRole === 'admin' ? 'admin' : 'user') as UserRole;
  });
  
  const isAdmin = userRole === 'admin';
  
  console.log('UserProvider rendering, userRole:', userRole, 'isAdmin:', isAdmin);
  
  // Check localStorage for role changes
  useEffect(() => {
    const checkUserRole = () => {
      const savedRole = localStorage.getItem('userRole');
      if (savedRole && savedRole !== userRole) {
        console.log('UserRole updated from localStorage:', savedRole);
        setUserRole(savedRole as UserRole);
      }
    };
    
    // Check immediately and set up interval
    checkUserRole();
    
    // Check for changes periodically
    const interval = setInterval(checkUserRole, 500);
    
    return () => {
      clearInterval(interval);
    };
  }, [userRole]);
  
  return (
    <UserContext.Provider value={{ userRole, setUserRole, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
