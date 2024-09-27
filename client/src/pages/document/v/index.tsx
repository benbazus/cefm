import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TextEditor from '@/components/drive/TextEditor'
import { decodeFolder } from '@/utils/helpers'

export default function ViewEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string; name: string }>()

  useEffect(() => {
    const documentId = decodeFolder(id as string)

    console.log(' SSSSSSSSSSSSSS JET SSSSSSSSSSSS ')
    console.log(documentId)
    console.log(' SSSSSSSSSSSSSS JET SSSSSSSSSSSS ')

    if (id) {
      navigate(`/document/v/${id}`)
      //window.open(`/document/v/${id}`, '_blank')
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
