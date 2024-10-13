import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import TextEditor from '@/components/drive/TextEditor'

export default function EditorPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    if (id) {
      navigate(`/document/${id}`)
    } else {
      navigate(`/document/${uuidv4()}`)
    }
  }, [id, navigate])

  return (
    <>
      <TextEditor
        documentPermission={''}
        decodedDocumentId={''}
        documentAction={''}
      />
    </>
  )
}
