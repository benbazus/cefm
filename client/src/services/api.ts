
// import { AccountFormValues, FileActivity, FilesResponse, FileWithProgress, FolderItem, GetFileCountResponse, GetFoldersResponse, ProfileFormValues, SharedLinkResponse, StorageInfo, UserResponse, VerificationResponse } from '@/types/types';
// import { handleError } from '@/utils/helpers';

// const chunkSize = 10 * 1024


// import axios, {
//     AxiosInstance,
//     AxiosRequestConfig,
//     AxiosResponse,
//     AxiosError,
// } from 'axios';
// import retry, { Options as RetryOptions } from 'async-retry';


// const API_URL = 'http://localhost:5000/api';

// // Define custom error type
// export interface ApiError extends Error {
//     response?: AxiosResponse;
//     status?: number;
// }

// // Create axios instances
// const createAxiosInstance = (useAuth: boolean): AxiosInstance => {
//     const instance = axios.create({
//         baseURL: API_URL,
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         withCredentials: useAuth,
//     });

//     if (useAuth) {
//         instance.interceptors.request.use(
//             (config) => {
//                 const accessToken = localStorage.getItem('accessToken');
//                 if (accessToken && config.headers) {
//                     config.headers.Authorization = `Bearer ${accessToken}`;
//                 }
//                 return config;
//             },
//             (error: AxiosError) => {
//                 return Promise.reject(error);
//             }
//         );


//         api.interceptors.response.use(
//             (response) => response,
//             async (error) => {
//                 const originalRequest = error.config;

//                 if (error.response.status === 401 && !originalRequest._retry) {
//                     originalRequest._retry = true;

//                     try {
//                         const refreshToken = localStorage.getItem('refreshToken');
//                         const response = await axios.post('/auth/refresh-token', { refreshToken });
//                         const { accessToken } = response.data;

//                         localStorage.setItem('accessToken', accessToken);
//                         api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

//                         return api(originalRequest);
//                     } catch (refreshError) {
//                         // Refresh token is invalid, logout the user
//                         localStorage.removeItem('accessToken');
//                         localStorage.removeItem('refreshToken');
//                         window.location.href = '/login';
//                         return Promise.reject(refreshError);
//                     }
//                 }

//                 return Promise.reject(error);
//             }
//         );

//     }

//     return instance;
// };

// const api = createAxiosInstance(true);
// const publicApi = createAxiosInstance(false);

// const retryOptions: RetryOptions = {
//     retries: 3,
//     factor: 2,
//     minTimeout: 1000,
//     maxTimeout: 30000,
//     onRetry: (err: Error, attempt: number) => {
//         console.warn(`Retry #${attempt} failed with error: ${err.message}`);
//     },
// };

// const axiosWithRetry = async <T>(config: AxiosRequestConfig, useAuth: boolean = true): Promise<AxiosResponse<T>> => {
//     const axiosInstance = useAuth ? api : publicApi;

//     return retry(
//         async (bail) => {
//             try {
//                 const response = await axiosInstance<T>(config);
//                 return response;
//             } catch (error) {
//                 if (axios.isAxiosError(error) && error.response) {
//                     if ([401, 402, 404].includes(error.response.status)) {
//                         bail(error);
//                         return Promise.reject(error);
//                     }
//                 }
//                 throw error;
//             }
//         },
//         retryOptions
//     );
// };

// export const axiosRequest = async <T>(config: AxiosRequestConfig, useAuth: boolean = true): Promise<AxiosResponse<T>> => {
//     try {
//         const response = await axiosWithRetry<T>(config, useAuth);
//         return response;
//     } catch (error) {
//         if (axios.isAxiosError(error)) {
//             const apiError: ApiError = new Error(error.message);
//             apiError.response = error.response;
//             apiError.status = error.response?.status;
//             throw apiError;
//         } else {
//             console.error('An unexpected error occurred:', error);
//             throw error;
//         }
//     }
// };

// export const publicAxiosRequest = async <T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
//     return axiosRequest<T>(config, false);
// };

// export const newVerification = async (code: string): Promise<VerificationResponse | null> => {
//     const config = {
//         method: 'GET',
//         url: `/auth/email-verification/${code}`
//     };

//     const response = await publicAxiosRequest(config);
//     return response ? (response.data as VerificationResponse) : null;
// }


// export const register = async (name: string, email: string, password: string) => {
//     try {
//         const config = {
//             method: 'POST',
//             url: '/auth/register',
//             data: { name, email, password },
//         };

//         const response = await publicAxiosRequest(config);
//         return response ? response.data : null;

//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const signIn = async (email: string, password: string, code: string) => {
//     try {


//         const config = {
//             method: 'POST',
//             url: '/auth/login',
//             data: { email, password, code },
//         };

//         const response = await publicAxiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         if (axios.isAxiosError(error) && error.response) {
//             throw new Error(error.response.data.error || 'An error occurred during login')
//         }
//         throw error
//     }
// }

// export const signIn2 = async (email: string, password: string, code: string) => {

//     const config = {
//         method: 'POST',
//         url: '/auth/login',
//         data: { email, password, code },
//     };

//     const response = await publicAxiosRequest(config);
//     return response ? response.data : null;
// }


// export const getPreview = async (fileId: string) => {

//     const config = {
//         method: 'GET',
//         url: `/files/preview/${fileId}`,
//     };

//     const response = await axiosRequest(config);

//     if (response) {
//         console.log(response.data);
//     }

//     return response ? response.data : null;
// };

