import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import SearchInput from '../search-input';
import { UserNav } from './user-nav';
import { ThemeSelector } from '../theme-selector';
import { ModeToggle } from './theme/theme-toggle';

export default function Header() {
  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-linear-to-r from-background via-primary/2 to-background backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1 hover:bg-primary/10 transition-colors' />
        <Separator orientation='vertical' className='mr-2 h-4 bg-border/50' />

        {/* Breadcrumb or page indicator could go here */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </div>
      </div>

      <div className='flex items-center gap-2 px-4'>
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
        <UserNav />
        <ModeToggle />
        <ThemeSelector />
      </div>
    </header>
  );
}