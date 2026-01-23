export type NavItem = {
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
  shortcut?: string[];
  items: NavItem[];
  access?: {
    plan?: string;
    feature?: string;
  };
};
