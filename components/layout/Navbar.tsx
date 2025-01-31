import { UserNav } from "@/components/layout/user-nav";
import { SheetMenu } from "@/components/layout/sheet-menu";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">{title}</h1>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <form className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-64 lg:w-96"
            />
          </form>

          <UserNav />
        </div>
      </div>
    </header>
  );
}
