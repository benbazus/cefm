import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

export const config = {
    port: process.env.PORT || 3000,
    uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'),
    defaultUploadDir: path.resolve(process.env.DEFAULT_UPLOAD_DIR || 'uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB by default

    UPLOAD_DIR: './uploads/',
    CHUNK_SIZE: 10 * 1024 * 1024, // 10MB

}