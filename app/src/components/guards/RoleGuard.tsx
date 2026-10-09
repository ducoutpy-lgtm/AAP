import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserType } from '../../types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserType[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (!allowedRoles.includes(userProfile.userType)) {
    // Redirection vers le dashboard approprié
    const redirectPath = userProfile.userType === 'porteur'
      ? '/dashboard/porteur'
      : userProfile.userType === 'financeur'
      ? '/dashboard/financeur'
      : '/admin';

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
