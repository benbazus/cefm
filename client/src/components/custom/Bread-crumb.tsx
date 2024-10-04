import * as React from 'react'
import { cn } from '@/lib/utils'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useFolder } from '@/contexts/FolderContext'

interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
  separator?: React.ReactNode
  homeLabel?: string
  homeIcon?: React.ReactNode
}

const BreadCrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, separator, homeLabel = 'Home', homeIcon, ...props }, ref) => {
    const location = useLocation()
    const pathnames = location.pathname.split('/').filter((x) => x)

    const { folderName } = useFolder()

    const isWord = (str: string) => /^[a-zA-Z]+$/.test(str)

    const decodeIfNeeded = (str: string) => {
      if (!isWord(str)) {
        try {
          return decodeURIComponent(atob(str))
        } catch (e) {
          console.error('Failed to decode:', e)
          return str
        }
      }
      return str
    }

    const lastPathSegment = pathnames[pathnames.length - 1]
    const decodedLastSegment = decodeIfNeeded(lastPathSegment)

    console.log(' ====== BreadcrumbProps ========= ')
    console.log(pathnames)
    console.log(lastPathSegment)
    console.log(decodedLastSegment)
    console.log(folderName)
    console.log(' ====== BreadcrumbProps ========= ')

    return (
      <nav
        ref={ref}
        aria-label='breadcrumb'
        className={cn('py-2', className)}
        {...props}
      >
        <ol className='flex items-center space-x-2'>
          <li>
            <Link to='/' className='text-gray-500 hover:text-gray-700'>
              {homeIcon || homeLabel}
            </Link>
          </li>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
            const isLast = index === pathnames.length - 1

            return (
              <React.Fragment key={routeTo}>
                <li className='text-gray-400'>
                  {separator || <ChevronRight className='h-4 w-4' />}
                </li>
                <li
                  className={
                    isLast ? 'font-medium text-gray-800' : 'text-gray-500'
                  }
                >
                  {isLast ? (
                    // <span>{folderName || decodedLastSegment}</span>

                    <span>{folderName}</span>
                  ) : (
                    <Link to={routeTo} className='hover:text-gray-700'>
                      {isWord(name) ? name : decodeIfNeeded(name)}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            )
          })}
        </ol>
      </nav>
    )
  }
)

BreadCrumb.displayName = 'BreadCrumb'

export { BreadCrumb }

// import * as React from 'react'
// import { cn } from '@/lib/utils'
// import { Link, useLocation } from 'react-router-dom'
// import { ChevronRight } from 'lucide-react'
// import { useFolder } from '@/contexts/FolderContext'

// interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'> {
//   separator?: React.ReactNode
//   homeLabel?: string
//   homeIcon?: React.ReactNode
// }

// const BreadCrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
//   ({ className, separator, homeLabel = 'Home', homeIcon, ...props }, ref) => {
//     const location = useLocation()
//     const pathnames = location.pathname.split('/').filter((x) => x)

//     const { folderName } = useFolder()

//     console.log(' +++++++++++folderName+++++++++++++++++++ ')
//     console.log(pathnames)
//     console.log(' +++++++++++folderName+++++++++++++++++++ ')

//     return (
//       <nav
//         ref={ref}
//         aria-label='breadcrumb'
//         className={cn('py-2', className)}
//         {...props}
//       >
//         <ol className='flex items-center space-x-2'>
//           <li>
//             <Link to='/' className='text-gray-500 hover:text-gray-700'>
//               {homeIcon || homeLabel}
//             </Link>
//           </li>
//           {pathnames.map((name, index) => {
//             const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
//             const isLast = index === pathnames.length - 1

//             return (
//               <React.Fragment key={routeTo}>
//                 <li className='text-gray-400'>
//                   {separator || <ChevronRight className='h-4 w-4' />}
//                 </li>
//                 <li
//                   className={
//                     isLast ? 'font-medium text-gray-800' : 'text-gray-500'
//                   }
//                 >
//                   {isLast ? (
//                     // Display folder name instead of path segment for the last item
//                     <span>{folderName || name}</span>
//                   ) : (
//                     <Link to={routeTo} className='hover:text-gray-700'>
//                       {name}
//                     </Link>
//                   )}
//                 </li>
//               </React.Fragment>
//             )
//           })}
//         </ol>
//       </nav>
//     )
//   }
// )

// BreadCrumb.displayName = 'BreadCrumb'

// export { BreadCrumb }
