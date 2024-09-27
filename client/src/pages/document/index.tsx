import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import TextEditor from '@/components/drive/TextEditor'

export default function EditorPage() {
  const navigate = useNavigate()
  const { id, name } = useParams<{ id: string; name: string }>()

  useEffect(() => {
    if (id) {
      //window.open(`/document/${id}`, '_blank')
      navigate(`/document/${id}`)
    } else {
      //  window.open(`/document/${uuidv4()}`, '_blank')
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

// import React, { useEffect } from 'react'
// import { useNavigate, useParams } from 'react-router-dom'
// import { v4 as uuidv4 } from 'uuid'
// import TextEditor from '@/components/drive/TextEditor'

// export default function EditorPage() {
//   const navigate = useNavigate()
//   const { id, name } = useParams<{ id: string; name: string }>()

//   useEffect(() => {
//     if (id) {
//       //window.open(`/document/${id}`, '_blank')
//       navigate(`/document/${id}`)
//     } else {
//       //  window.open(`/document/${uuidv4()}`, '_blank')
//       navigate(`/document/${uuidv4()}`)
//     }
//   }, [id, navigate])

//   return (
//     <>
//       <TextEditor documentName={name || 'Untitled Document'} />
//     </>
//   )
// }
