import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { href: "/contacts", label: "Контакты" },
  { href: "/events", label: "События" },
];

export function Navigation() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex h-16 items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm">{user?.email}</span>
            <Button onClick={() => logout()} variant="outline">
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
