import { ComponentType } from "react";

export interface SharedFile {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  user: User
  activities: FileActivity[]
  storageInfo: StorageInfo
  fileDistribution: FileTypeDistribution
  storageUsageHistory: StorageUsageHistory
}

export interface SharedFolder {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  user: User
  files: FileItem[]
  activities: FileActivity[]
  storageInfo: StorageInfo
  fileDistribution: FileTypeDistribution
  storageUsageHistory: StorageUsageHistory
}

export interface SharedLink {
  id: string
  name: string
  url: string
  password: string
  createdAt: Date
  updatedAt: Date
  user: User
  folder: FolderItem
  file: FileItem
  activities: FileActivity[]
  storageInfo: StorageInfo
  fileDistribution: FileTypeDistribution
  storageUsageHistory: StorageUsageHistory
}

export interface UserResponse extends User {
  token?: string;
  accessToken?: string
  success?: boolean
  error?: string
  twoFactor?: boolean
  isOAuth: boolean;
  // user?: {
  //   id: string
  //   name: string;
  //   email: string;
  //   image?: string;
  //   role: UserRole
  //   isTwoFactorEnabled: boolean
  // }
}

export interface AuthResponse {
  accessToken?: string
  refreshToken?: string
  success?: boolean
  twoFactor?: boolean
  error?: string
  isTwoFactorEnabled: boolean
  user?: {
    id: string
    name: string;
    email: string;
    image?: string;
    role: UserRole
    isTwoFactorEnabled: boolean
    createdAt: Date
    updatedAt: Date
    folders: FolderItem[]
    files: FileItem[]
    activities: FileActivity[]
    storageInfo: StorageInfo
    fileDistribution: FileTypeDistribution
    storageUsageHistory: StorageUsageHistory
    sharedLinks: SharedLink[]
    sharedFolders: SharedFolder[]
    sharedFiles: SharedFile[]
    sharedFoldersCount: number
    sharedFilesCount: number
    sharedLinksCount: number
    sharedFoldersWithLink: SharedFolder[]
    sharedFilesWithLink: SharedFile[]
    sharedLinksWithLink: SharedLink[]
    sharedFoldersWithLinkCount: number
  }
}


export interface User {
  id: string
  name: string;
  email: string;
  image?: string;
  role: UserRole
  isTwoFactorEnabled: boolean
  createdAt: Date
  updatedAt: Date
  folders: FolderItem[]
  files: FileItem[]
  activities: FileActivity[]
  storageInfo: StorageInfo
  fileDistribution: FileTypeDistribution
  storageUsageHistory: StorageUsageHistory
  sharedLinks: SharedLink[]
  sharedFolders: SharedFolder[]
  sharedFiles: SharedFile[]
  sharedFoldersCount: number
  sharedFilesCount: number
  sharedLinksCount: number
  sharedFoldersWithLink: SharedFolder[]
  sharedFilesWithLink: SharedFile[]
  sharedLinksWithLink: SharedLink[]
  sharedFoldersWithLinkCount: number

}
export interface UserRole {
  id: string
  name: string
  description: string
  permissions: string[]
}


export interface Permissions {
  id: string
  name: string
  description: string
  permissions: string[]
}


export interface FileWithProgress extends File {
  progress: number;
}


export interface GetFoldersResponse {
  folders: FolderItem[];
  files: FileItem[];
}

export interface GetFileCountResponse {
  count: number;
}



export interface SharedLinkResponse {
  link: string;
}

export interface FileActivity {
  id: string
  user: {
    name: string
    email: string
    avatar: string
  }
  fileName: string
  action: string
  timestamp: string
}

export interface StorageInfo {
  used: number
  total: number
}

export interface FileTypeDistribution {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

export interface StorageUsageHistory {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

export interface FileUploadsPerDay {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
  }[]
}

export interface StorageInfo {
  used: number
  total: number
  documentUsage: number
  imageUsage: number
  mediaUsage: number
}





export interface VerificationResponse {
  success?: string
  error?: string
}


export interface FileItemResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  size: number
  userId: string
  mimeType?: string
  title: string
}

export interface DriveItemsResponse {
  files: FileItemResponse[]
  folders: FileItemResponse[]
  documents: FileItemResponse[]
}


export interface FilesResponse {
  files: FileItemResponse[]
}

export interface FoldersResponse {
  folders: FileItemResponse[]
}


export interface AudioFile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  userId: string;
  mimeType: string;
}

export interface GetAudioResponse {
  files: FileItemResponse[];
}

export interface GetVideoResponse {
  files: FileItemResponse[];
}

export interface AudioResponse {
  files: AudioFile[];
}

export interface GetPdfResponse {
  files: FileItemResponse[]
}

// export interface AuthResponse {
//   accessToken?: string
//   success?: boolean
//   twoFactor?: boolean
//   error?: string
//   user?: {
//     isTwoFactorEnabled: boolean
//   }
// }

export interface FileItemResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  type: 'file' | 'folder'
  size: number
  userId: string
  mimeType?: string
  owner: string
}



export interface TranslateResponse {
  code: string;
}

export interface PageMeta {
  title: string;
  description: string;
  cardImage: string;
}

export interface DriveItems {
  FileItems: string[];
  FolderItem: FolderItem[];
}

export interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  mimeType: string
  size: number
  createdAt: Date
  updatedAt: Date
  fileCount?: number
  sharedWith?: string[]
  owner: string
  userId?: string
}

export interface FolderItem {
  id: string
  name: string
  type: 'folder'
  mimeType: string
  size: number
  createdAt: Date
  updatedAt: Date
  fileCount?: number
  sharedWith?: string[]
  userId?: string
  owner: string
}

export interface AccountFormValues {
  id: string /* primary key */;
  active?: boolean;
  name?: string;
  description?: string;
  image?: string;
}
export interface ProfileFormValues {
  id: string /* primary key */;
  active?: boolean;
  name?: string;
  description?: string;
  image?: string;
}




// export interface UserDetails {
//   id: string
//   first_name: string;
//   last_name: string;
//   full_name?: string;
//   avatar_url?: string;
// }



export interface IRoute {
  path: string;
  name: string;
  layout?: string;
  exact?: boolean;
  component?: ComponentType;
  disabled?: boolean;
  icon?: JSX.Element;
  secondary?: boolean;
  collapse?: boolean;
  items?: IRoute[];
  rightElement?: boolean;
  invisible?: boolean;
}



