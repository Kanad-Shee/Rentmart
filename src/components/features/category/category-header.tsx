import { Navbar } from '@/components/common/navbar';

const navItems = ['Marketplace', 'About Us', 'Support', 'Terms'];

export function CategoryHeader() {
  return (
    <Navbar
      brand="RENTMART"
      links={navItems.map((item, index) => ({
        href:
          item === 'Marketplace'
            ? '/#featured'
            : item === 'About Us'
              ? '/about'
              : item === 'Support'
                ? '/contact'
                : '/terms',
        label: item,
        active: index === 0
      }))}
      search={{ placeholder: 'Search equipment...' }}
      authActions={{
        signIn: { href: '/sign-in', label: 'Sign In' },
        signUp: { href: '/sign-up', label: 'Sign Up' },
        dashboard: { href: '/dashboard/overview', label: 'Dashboard' },
        settings: { href: '/dashboard/settings', label: 'Settings' }
      }}
      className="bg-white/95"
    />
  );
}
