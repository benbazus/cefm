import {
  IconLayoutDashboard,
  IconFileText,
  IconFiles,
  IconFileSpreadsheet,
  IconShare,
  IconPhoto,
  IconTrash,
  IconFileWord,
  IconFileMusic,
  IconVideo,
  IconPdf,
} from '@tabler/icons-react'

export interface NavLink {
  title: string
  label?: string
  href: string
  icon: JSX.Element
}

export interface SideLink extends NavLink {
  sub?: NavLink[]
}

export const sidelinks: SideLink[] = [
  {
    title: 'Dashboard',
    label: '',
    href: '/',
    icon: <IconLayoutDashboard size={18} color='blue' />,
  },
  {
    title: 'My Drives',
    href: '/drive/home',
    icon: <IconFiles size={18} color='gray' />,
  },
  {
    title: 'PDF Documents',
    href: '/drive/pdf',
    icon: <IconPdf size={18} color='red' />,
  },
  {
    title: 'Documents',
    href: '/drive/document',
    icon: <IconFileText size={18} color='green' />,
  },
  {
    title: 'Excel Documents',
    href: '/drive/excel',
    icon: <IconFileSpreadsheet size={18} color='green' />,
  },
  {
    title: 'Word Documents',
    href: '/drive/word',
    icon: <IconFileWord size={18} color='blue' />,
  },
  {
    title: 'Photo Files',
    href: '/drive/photo',
    icon: <IconPhoto size={18} color='purple' />,
  },
  {
    title: 'Video Files',
    href: '/drive/video',
    icon: <IconVideo size={18} color='orange' />,
  },
  {
    title: 'Audio Files',
    href: '/drive/audio',
    icon: <IconFileMusic size={18} color='pink' />,
  },

  {
    title: 'Shared',
    href: '/drive/share',
    icon: <IconShare size={18} color='cyan' />,
  },
  {
    title: 'Trash',
    href: '/drive/trash',
    icon: <IconTrash size={18} color='red' />,
  },
]
