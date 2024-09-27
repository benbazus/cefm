import SharedFile from '@/components/drive/shared-file'
import { useLocation } from 'react-router-dom'

export default function SharedFilePage() {
  const location = useLocation()
  const encodedId = location.pathname.split('/')[2] // Extract the encoded ID

  return (
    <>
      <SharedFile fileId={encodedId} />
    </>
  )
}
