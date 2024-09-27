// const path = require('path');
// const sharp = require('sharp');
// const pdf = require('pdf-thumbnail');
// var fs = require('fs');
// var fsPromises = require('fs/promises');

// async function generatePreviewUrl(filePath, mimeType) {
//     const previewsFolder = path.join(process.cwd(), 'public', 'File Manager', 'previews');
//     fs.mkdirSync(previewsFolder, { recursive: true });

//     const previewFilename = `${path.basename(filePath, path.extname(filePath))}_preview.jpg`;
//     const previewPath = path.join(previewsFolder, previewFilename);

//     if (mimeType.startsWith('image/')) {
//         await sharp(filePath)
//             .resize(200, 200, { fit: 'inside' })
//             .toFormat('jpeg')
//             .toFile(previewPath);
//     } else if (mimeType === 'application/pdf') {
//         await pdf(filePath, previewPath, {
//             resize: {
//                 width: 200,
//                 height: 200,
//             },
//         });
//     } else {
//         // For other file types, you might want to generate a generic preview or icon
//         return '/path/to/generic/preview.jpg';
//     }

//     return `/File Manager/previews/${previewFilename}`;
// }

// module.exports = {
//     generatePreviewUrl
// };


const path = require('path');
const sharp = require('sharp');

async function generatePreviewUrl(filePath, mimeType) {
    if (mimeType.startsWith('image/')) {
        const previewPath = path.join(
            path.dirname(filePath),
            'previews',
            `${path.basename(filePath, path.extname(filePath))}_preview.jpg`
        );

        await sharp(filePath)
            .resize(200, 200, { fit: 'inside' })
            .toFormat('jpeg')
            .toFile(previewPath);

        return `/File Manager/previews/${path.basename(previewPath)}`;
    }

    // For non-image files, you might want to generate a generic preview or icon
    return '/path/to/generic/preview.jpg';
}

module.exports = {
    generatePreviewUrl
};