// export const getSharedLink = async (fileId: string): Promise<SharedLinkResponse | null> => {
//     try {
//         const config = {
//             method: 'GET',
//             url: `/files/shared-link/${fileId}`,
//         };

//         const response = await axiosRequest(config);

//         return response ? (response.data as SharedLinkResponse) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const signOut = async (refreshToken: string) => {
//     try {
//         const config = {
//             method: 'POST',
//             url: '/auth/logout', data: { refreshToken },

//         };

//         const response = await axiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }







// export const getChildrenFoldersByParentFolderId = async (folderId: string | null): Promise<GetFoldersResponse | null> => {
//     try {
//         const response = await axiosRequest<GetFoldersResponse>({
//             method: 'GET',
//             url: `/folders/get-children-folders-folderId/${folderId}`,
//         })

//         if (response && response.data) {

//             const processedFolders = await Promise.all(
//                 response.data.folders.map(async (folder: FolderItem) => {
//                     const fileCount = await getFolderFileCount(folder.id)
//                     return { ...folder, fileCount }
//                 })
//             )

//             return {
//                 ...response.data,
//                 folders: processedFolders,
//             }
//         }

//         return null
//     } catch (error) {
//         console.error('Error fetching children folders:', error)
//         throw error
//     }
// }

// const getFolderFileCount = async (folderId: string): Promise<number> => {
//     try {
//         const response = await axiosRequest<GetFileCountResponse>({
//             method: 'GET',
//             url: `/folders/file-count/${folderId}`,
//         })


//         return response?.data?.count || 0
//     } catch (error) {
//         console.error('Error fetching folder file count:', error)
//         return 0
//     }
// }

// export const getPdf = async (): Promise<FilesResponse | null> => {
//     try {
//         const config = { method: 'GET', url: '/files/get-pdf' };

//         const response = await axiosRequest(config);

//         return response ? (response.data as FilesResponse) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const getWord = async (): Promise<FilesResponse | null> => {
//     try {
//         const config = { method: 'GET', url: '/files/get-word' };

//         const response = await axiosRequest(config);

//         return response ? (response.data as FilesResponse) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const getVideo = async (): Promise<FilesResponse | null> => {
//     try {
//         const config = { method: 'GET', url: '/files/get-video' };

//         const response = await axiosRequest(config);

//         return response ? (response.data as FilesResponse) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const getAudio = async (): Promise<FilesResponse | null> => {
//     try {
//         const config = { method: 'GET', url: '/files/get-audio' };

//         const response = await axiosRequest(config);

//         return response ? (response.data as FilesResponse) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const getFolderPath = async (folderId: string) => {

//     try {
//         const config = {
//             method: 'GET',
//             url: `/folders/${folderId}/path`
//         };

//         const response = await axiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const createNewDocument = async (name: string, folderId: string | null) => {

//     try {
//         const config = {
//             method: 'POST',
//             url: `/files/create-documents`,
//             data: { name, folderId }
//         };

//         const response = await axiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const createNewFolder = async (folderName: string, parentFolderId: string | null) => {

//     try {
//         const config = {
//             method: 'POST',
//             url: `/folders/create-folder`,
//             data: { folderName, parentFolderId }
//         };

//         const response = await axiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }


// export const getDocumentUsers = async (documentId: string) => {
//     try {

//         const config = {
//             method: 'GET',
//             url: `/documents/fetch-users/${documentId}`
//         };

//         const response = await axiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const changeFileSharePermission = async (
//     documentId: string,
//     permission: 'WRITE' | 'READ',

// ) => {

//     try {
//         const config = {
//             method: 'POST',
//             url: `/documents/${documentId}/change-fileShare-permission`,
//             data: JSON.stringify({
//                 documentId, permission,
//             }),
//         }

//         const response = await axiosRequest(config);

//         return response ? response.data : null;

//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }


// export const shareDocumentToUser = async (
//     documentId: string,
//     email: string,
//     message: string,
//     permission: 'WRITE' | 'READ',
//     currentUrl: string,
//     documentAccess: 'RESTRICTED' | 'ANYONE',
// ) => {


//     console.log(' ++++++++shareDocumentToUser+++++++++++++++++ ')
//     console.log(documentId)
//     console.log(email)
//     console.log(message)
//     console.log(permission)
//     console.log(currentUrl)
//     console.log(documentAccess)
//     console.log(' +++++++++shareDocumentToUser++++++++++++++++ ')

//     try {
//         const config = {
//             method: 'POST',
//             url: `/documents/${documentId}/share`,
//             data: JSON.stringify({
//                 email, documentId,
//                 message,
//                 permission,
//                 currentUrl,
//                 documentAccess,
//             }),
//         }

//         const response = await axiosRequest(config);

//         return response ? response.data : null;

//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const shareDocumentV1 = async (documentId: string, email: string, message: string, date: string, permission: string,
//     currentUrl: string) => {
//     try {
//         const config = {
//             method: 'POST',
//             url: `/documents/share-document`,
//             data: { documentId, email, message, date, permission, currentUrl }
//         };

//         const response = await axiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }



// export const shareDocument = async (documentId: string, email: string, message: string, date: string, isPasswordEnabled: boolean, permission: string,
//     currentUrl: string) => {
//     try {
//         const config = {
//             method: 'POST',
//             url: `/documents/share-document`,
//             data: { documentId, email, message, date, isPasswordEnabled, permission, currentUrl }
//         };

//         const response = await axiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const resetPassword = async (password: string, token: string) => {
//     try {
//         const config = {
//             method: 'POST',
//             url: `/auth/reset-password/${token}`,
//             data: { password }
//         };

