// Role-based access control utilities

export type UserRole = 'admin' | 'supervisor' | 'staff';

export interface RolePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  canManageStaff: boolean;
  canSendAlerts: boolean;
  canAccessAttendance: boolean;
  canCheckInOut: boolean;
  isReadOnly: boolean;
}

export function getRolePermissions(role: UserRole | null): RolePermissions {
  switch (role) {
    case 'admin':
      return {
        canEdit: true,
        canDelete: true,
        canCreate: true,
        canManageStaff: true,
        canSendAlerts: true,
        canAccessAttendance: true,
        canCheckInOut: true,
        isReadOnly: false,
      };
    case 'supervisor':
      return {
        canEdit: true,
        canDelete: true,
        canCreate: true,
        canManageStaff: true,
        canSendAlerts: true,
        canAccessAttendance: true,
        canCheckInOut: true,
        isReadOnly: false,
      };
    case 'staff':
      return {
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canManageStaff: false,
        canSendAlerts: false,
        canAccessAttendance: true,
        canCheckInOut: true,
        isReadOnly: true,
      };
    default:
      return {
        canEdit: false,
        canDelete: false,
        canCreate: false,
        canManageStaff: false,
        canSendAlerts: false,
        canAccessAttendance: false,
        canCheckInOut: false,
        isReadOnly: true,
      };
  }
}

export function getUserRoleFromLocalStorage(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const role = localStorage.getItem('sqRole');
  return (role as UserRole) || null;
}

export function isUserAdmin(role: UserRole | null): boolean {
  return role === 'admin';
}

export function isUserSupervisor(role: UserRole | null): boolean {
  return role === 'supervisor';
}

export function isUserStaff(role: UserRole | null): boolean {
  return role === 'staff';
}

export function canUserEdit(role: UserRole | null): boolean {
  return getRolePermissions(role).canEdit;
}

export function canUserDelete(role: UserRole | null): boolean {
  return getRolePermissions(role).canDelete;
}

export function canUserCreate(role: UserRole | null): boolean {
  return getRolePermissions(role).canCreate;
}

export function canUserSendAlerts(role: UserRole | null): boolean {
  return getRolePermissions(role).canSendAlerts;
}

export function canAccessAttendance(role: UserRole | null): boolean {
  return getRolePermissions(role).canAccessAttendance;
}

export function canCheckInOut(role: UserRole | null): boolean {
  return getRolePermissions(role).canCheckInOut;
}

export function getRoleBadgeColor(role: UserRole | null): string {
  switch (role) {
    case 'admin':
      return 'bg-red-900/30 text-red-400 border-red-600';
    case 'supervisor':
      return 'bg-blue-900/30 text-blue-400 border-blue-600';
    case 'staff':
      return 'bg-green-900/30 text-green-400 border-green-600';
    default:
      return 'bg-brand-dark/50 text-brand-accent border-brand-border';
  }
}
