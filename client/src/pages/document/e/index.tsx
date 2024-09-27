import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TextEditor from '@/components/drive/TextEditor'
import { decodeFolder } from '@/utils/helpers'

export default function ViewEditorPage() {
  const navigate = useNavigate()
  const [permission, setPermission] = useState('READ')

  const { id, edit } = useParams<{ id: string; edit: string }>()

  useEffect(() => {
    if (!id) {
      navigate('/404')
    } else {
      const updatePermission = edit === 'edit' || edit === 'new'
      setPermission(updatePermission ? 'WRITE' : 'READ')
    }
  }, [edit, id, navigate])

  const documentId = decodeFolder(id as string)
  return (
    <div className='view-editor-page'>
      <TextEditor
        documentPermission={permission}
        decodedDocumentId={documentId}
        documentAction={edit as string}
      />
    </div>
  )
}

// import React, { useEffect } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'

// import TextEditor from '@/components/drive/TextEditor'

// export default function ViewEditorPage() {
//   const navigate = useNavigate()

//   const { id, edit, type } = useParams<{
//     id: string
//     edit: string
//     type: string
//   }>()

//   useEffect(() => {
//     if (id) {
//       console.log(`/document/${type}/${id}/${edit}`)

//       navigate(`/document/${type}/${id}/${edit}`)
//     }
//   }, [edit, id, navigate, type])

//   return (
//     <>
//       <TextEditor type={type} id={id} edit={edit} />
//     </>
//   )
// }