//         const response = await publicAxiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const fetchUserData = async (): Promise<UserResponse | null> => {

//     try {
//         const config = {
//             method: 'GET',
//             url: '/auth/profile',
//         };

//         const response = await axiosRequest(config);

//         console.log(" +++++++ fetchUserData ++++++++++ ")
//         console.log(response)
//         console.log(" +++++++ fetchUserData ++++++++++ ")


//         return response ? (response.data as UserResponse) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const getRecentActivity = async (): Promise<FileActivity[] | null> => {

//     try {
//         const config = {
//             method: 'GET',
//             url: '/dashboard/recent-activity',
//         };

//         const response = await axiosRequest(config);

//         return response ? (response.data as FileActivity[]) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }


// export const getStorageInfo = async (): Promise<StorageInfo | null> => {
//     try {
//         const config = {
//             method: 'GET',
//             url: '/dashboard/storage-info',
//         };

//         const response = await axiosRequest(config);
//         return response ? (response.data as StorageInfo) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const getUserStats = async () => {

//     const config = {
//         method: 'GET',
//         url: '/dashboard/user-stats',
//     };

//     const response = await axiosRequest(config);

//     if (response) {
//         console.log(response.data);
//     }

//     return response ? response.data : null;
// };

// export const verifyOtp = async (email: string, otp: string) => {
//     try {

//         const config = {
//             method: 'POST',
//             url: '/auth/verify-otp',
//             data: { email, otp },
//         };

//         const response = await publicAxiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const resendOtp = async (email: string) => {

//     try {
//         const config = {
//             method: 'POST',
//             url: '/auth/resend-otp',
//             data: { email },
//         };

//         const response = await publicAxiosRequest(config);

//         return response ? response.data : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }

// }

// // export const signIn = async (email: string, password: string) => {
// //     try {
// //         const response = await publicApi.post('/auth/login', { email, password });
// //         return response.data;
// //     } catch (error) {
// //         handleError(error);
// //         throw error;
// //     }

// // };


// export async function uploadChunkService(file: File, data: string | ArrayBuffer | null, currentChunkIndex: number) {
//     const params = new URLSearchParams()
//     params.set('name', file.name)
//     params.set('size', file.size.toString())
//     params.set('currentChunkIndex', currentChunkIndex.toString())
//     params.set('totalChunks', Math.ceil(file.size / chunkSize).toString())

//     const headers = { 'Content-Type': 'application/octet-stream' }
//     //  const url = `http://localhost:4001/upload?${params.toString()}`

//     try {
//         const response = await api.post(`/files/uploadFiles?${params.toString()}`, data, { headers });
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }

// }


// export const uploadFile1 = async (
//     file: FileWithProgress,
//     onProgress: (progress: number) => void
// ) => {
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//         await api.post('/files/upload', formData, {
//             onUploadProgress: (progressEvent) => {
//                 const percentCompleted = Math.round(
//                     (progressEvent.loaded * 100) / progressEvent.total!
//                 );
//                 onProgress(percentCompleted);
//             },
//         });
//     } catch (error) {
//         console.error(`Error uploading file ${file.name}:`, error);
//         throw error;
//     }
// };

// export const uploadFiles = async (files: FileWithProgress[],
//     updateProgress: (file: FileWithProgress, progress: number) => void
// ) => {
//     const uploads = files.map(async (file) => {
//         await uploadFile1(file, (progress) => {
//             updateProgress(file, progress);
//         });
//     });

//     await Promise.all(uploads);
// };



