'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { navItems } from '@/config/nav-config';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useUser } from '@clerk/nextjs';
import { useFilteredNavItems } from '@/hooks/use-nav';
import {
  IconChevronRight,
  IconChevronsDown,
  IconLogout,
  IconUserCircle
} from '@tabler/icons-react';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import type { NavItem } from '@/types';

export default function AppSidebar() {
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { user } = useUser();
  const router = useRouter();
  const filteredItems = useFilteredNavItems(navItems);

  return (
    <Sidebar collapsible='icon' className="border-r border-border/50">
      {/* Enhanced Header with Logo */}
      <SidebarHeader className="border-b border-border/50 bg-linear-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3 px-3 py-4 group cursor-pointer">
          <div className="relative shrink-0">
            <img
              src="/finovo-icon.png"
              alt="Finovo"
              className="w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            />
            <div className="absolute inset-0 bg-[#fe9a00]/20 blur-md group-hover:bg-[#fe9a00]/40 transition-all duration-300 rounded-full" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-xl bg-linear-to-r from-[#fe9a00] to-[#ffb84d] bg-clip-text text-transparent">
              Finovo
            </span>
            <span className="text-xs text-muted-foreground">Financial Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/70">
            Overview
          </SidebarGroupLabel>
          <SidebarMenu>
            {filteredItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon as keyof typeof Icons] : Icons.logo;
              const isActive = pathname === item.url;

              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        className="hover:bg-primary/10 transition-all duration-200 data-[active=true]:bg-linear-to-r data-[active=true]:from-primary/15 data-[active=true]:to-primary/5 data-[active=true]:border-l-2 data-[active=true]:border-primary"
                      >
                        {item.icon && <Icon className="transition-transform duration-200 group-hover/collapsible:scale-110" />}
                        <span className="font-medium">{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem: NavItem) => {
                          const isSubActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className="hover:bg-primary/10 transition-all duration-200 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className="hover:bg-primary/10 transition-all duration-200 data-[active=true]:bg-linear-to-r data-[active=true]:from-primary/15 data-[active=true]:to-primary/5 data-[active=true]:border-l-2 data-[active=true]:border-primary group/item"
                  >
                    <Link href={item.url}>
                      <Icon className="transition-transform duration-200 group-hover/item:scale-110" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 bg-linear-to-br from-primary/5 to-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-primary/10 data-[state=open]:text-primary hover:bg-primary/10 transition-all duration-200'
                >
                  {user && (
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg border-2 border-primary/20'
                      showInfo
                      user={user}
                    />
                  )}
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg shadow-lg border-border/50'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5 bg-linear-to-br from-primary/5 to-transparent'>
                    {user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={user}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive transition-colors">
                  <IconLogout className='mr-2 h-4 w-4' />
                  <SignOutButton redirectUrl='/' />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}