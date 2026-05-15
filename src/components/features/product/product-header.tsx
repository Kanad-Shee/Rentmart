import { Navbar } from "@/components/common/navbar";

const navItems = [
  { href: "/#featured", label: "Marketplace", active: true },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Support" },
  { href: "/terms", label: "Terms" },
];

export function ProductHeader() {
  return (
    <Navbar
      brand="Rentmart"
      links={navItems}
      authActions={{
        signIn: { href: "/sign-in", label: "Sign In" },
        signUp: { href: "/sign-up", label: "Sign Up" },
        dashboard: { href: "/dashboard/overview", label: "Dashboard" },
        settings: { href: "/dashboard/settings", label: "Settings" },
      }}
      actions={[
        {
          href: "/dashboard/add-listing",
          label: "List Equipment",
          variant: "primary",
        },
      ]}
    />
  );
}