// export const verifyToken = async (token: string) => {
//     try {
//         const response = await api.post('/auth/verify', { token });
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const getRootFolder = async () => {
//     try {
//         const response = await api.get('/folders/get-root-folder');
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const getRootChildren = async () => {
//     try {
//         const response = await api.get('/folders/get-root-children');
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const shareAFile = async (fileId: string, expirationDate: string | null, password: string | null,
//     sharedWith: string, shareWithMessage: string | null, isPasswordEnabled: boolean, isExpirationEnabled: boolean) => {
//     try {
//         const response = await api.post(`/files/share-file`, { fileId, sharedWith, password, expirationDate, shareWithMessage, isPasswordEnabled, isExpirationEnabled });
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const forgotPassword = async (email: string) => {
//     try {
//         const response = await publicApi.post('/auth/forgot-password', { email });
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const renameAFile = async (fileId: string, newName: string) => {
//     try {
//         const response = await api.post(`/files/rename/${fileId}`, { newName })
//         return response.data
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const renameFolder = async (folderId: string, newName: string) => {
//     try {
//         const response = await api.post(`/folders/rename/${folderId}`, { newName })
//         return response.data
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const getTotalFiles = async () => {
//     try {
//         const response = await api.get(`/dashboard/total-files`)
//         return response.data
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const getFileTypeDistribution = async () => {
//     try {
//         const response = await api.get(`/dashboard/type-distribution`)
//         return response.data
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const getStorageUsageHistory = async () => {
//     try {
//         const response = await api.get(`/dashboard/history`)
//         return response.data
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const getFileUploadsPerDay = async () => {
//     try {
//         const response = await api.get(`/dashboard/uploads-per-day`)
//         return response.data
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const getFileUpload = async () => {
//     try {
//         const response = await api.get(`/files/uploadv1`)
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const getFileUploadStatus = async () => {
//     try {
//         const response = await api.get(`/files/upload-status`)
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const getFileUploadRequest = async () => {
//     try {
//         const response = await api.get(`/files/upload-request`)
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const getFileDetails = async (fileId: string) => {
//     try {
//         const response = await api.get(`/files/details/${fileId}`)
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const moveToTrash = async (fileId: string) => {
//     try {
//         const response = await api.post(`/files/trash/${fileId}`)
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };



// export const copyShareLink = async (itemId: string) => {
//     try {
//         const response = await api.get(`/files/copy-link/${itemId}`)
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const uploadFilesAndFolders = async (
//     items: DataTransferItemList,
//     parentId: string,
//     onProgress: (progress: number) => void
// ) => {
//     const formData = new FormData()
//     formData.append('parentId', parentId)

//     console.log(" ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ ")
//     console.log(parentId)

//     console.log(items)

//     console.log('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ');

//     let totalSize = 0
//     let uploadedSize = 0

//     const processEntry = async (entry: FileSystemEntry, path: string) => {
//         if (entry.isFile) {
//             const fileEntry = entry as FileSystemFileEntry
//             const file = await new Promise<File>((resolve) => {
//                 fileEntry.file((file) => resolve(file))
//             })
//             formData.append('files', file, path)
//             totalSize += file.size
//         } else if (entry.isDirectory) {
//             const dirEntry = entry as FileSystemDirectoryEntry
//             const dirReader = dirEntry.createReader()
//             const entries = await new Promise<FileSystemEntry[]>((resolve) => {
//                 dirReader.readEntries((entries) => resolve(entries))
//             })
//             for (const childEntry of entries) {
//                 await processEntry(childEntry, `${path}/${childEntry.name}`)
//             }
//         }
//     }

//     for (let i = 0; i < items.length; i++) {
//         const item = items[i].webkitGetAsEntry()
//         if (item) {
//             await processEntry(item, item.name)
//         }
//     }

//     const response = await api.post(`/files/fileUpload`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         onUploadProgress: (progressEvent) => {
//             uploadedSize = progressEvent.loaded
//             const percentCompleted = Math.round((uploadedSize * 100) / totalSize)
//             onProgress(percentCompleted)
//         },
//     })

//     return response.data
// }

// export const filesUploadToServer = async (file: File, folderId: string | null, onProgress: (progress: number) => void) => {
//     const formData = new FormData()

//     const relativePath = file.webkitRelativePath

//     formData.append('folderId', folderId as string)
//     formData.append('relativePath', relativePath)

//     formData.append('file', file)

//     const response = await api.post('/files/file-upload-v1', formData, {
//         headers: {
//             'Content-Type': 'multipart/form-data',
//         },
//         onUploadProgress: (progressEvent) => {
//             if (progressEvent.total) {
//                 const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
//                 onProgress(percentCompleted)
//             }
//         },
//     })

//     return response.data
// }



// export const updateUserAccount = async (accountData: AccountFormValues) => {
//     const response = await api.put('/users/account', accountData);
//     return response.data;
// };

// export const updateUserProfile = async (profileData: ProfileFormValues) => {
//     const response = await api.put('/users/profile', profileData);
//     return response.data;
// }


// export const profile = async () => {
//     const response = await api.get('/auth/profile');
//     return response.data;
// };

// export const getUserProfile = async () => {
//     const response = await api.get('/auth/profile');
//     return response.data;
// };




// export const getSharedWithMe = async () => {
//     try {
//         const response = await api.get(`/files/get-sharedwithme`);
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const getShared = async () => {

//     try {

//         const response = await api.get(`/files/get-share`);
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const getTrashed = async () => {

//     try {

//         const response = await api.get(`/files/get-trash`);
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const getPhotos = async (): Promise<FilesResponse | null> => {
//     try {
//         const config = { method: 'GET', url: '/files/get-photo' };

//         const response = await axiosRequest(config);

//         return response ? (response.data as FilesResponse) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }


// export const getSharedItems = async (itemId: string) => {
//     try {
//         const response = await api.get(`/files/shared-file/${itemId}`);
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const getExcelFiles = async (): Promise<FilesResponse | null> => {
//     try {
//         const config = { method: 'GET', url: '/files/get-excel' };

//         const response = await axiosRequest(config);

//         return response ? (response.data as FilesResponse) : null;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const getCustomDocuments = async () => {

//     try {

//         const response = await api.get(`/files/get-custom-document`);

//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }



// export const getDocuments = async () => {

//     try {

//         const response = await api.get(`/files/get-document`);
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const checkPassword = async (password: string, fileId: string) => {

//     try {
//         const response = await publicApi.post('/files/check-password', { password, fileId });
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

// export const previewAFile = async (fileId: string) => {

//     try {
//         const response = await api.get(`/files/preview/${fileId}`);
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };



// export const downloadItem = async (
//     isFile: boolean | undefined,
//     itemId: string,
//     fileName: string
// ) => {
//     const endpoint = isFile
//         ? `/files/download-file/${itemId}`
//         : `/files/download-folder/${itemId}`;

//     try {


//         const response = await publicApi.get(endpoint, { responseType: 'blob' });

//         // Extract file name from Content-Disposition header or use default
//         const contentDisposition = response.headers['content-disposition'];
//         const extractedFileName = contentDisposition
//             ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
//             : isFile
//                 ? `file_${fileName}` // Default file name if not provided
//                 : `folder_${fileName}.zip`; // Default folder name with .zip extension

//         // Create a URL for the file or folder Blob
//         const url = window.URL.createObjectURL(new Blob([response.data]));
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', extractedFileName);
//         document.body.appendChild(link);
//         link.click();
//         link.remove();

//         // Revoke the object URL to free up memory
//         window.URL.revokeObjectURL(url);

//         return response.data;
//     } catch (error) {
//         handleError(error);
//         console.error('Download failed:', error);
//         throw error;
//     }
// };

// export const downloadItem1 = async (isFile: boolean | undefined, itemId: string, fileName: string) => {
//     const endpoint = isFile
//         ? `/files/download-file/${itemId}`
//         : `/files/download-folder/${itemId}`

//     try {

//         if (isFile) {
//             const response = await api.get(endpoint, { responseType: 'blob' });
//             const contentDisposition = response.headers['content-disposition'];
//             const fileName = contentDisposition
//                 ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
//                 : `file_${itemId}`;

//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', fileName);
//             document.body.appendChild(link);
//             link.click();
//             link.remove();

//             return response.data;
//         } else {
//             const response = await api.get(endpoint, { responseType: 'blob' });

//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', `folder_${fileName}.zip`);
//             document.body.appendChild(link);
//             link.click();
//             link.remove();

//             return response.data;
//         }
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// }

// export const restoreFile = async (isFile: boolean, fileId: string) => {

//     try {

//         const fileType = isFile ? "File" : "Folder"

//         const response = await api.get(`/files/restore-file/${fileType}/${fileId}`);
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const deletePermanently = async (isFile: boolean, fileId: string) => {

//     try {

//         const fileType = isFile ? "File" : "Folder"

//         const response = await api.get(`/files/deletePermanently/${fileType}/${fileId}`);
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


// export const getFolderContents = async (folderId: string | null) => {
//     const response = await api.get(`/folders/${folderId || 'root'}`);
//     return response.data;
// };

// export const downloadFile = async (fileId: string) => {
//     const response = await publicApi.get(`/files/${fileId}/download`, { responseType: 'blob' });
//     return response.data;
// };

// export const deleteItem = async (itemId: string, itemType: 'file' | 'folder') => {
//     const response = await api.delete(`/${itemType}s/${itemId}`);
//     return response.data;
// };

// export const moveItem = async (itemId: string, itemType: 'file' | 'folder', targetFolderId: string) => {
//     const response = await api.post(`/${itemType}s/${itemId}/move`, { targetFolderId });
//     return response.data;
// };




import { AccountFormValues, AuthResponse, FileActivity, FilesResponse, FolderItem, GetFileCountResponse, GetFoldersResponse, ProfileFormValues, SharedLinkResponse, StorageInfo, UserResponse, VerificationResponse } from '@/types/types';
import { handleError } from '@/utils/helpers';
import axios from 'axios';
import { axiosRequest, publicAxiosRequest } from './api-client';

const chunkSize = 10 * 1024

//const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Create a separate axios instance for non-authenticated requests
const publicApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Request interceptor to add the Authorization token
api.interceptors.request.use((config) => {

    const token = localStorage.getItem('accessToken');

    console.log(' =======interceptors============ ')
    console.log(token)
    console.log(' =======interceptors========== ')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    // Handle request error
    handleError(error);
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        handleError(error);
        return Promise.reject(error);
    }
);


export interface FileWithProgress extends File {
    progress: number;
}


//

export const newVerification = async (code: string): Promise<VerificationResponse | null> => {
    const config = {
        method: 'GET',
        url: `/auth/email-verification/${code}`
    };

    const response = await publicAxiosRequest(config);
    return response ? (response.data as VerificationResponse) : null;
}


export const register = async (name: string, email: string, password: string) => {
    try {
        const config = {
            method: 'POST',
            url: '/auth/register',
            data: { name, email, password },
        };

        const response = await publicAxiosRequest(config);
        return response ? response.data : null;

    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const signIn = async (email: string, password: string, code: string): Promise<AuthResponse | null> => {
    try {


        const config = {
            method: 'POST',
            url: '/auth/login',
            data: { email, password, code },
        };

        const response = await publicAxiosRequest(config);

        console.log(" =======signIn============ ")
        console.log(response)
        console.log(" =======signIn========== ")

        return response ? (response.data as AuthResponse) : null;
        // return response ? response.data : null;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.error || 'An error occurred during login')
        }
        throw error
    }
}

export const signIn2 = async (email: string, password: string, code: string) => {

    const config = {
        method: 'POST',
        url: '/auth/login',
        data: { email, password, code },
    };

    const response = await publicAxiosRequest(config);
    return response ? response.data : null;
}


export const getPreview = async (fileId: string) => {

    const config = {
        method: 'GET',
        url: `/files/preview/${fileId}`,
    };

    const response = await axiosRequest(config);

    if (response) {
        console.log(response.data);
    }

    return response ? response.data : null;
};

export const getSharedLink = async (fileId: string): Promise<SharedLinkResponse | null> => {
    try {
        const config = {
            method: 'GET',
            url: `/files/shared-link/${fileId}`,
        };

        const response = await axiosRequest(config);

        return response ? (response.data as SharedLinkResponse) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
};




export const signOut = async (refreshToken: string) => {
    try {
        const config = {
            method: 'POST',
            url: '/auth/logout', data: { refreshToken },
        };

        const response = await axiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}






export const getChildrenFoldersByParentFolderId = async (folderId: string | null): Promise<GetFoldersResponse | null> => {
    try {
        const response = await axiosRequest<GetFoldersResponse>({
            method: 'GET',
            url: `/folders/get-children-folders-folderId/${folderId}`,
        })

        if (response && response.data) {

            const processedFolders = await Promise.all(
                response.data.folders.map(async (folder: FolderItem) => {
                    const fileCount = await getFolderFileCount(folder.id)
                    return { ...folder, fileCount }
                })
            )

            return {
                ...response.data,
                folders: processedFolders,
            }
        }

        return null
    } catch (error) {
        console.error('Error fetching children folders:', error)
        throw error
    }
}

const getFolderFileCount = async (folderId: string): Promise<number> => {
    try {
        const response = await axiosRequest<GetFileCountResponse>({
            method: 'GET',
            url: `/folders/file-count/${folderId}`,
        })


        return response?.data?.count || 0
    } catch (error) {
        console.error('Error fetching folder file count:', error)
        return 0
    }
}

export const getPdf = async (): Promise<FilesResponse | null> => {
    try {
        const config = { method: 'GET', url: '/files/get-pdf' };

        const response = await axiosRequest(config);

        return response ? (response.data as FilesResponse) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const getWord = async (): Promise<FilesResponse | null> => {
    try {
        const config = { method: 'GET', url: '/files/get-word' };

        const response = await axiosRequest(config);

        return response ? (response.data as FilesResponse) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const getVideo = async (): Promise<FilesResponse | null> => {
    try {
        const config = { method: 'GET', url: '/files/get-video' };

        const response = await axiosRequest(config);

        return response ? (response.data as FilesResponse) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getAudio = async (): Promise<FilesResponse | null> => {
    try {
        const config = { method: 'GET', url: '/files/get-audio' };

        const response = await axiosRequest(config);

        return response ? (response.data as FilesResponse) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getFolderPath = async (folderId: string) => {

    try {
        const config = {
            method: 'GET',
            url: `/folders/${folderId}/path`
        };

        const response = await axiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const createNewDocument = async (name: string, folderId: string | null) => {

    try {
        const config = {
            method: 'POST',
            url: `/files/create-documents`,
            data: { name, folderId }
        };

        const response = await axiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const createNewFolder = async (folderName: string, parentFolderId: string | null) => {

    try {
        const config = {
            method: 'POST',
            url: `/folders/create-folder`,
            data: { folderName, parentFolderId }
        };

        const response = await axiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}


export const getDocumentUsers = async (documentId: string) => {
    try {

        const config = {
            method: 'GET',
            url: `/documents/fetch-users/${documentId}`
        };

        const response = await axiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const changeFileSharePermission = async (
    documentId: string,
    permission: 'WRITE' | 'READ',

) => {

    try {
        const config = {
            method: 'POST',
            url: `/documents/${documentId}/change-fileShare-permission`,
            data: JSON.stringify({
                documentId, permission,
            }),
        }

        const response = await axiosRequest(config);

        return response ? response.data : null;

    } catch (error) {
        handleError(error);
        throw error;
    }
}


export const shareDocumentToUser = async (
    documentId: string,
    email: string,
    message: string,
    permission: 'WRITE' | 'READ',
    currentUrl: string,
    documentAccess: 'RESTRICTED' | 'ANYONE',
) => {


    console.log(' ++++++++shareDocumentToUser+++++++++++++++++ ')
    console.log(documentId)
    console.log(email)
    console.log(message)
    console.log(permission)
    console.log(currentUrl)
    console.log(documentAccess)
    console.log(' +++++++++shareDocumentToUser++++++++++++++++ ')

    try {
        const config = {
            method: 'POST',
            url: `/documents/${documentId}/share`,
            data: JSON.stringify({
                email, documentId,
                message,
                permission,
                currentUrl,
                documentAccess,
            }),
        }

        const response = await axiosRequest(config);

        return response ? response.data : null;

    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const shareDocumentV1 = async (documentId: string, email: string, message: string, date: string, permission: string,
    currentUrl: string) => {
    try {
        const config = {
            method: 'POST',
            url: `/documents/share-document`,
            data: { documentId, email, message, date, permission, currentUrl }
        };

        const response = await axiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}



export const shareDocument = async (documentId: string, email: string, message: string, date: string, isPasswordEnabled: boolean, permission: string,
    currentUrl: string) => {
    try {
        const config = {
            method: 'POST',
            url: `/documents/share-document`,
            data: { documentId, email, message, date, isPasswordEnabled, permission, currentUrl }
        };

        const response = await axiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const resetPassword = async (password: string, token: string) => {
    try {
        const config = {
            method: 'POST',
            url: `/auth/reset-password/${token}`,
            data: { password }
        };

        const response = await publicAxiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const fetchUserData = async (): Promise<UserResponse | null> => {

    try {
        const config = {
            method: 'GET',
            url: '/auth/profile',
        };

        const response = await axiosRequest(config);

        return response ? (response.data as UserResponse) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getRecentActivity = async (): Promise<FileActivity[] | null> => {

    try {
        const config = {
            method: 'GET',
            url: '/dashboard/recent-activity',
        };

        const response = await axiosRequest(config);

        return response ? (response.data as FileActivity[]) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}


export const getStorageInfo = async (): Promise<StorageInfo | null> => {
    try {
        const config = {
            method: 'GET',
            url: '/dashboard/storage-info',
        };

        const response = await axiosRequest(config);
        return response ? (response.data as StorageInfo) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getUserStats = async () => {

    const config = {
        method: 'GET',
        url: '/dashboard/user-stats',
    };

    const response = await axiosRequest(config);

    if (response) {
        console.log(response.data);
    }

    return response ? response.data : null;
};

export const verifyOtp = async (email: string, otp: string) => {
    try {

        const config = {
            method: 'POST',
            url: '/auth/verify-otp',
            data: { email, otp },
        };

        const response = await publicAxiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const resendOtp = async (email: string) => {

    try {
        const config = {
            method: 'POST',
            url: '/auth/resend-otp',
            data: { email },
        };

        const response = await publicAxiosRequest(config);

        return response ? response.data : null;
    } catch (error) {
        handleError(error);
        throw error;
    }

}

// export const signIn = async (email: string, password: string) => {
//     try {
//         const response = await publicApi.post('/auth/login', { email, password });
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }

// };


export async function uploadChunkService(file: File, data: string | ArrayBuffer | null, currentChunkIndex: number) {
    const params = new URLSearchParams()
    params.set('name', file.name)
    params.set('size', file.size.toString())
    params.set('currentChunkIndex', currentChunkIndex.toString())
    params.set('totalChunks', Math.ceil(file.size / chunkSize).toString())

    const headers = { 'Content-Type': 'application/octet-stream' }
    //  const url = `http://localhost:4001/upload?${params.toString()}`

    try {
        const response = await api.post(`/files/uploadFiles?${params.toString()}`, data, { headers });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }

}


export const uploadFile1 = async (
    file: FileWithProgress,
    onProgress: (progress: number) => void
) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        await api.post('/files/upload', formData, {
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total!
                );
                onProgress(percentCompleted);
            },
        });
    } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
    }
};

export const uploadFiles = async (files: FileWithProgress[],
    updateProgress: (file: FileWithProgress, progress: number) => void
) => {
    const uploads = files.map(async (file) => {
        await uploadFile1(file, (progress) => {
            updateProgress(file, progress);
        });
    });

    await Promise.all(uploads);
};



export const verifyToken = async (token: string) => {
    try {
        const response = await api.post('/auth/verify', { token });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getRootFolder = async () => {
    try {
        const response = await api.get('/folders/get-root-folder');
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getRootChildren = async () => {
    try {
        const response = await api.get('/folders/get-root-children');
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const shareAFile = async (fileId: string, expirationDate: string | null, password: string | null,
    sharedWith: string, shareWithMessage: string | null, isPasswordEnabled: boolean, isExpirationEnabled: boolean) => {
    try {
        const response = await api.post(`/files/share-file`, { fileId, sharedWith, password, expirationDate, shareWithMessage, isPasswordEnabled, isExpirationEnabled });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const forgotPassword = async (email: string) => {
    try {
        const response = await publicApi.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};



// export const getFolderPath = async (folderId: string) => {

//       try {
//         const response = await axiosRequest .post('/files/create-documents', { email });
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }

//     try {
//         const response = await axios.get(`${API_URL}/folders/${folderId}/path`)
//         return response.data
//     } catch (error) {
//         console.error('Error fetching folder path:', error)
//         throw error
//     }
// }

// // ... rest of the file

// export const createNewDocument = async (name: string, folderId: string | null, email: string | undefined, userId: string | undefined) => {

//     try {
//         const response = await publicApi.post('/files/create-documents', { email });
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }

// }
// export const createNewFolder = async (folderName: string, parentFolderId: string | null) => {
//     try {
//         const response = await api.post('/folders/create-folder', { folderName, parentFolderId })
//         return response.data
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };


export const renameAFile = async (fileId: string, newName: string) => {
    try {
        const response = await api.post(`/files/rename/${fileId}`, { newName })
        return response.data
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const renameFolder = async (folderId: string, newName: string) => {
    try {
        const response = await api.post(`/folders/rename/${folderId}`, { newName })
        return response.data
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const getTotalFiles = async () => {
    try {
        const response = await api.get(`/dashboard/total-files`)
        return response.data
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getFileTypeDistribution = async () => {
    try {
        const response = await api.get(`/dashboard/type-distribution`)
        return response.data
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getStorageUsageHistory = async () => {
    try {
        const response = await api.get(`/dashboard/history`)
        return response.data
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const getFileUploadsPerDay = async () => {
    try {
        const response = await api.get(`/dashboard/uploads-per-day`)
        return response.data
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getFileUpload = async () => {
    try {
        const response = await api.get(`/files/uploadv1`)
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getFileUploadStatus = async () => {
    try {
        const response = await api.get(`/files/upload-status`)
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getFileUploadRequest = async () => {
    try {
        const response = await api.get(`/files/upload-request`)
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const getFileDetails = async (fileId: string) => {
    try {
        const response = await api.get(`/files/details/${fileId}`)
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const moveToTrash = async (fileId: string) => {
    try {
        const response = await api.post(`/files/trash/${fileId}`)
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};



export const copyShareLink = async (itemId: string) => {
    try {
        const response = await api.get(`/files/copy-link/${itemId}`)
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const uploadFilesAndFolders = async (
    items: DataTransferItemList,
    parentId: string,
    onProgress: (progress: number) => void
) => {
    const formData = new FormData()
    formData.append('parentId', parentId)

    console.log(" ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ ")
    console.log(parentId)

    console.log(items)

    console.log('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ');

    let totalSize = 0
    let uploadedSize = 0

    const processEntry = async (entry: FileSystemEntry, path: string) => {
        if (entry.isFile) {
            const fileEntry = entry as FileSystemFileEntry
            const file = await new Promise<File>((resolve) => {
                fileEntry.file((file) => resolve(file))
            })
            formData.append('files', file, path)
            totalSize += file.size
        } else if (entry.isDirectory) {
            const dirEntry = entry as FileSystemDirectoryEntry
            const dirReader = dirEntry.createReader()
            const entries = await new Promise<FileSystemEntry[]>((resolve) => {
                dirReader.readEntries((entries) => resolve(entries))
            })
            for (const childEntry of entries) {
                await processEntry(childEntry, `${path}/${childEntry.name}`)
            }
        }
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry()
        if (item) {
            await processEntry(item, item.name)
        }
    }

    const response = await api.post(`/files/fileUpload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            uploadedSize = progressEvent.loaded
            const percentCompleted = Math.round((uploadedSize * 100) / totalSize)
            onProgress(percentCompleted)
        },
    })

    return response.data
}

export const filesUploadToServer = async (file: File, folderId: string | null, onProgress: (progress: number) => void) => {
    const formData = new FormData()

    const relativePath = file.webkitRelativePath

    formData.append('folderId', folderId as string)
    formData.append('relativePath', relativePath)

    formData.append('file', file)

    const response = await api.post('/files/file-upload-v1', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                onProgress(percentCompleted)
            }
        },
    })

    return response.data
}



export const updateUserAccount = async (accountData: AccountFormValues) => {
    const response = await api.put('/users/account', accountData);
    return response.data;
};

export const updateUserProfile = async (profileData: ProfileFormValues) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
}


export const profile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get('/auth/profile');
    return response.data;
};




export const getSharedWithMe = async () => {
    try {
        const response = await api.get(`/files/get-sharedwithme`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getShared = async () => {

    try {

        const response = await api.get(`/files/get-share`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getTrashed = async () => {

    try {

        const response = await api.get(`/files/get-trash`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const getPhotos = async (): Promise<FilesResponse | null> => {
    try {
        const config = { method: 'GET', url: '/files/get-photo' };

        const response = await axiosRequest(config);

        return response ? (response.data as FilesResponse) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

// export const getPhotos = async () => {
//     try {
//         const response = await api.get(`/files/get-photo`);
//         return response.data;
//     } catch (error) {
//         handleError(error);
//         throw error;
//     }
// };

export const getSharedItems = async (itemId: string) => {
    try {
        const response = await api.get(`/files/shared-file/${itemId}`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const getExcelFiles = async (): Promise<FilesResponse | null> => {
    try {
        const config = { method: 'GET', url: '/files/get-excel' };

        const response = await axiosRequest(config);

        return response ? (response.data as FilesResponse) : null;
    } catch (error) {
        handleError(error);
        throw error;
    }
}


//
export const getCustomDocuments = async () => {

    try {

        const response = await api.get(`/files/get-custom-document`);

        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}



export const getDocuments = async () => {

    try {

        const response = await api.get(`/files/get-document`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
}

export const checkPassword = async (password: string, fileId: string) => {

    try {
        const response = await publicApi.post('/files/check-password', { password, fileId });
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};

export const previewAFile = async (fileId: string) => {

    try {
        const response = await api.get(`/files/preview/${fileId}`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};



export const downloadItem = async (
    isFile: boolean | undefined,
    itemId: string,
    fileName: string
) => {
    const endpoint = isFile
        ? `/files/download-file/${itemId}`
        : `/files/download-folder/${itemId}`;

    try {


        const response = await publicApi.get(endpoint, { responseType: 'blob' });

        // Extract file name from Content-Disposition header or use default
        const contentDisposition = response.headers['content-disposition'];
        const extractedFileName = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
            : isFile
                ? `file_${fileName}` // Default file name if not provided
                : `folder_${fileName}.zip`; // Default folder name with .zip extension

        // Create a URL for the file or folder Blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', extractedFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Revoke the object URL to free up memory
        window.URL.revokeObjectURL(url);

        return response.data;
    } catch (error) {
        handleError(error);
        console.error('Download failed:', error);
        throw error;
    }
};

export const downloadItem1 = async (isFile: boolean | undefined, itemId: string, fileName: string) => {
    const endpoint = isFile
        ? `/files/download-file/${itemId}`
        : `/files/download-folder/${itemId}`


    try {

        if (isFile) {
            const response = await api.get(endpoint, { responseType: 'blob' });
            const contentDisposition = response.headers['content-disposition'];
            const fileName = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/['"]/g, '')
                : `file_${itemId}`;

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            return response.data;
        } else {
            const response = await api.get(endpoint, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `folder_${fileName}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            return response.data;
        }
    } catch (error) {
        handleError(error);
        throw error;
    }
}

//restore-file/

export const restoreFile = async (isFile: boolean, fileId: string) => {

    try {

        const fileType = isFile ? "File" : "Folder"

        const response = await api.get(`/files/restore-file/${fileType}/${fileId}`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const deletePermanently = async (isFile: boolean, fileId: string) => {

    try {

        const fileType = isFile ? "File" : "Folder"

        const response = await api.get(`/files/deletePermanently/${fileType}/${fileId}`);
        return response.data;
    } catch (error) {
        handleError(error);
        throw error;
    }
};


export const getFolderContents = async (folderId: string | null) => {
    const response = await api.get(`/folders/${folderId || 'root'}`);
    return response.data;
};

export const downloadFile = async (fileId: string) => {
    const response = await publicApi.get(`/files/${fileId}/download`, { responseType: 'blob' });
    return response.data;
};

export const deleteItem = async (itemId: string, itemType: 'file' | 'folder') => {
    const response = await api.delete(`/${itemType}s/${itemId}`);
    return response.data;
};

export const moveItem = async (itemId: string, itemType: 'file' | 'folder', targetFolderId: string) => {
    const response = await api.post(`/${itemType}s/${itemId}/move`, { targetFolderId });
    return response.data;
};

