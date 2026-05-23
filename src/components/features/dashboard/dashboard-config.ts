import type { User } from '@/lib/auth';

export type DashboardRole = 'admin' | 'renter' | 'owner';
export type SidebarIcon =
  | 'barChart3'
  | 'calendarDays'
  | 'clipboardList'
  | 'filePlus2'
  | 'heart'
  | 'layoutDashboard'
  | 'logOut'
  | 'messagesSquare'
  | 'receiptText'
  | 'settings'
  | 'shieldCheck'
  | 'users'
  | 'wrench'
  | 'bell';

export type SidebarItem = {
  label: string;
  href: string;
  icon: SidebarIcon;
  active?: boolean;
  badge?: string;
};

export type SidebarSection = {
  title?: string;
  items: SidebarItem[];
};

export type RoleConfig = {
  brand: string;
  subtitle: string;
  searchPlaceholder: string;
  profileName: string;
  profileRole: string;
  sidebar: SidebarSection[];
};

export const roleConfigs: Record<DashboardRole, RoleConfig> = {
  admin: {
    brand: 'Rentmart',
    subtitle: 'Management Portal',
    searchPlaceholder: 'Search listings...',
    profileName: 'Admin User',
    profileRole: 'Super Admin',
    sidebar: [
      {
        title: 'Platform',
        items: [
          {
            label: 'Overview',
            href: '/dashboard/overview',
            icon: 'layoutDashboard'
          },
          {
            label: 'Chart View',
            href: '/dashboard/chart-view',
            icon: 'barChart3'
          },
          {
            label: 'Verifications',
            href: '/dashboard/verifications',
            icon: 'shieldCheck',
            badge: '12'
          },
          {
            label: 'User Management',
            href: '/dashboard/users',
            icon: 'users'
          },
          {
            label: 'Categories',
            href: '/dashboard/categories',
            icon: 'clipboardList'
          },
          {
            label: 'Notifications',
            href: '/dashboard/notifications',
            icon: 'bell',
            badge: '3'
          },
          {
            label: 'Support Queries',
            href: '/dashboard/support-queries',
            icon: 'messagesSquare'
          },
          {
            label: 'Transactions',
            href: '/dashboard/transactions',
            icon: 'receiptText'
          }
        ]
      },
      {
        title: 'Account',
        items: [
          { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
          { label: 'Logout', href: '/logout', icon: 'logOut' }
        ]
      }
    ]
  },
  renter: {
    brand: 'Rentmart',
    subtitle: 'DASHBOARD',
    searchPlaceholder: 'Search equipment, rentals, or owners...',
    profileName: 'John Miller',
    profileRole: 'Premium Renter',
    sidebar: [
      {
        items: [
          {
            label: 'Overview',
            href: '/dashboard/overview',
            icon: 'layoutDashboard'
          },
          {
            label: 'My Bookings',
            href: '/dashboard/bookings',
            icon: 'calendarDays'
          },
          {
            label: 'Transactions',
            href: '/dashboard/transactions',
            icon: 'receiptText'
          },
          {
            label: 'My Wishlists',
            href: '/dashboard/saved',
            icon: 'heart'
          },
          {
            label: 'Notifications',
            href: '/dashboard/notifications',
            icon: 'bell',
            badge: '3'
          },
          { label: 'Settings', href: '/dashboard/settings', icon: 'settings' }
        ]
      },
      {
        items: [{ label: 'Logout', href: '/logout', icon: 'logOut' }]
      }
    ]
  },
  owner: {
    brand: 'Rentmart',
    subtitle: 'OWNER DASHBOARD',
    searchPlaceholder: 'Search orders...',
    profileName: 'Kanad',
    profileRole: 'Fleet Manager',
    sidebar: [
      {
        items: [
          {
            label: 'Overview',
            href: '/dashboard/overview',
            icon: 'layoutDashboard'
          },
          {
            label: 'My Equipment',
            href: '/dashboard/equipment',
            icon: 'wrench'
          },
          {
            label: 'Add Listing',
            href: '/dashboard/add-listing',
            icon: 'filePlus2'
          },
          {
            label: 'Rental Requests',
            href: '/dashboard/rental-requests',
            icon: 'calendarDays'
          },
          {
            label: 'Notifications',
            href: '/dashboard/notifications',
            icon: 'bell',
            badge: '3'
          }
        ]
      },
      {
        items: [
          { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
          { label: 'Logout', href: '/logout', icon: 'logOut' }
        ]
      }
    ]
  }
};

export function getDashboardRole(user: User): DashboardRole {
  switch (user.role) {
    case 'ADMIN':
      return 'admin';
    case 'RENTER':
      return 'renter';
    case 'OWNER':
    default:
      return 'owner';
  }
}

export function getRoleConfigForUser(user: User) {
  const role = getDashboardRole(user);
  const baseConfig = roleConfigs[role];

  return {
    role,
    config: {
      ...baseConfig,
      profileName: user.fullName,
      profileRole:
        role === 'admin'
          ? 'Platform Admin'
          : role === 'owner'
            ? 'Equipment Owner'
            : 'Verified Renter'
    }
  };
}
