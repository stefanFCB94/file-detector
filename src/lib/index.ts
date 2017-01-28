import * as fs from 'fs';
import * as mime from 'mime';
import * as path from 'path';

export interface FileInformation {
    path: string,
    size: number,
    type: string
};

export function getFilesOfDir(dir?: string): Promise<Array<FileInformation>> {
    dir = (!dir) ? __dirname : path.resolve(dir);
    
    return readDir(dir);
}

function readDir(dir: string): Promise<Array<FileInformation>> {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) return reject(err);
            
            const promises: Array<Promise<Array<FileInformation>>> = [];

            for (let i: number = 0; i < files.length; i++ ) {
                const file = path.resolve(dir + '/' + files[i]);
                promises.push(getFileInformation(file));
            }

            Promise.all(promises).then((res) => {
                let files: Array<FileInformation> = [];

                for (let i:number = 0; i < res.length; i++ ) {
                    files = files.concat(res[i]);
                }
                resolve(files);
            });
        });
    });
}

        

function getFileInformation(path: string): Promise<Array<FileInformation>> {
    return new Promise((resolve, reject) => {
        console.log(path);
        fs.stat(path, (err, stats) => {
            if (err) return reject(err);

            if ( stats.isDirectory() ) {
                readDir(path)
                    .then((res: Array<FileInformation>) => {
                        resolve(res);
                    })
                    .catch((err) => {
                        reject(err);
                    });
                return;
            }

            if ( stats.isFile() ) {
                const infos: FileInformation = {
                    path: path,
                    size: stats.size,
                    type: mime.lookup(path)
                };

                return resolve([infos]);
            }
        });
    });
}


getFilesOfDir('./dist').then((res) => {
    console.log(res); 
});
