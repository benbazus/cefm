import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';

export const zipFolder = (folderPath: string) => {
    const archive = archiver('zip', {
        zlib: { level: 9 },
    });

    const stream = fs.createWriteStream(path.join(folderPath, '..', 'temp.zip'));

    return new Promise<fs.ReadStream>((resolve, reject) => {
        archive
            .directory(folderPath, false)
            .on('error', (err) => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve(fs.createReadStream(path.join(folderPath, '..', 'temp.zip'))));
        archive.finalize();
    });
};