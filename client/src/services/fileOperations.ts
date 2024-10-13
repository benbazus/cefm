// import { getValidToken } from '@/utils/helpers'

// const API_URL = '/api'

// export interface FileItem {
//   id: string
//   name: string
//   type: 'file' | 'folder'
//   size?: number
//   url?: string
//   folderId?: string
// }

// export const createFolder = async (name: string, parentId?: string) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/folders`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ name, parentId }),
//   })
//   if (!response.ok) throw new Error('Failed to create folder')
//   return response.json()
// }

// export const uploadFiles = async (files: File[], folderId?: string) => {
//   const token = await getValidToken()
//   const formData = new FormData()
//   files.forEach((file) => formData.append('files', file))
//   if (folderId) formData.append('folderId', folderId)

//   const response = await fetch(`${API_URL}/files/upload`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     body: formData,
//   })
//   if (!response.ok) throw new Error('Failed to upload files')
//   return response.json()
// }

// export const uploadFolder = async (
//   folderInput: HTMLInputElement,
//   parentId?: string
// ) => {
//   const files = folderInput.files
//   if (!files) return

//   const token = await getValidToken()
//   const formData = new FormData()
//   for (let i = 0; i < files.length; i++) {
//     const file = files[i]
//     const relativePath = file.webkitRelativePath
//     const pathParts = relativePath.split('/')
//     const fileName = pathParts.pop()
//     const folderPath = pathParts.join('/')

//     formData.append('files', file)
//     formData.append('filePaths', folderPath)
//     formData.append('fileNames', fileName || '')
//   }
//   if (parentId) formData.append('parentId', parentId)

//   const response = await fetch(`${API_URL}/folders/upload`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     body: formData,
//   })
//   if (!response.ok) throw new Error('Failed to upload folder')
//   return response.json()
// }

// export const deleteFile = async (fileId: string) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/files/${fileId}`, {
//     method: 'DELETE',
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//   if (!response.ok) throw new Error('Failed to delete file')
// }

// export const deleteFolder = async (folderId: string) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/folders/${folderId}`, {
//     method: 'DELETE',
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//   if (!response.ok) throw new Error('Failed to delete folder')
// }

// export const renameFile = async (fileId: string, newName: string) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/files/${fileId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ name: newName }),
//   })
//   if (!response.ok) throw new Error('Failed to rename file')
//   return response.json()
// }

// export const renameFolder = async (folderId: string, newName: string) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/folders/${folderId}`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ name: newName }),
//   })
//   if (!response.ok) throw new Error('Failed to rename folder')
//   return response.json()
// }

// export const shareFile = async (fileId: string, sharedWithUserId: string) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/files/${fileId}/share`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ sharedWithUserId }),
//   })
//   if (!response.ok) throw new Error('Failed to share file')
//   return response.json()
// }

// export const getSharedFiles = async () => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/files/shared`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//   if (!response.ok) throw new Error('Failed to get shared files')
//   return response.json()
// }

// export const removeSharedAccess = async (
//   fileId: string,
//   sharedWithUserId: string
// ) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/files/${fileId}/share`, {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ sharedWithUserId }),
//   })
//   if (!response.ok) throw new Error('Failed to remove shared access')
//   return response.json()
// }

// export const searchFiles = async (query: string) => {
//   const token = await getValidToken()
//   const response = await fetch(
//     `${API_URL}/files/search?query=${encodeURIComponent(query)}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   )
//   if (!response.ok) throw new Error('Failed to search files')
//   return response.json()
// }

// export const restoreFileVersionWithVersionId = async (
//   fileId: string,
//   versionId: string
// ) => {
//   const token = await getValidToken()
//   const response = await fetch(
//     `${API_URL}/files/${fileId}/versions/${versionId}/restore`,
//     {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   )
//   if (!response.ok) throw new Error('Failed to restore file version')
//   return response.json()
// }

// export const moveItem = async (
//   itemId: string,
//   newParentId: string,
//   isFolder: boolean
// ) => {
//   const token = await getValidToken()
//   const endpoint = isFolder ? 'folders' : 'files'
//   const response = await fetch(`${API_URL}/${endpoint}/${itemId}/move`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ newParentId }),
//   })
//   if (!response.ok) throw new Error('Failed to move item')
//   return response.json()
// }

// export const copyItem = async (
//   itemId: string,
//   newParentId: string,
//   isFolder: boolean
// ) => {
//   const token = await getValidToken()
//   const endpoint = isFolder ? 'folders' : 'files'
//   const response = await fetch(`${API_URL}/${endpoint}/${itemId}/copy`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ newParentId }),
//   })
//   if (!response.ok) throw new Error('Failed to copy item')
//   return response.json()
// }

// export const updateFilePermissions = async (
//   fileId: string,
//   permissions: string
// ) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/files/${fileId}/permissions`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ permissions }),
//   })
//   if (!response.ok) throw new Error('Failed to update file permissions')
//   return response.json()
// }

// export const updateFolderPermissions = async (
//   folderId: string,
//   permissions: string
// ) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/folders/${folderId}/permissions`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ permissions }),
//   })
//   if (!response.ok) throw new Error('Failed to update folder permissions')
//   return response.json()
// }

// export const createActivity = async (
//   itemId: string,
//   activityType: string,
//   details: string
// ) => {
//   const token = await getValidToken()
//   const response = await fetch(`${API_URL}/activities`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({ itemId, activityType, details }),
//   })
//   if (!response.ok) throw new Error('Failed to create activity')
//   return response.json()
// }
