import type { Menu } from '@/components/layout/authenticated/types/menu'
import type { Project } from '@/components/layout/authenticated/types/project'

export const projects: Array<Project> = [
  {
    name: 'My Project',
    logo: 'folder',
    desc: 'Default project',
  },
  {
    name: 'Team Project',
    logo: 'users',
    desc: 'Shared workspace',
  },
]

export const sidebarData: Menu[] = [
  {
    title: 'General',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: 'layout-dashboard',
      },
      {
        title: 'Tasks',
        url: '/tasks',
        icon: 'list-todo',
      },
      {
        title: 'Apps',
        url: '/apps',
        icon: 'package',
      },
      {
        title: 'Chats',
        url: '/chats',
        badge: '3',
        icon: 'message-square',
      },
      {
        title: 'Users',
        url: '/users',
        icon: 'users',
      },
      {
        title: 'Secured by Clerk',
        icon: 'log-in',
        items: [
          {
            title: 'Sign In',
            url: '/clerk/sign-in',
          },
          {
            title: 'Sign Up',
            url: '/clerk/sign-up',
          },
          {
            title: 'User Management',
            url: '/clerk/user-management',
          },
        ],
      },
    ],
  },
  {
    title: 'Pages',
    items: [
      {
        title: 'Auth',
        icon: 'shield-check',
        items: [
          {
            title: 'Sign In',
            url: '/sign-in',
          },
          {
            title: 'Sign In (2 Col)',
            url: '/sign-in-2',
          },
          {
            title: 'Sign Up',
            url: '/sign-up',
          },
          {
            title: 'Forgot Password',
            url: '/forgot-password',
          },
          {
            title: 'OTP',
            url: '/otp',
          },
        ],
      },
      {
        title: 'Errors',
        icon: 'bug',
        items: [
          {
            title: 'Unauthorized',
            url: '/errors/unauthorized',
            icon: 'lock',
          },
          {
            title: 'Forbidden',
            url: '/errors/forbidden',
            icon: 'user-x',
          },
          {
            title: 'Not Found',
            url: '/errors/not-found',
            icon: 'file-x',
          },
          {
            title: 'Internal Server Error',
            url: '/errors/internal-server-error',
            icon: 'server-off',
          },
          {
            title: 'Maintenance Error',
            url: '/errors/maintenance-error',
            icon: 'construction',
          },
        ],
      },
    ],
  },
  {
    title: 'Other',
    items: [
      {
        title: 'Settings',
        icon: 'settings',
        items: [
          {
            title: 'Profile',
            url: '/settings',
            icon: 'user-cog',
          },
          {
            title: 'Account',
            url: '/settings/account',
            icon: 'wrench',
          },
          {
            title: 'Appearance',
            url: '/settings/appearance',
            icon: 'palette',
          },
          {
            title: 'Notifications',
            url: '/settings/notifications',
            icon: 'bell',
          },
          {
            title: 'Display',
            url: '/settings/display',
            icon: 'monitor',
          },
        ],
      },
      {
        title: 'Help Center',
        url: '/help-center',
        icon: 'help-circle',
      },
    ],
  },
]

export const topMenu = [
  {
    title: 'component:topMenu.overview',
    href: '/dashboard',
    isActive: true,
    disabled: false,
  },
  {
    title: 'component:topMenu.projects',
    href: '/projects',
    isActive: false,
    disabled: true,
  },
]
