import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'
import useIsCollapsed from '@/hooks/use-is-collapsed'
import SkipToMain from './skip-to-main'
import { Layout } from './custom/layout'
import { Search } from './search'

import { UserNav } from './user-nav'

export default function AppShell() {
  const [isCollapsed, setIsCollapsed] = useIsCollapsed()
  return (
    <div className='relative h-full overflow-hidden bg-background'>
      <SkipToMain />
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        id='content'
        className={`overflow-x-hidden pt-16 transition-[margin] md:overflow-y-hidden md:pt-0 ${isCollapsed ? 'md:ml-14' : 'md:ml-64'} h-full`}
      >
        <Layout>
          <Layout.Header>
            <div className='flex w-full items-center justify-between'>
              <Search />
              <div className='flex items-center space-x-4'>
                <UserNav />
              </div>
            </div>
          </Layout.Header>
          <Layout.Body className='flex flex-col'>
            <Outlet />
          </Layout.Body>
        </Layout>
      </main>
    </div>
  )
}
