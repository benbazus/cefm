import TextEditor from '@/components/drive/TextEditor'
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function ViewEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    if (id) {
      navigate(`/document/n/${id}`)
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
