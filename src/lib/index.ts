import * as fs from 'fs';
import * as mime from 'mime';
import * as path from 'path';
import * as config from 'config';

export interface FileInformation {
    path: string,
    size: number,
    type: string
};


// Config-Key for the supported MIME-Types
const KEY_SUPPORTED_MIME_TYPES: string = 'File_Detection.supported_mime_types';

// Config-Key for the default directories
const KEY_DEFAULT_DIRECTORIES: string = 'File_Detection.directories';

// Read all supported MIME types from config file
let supportedMIMETypes: Array<string> = [];
if ( config.has(KEY_SUPPORTED_MIME_TYPES) ) {
    supportedMIMETypes = config.get(KEY_SUPPORTED_MIME_TYPES) as Array<string>;
}


export function getFilesOfDir(dir?: string | Array<string>): Promise<Array<FileInformation>> {
    return new Promise<Array<FileInformation>>((resolve, reject) => {
        // Check if dir is given
        // If dir is not given, then take the directories,
        // which are configured in the config file of the
        // environment
        if ( dir == null ) {
            dir = [];
            if ( config.has(KEY_DEFAULT_DIRECTORIES) )
                dir = config.get(KEY_DEFAULT_DIRECTORIES) as Array<string>;
        }

        // From that point on, just work with a array
        if ( typeof dir === 'string' )
            dir = [dir];

        // Read all found Directories
        const promises: Array<Promise<Array<FileInformation>>> = [];
        for ( let i: number = 0; i < dir.length; i++ ) {
            dir[i] = path.resolve(dir[i]);
            promises.push(readDir(dir[i]));
        }

        // If all directories are read, give back all found
        // files in the promise back
        Promise.all(promises).then((res) => {
            let files: Array<FileInformation> = [];

            for (let i:number = 0; i < res.length; i++ ) {
                files = files.concat(res[i]);
            }

            // Remove duplicate files
            files = files.filter((file, index, self) => {
                let i: number = self.findIndex((t) => { 
                    return t.path === file.path; 
                });
                return i === index; 
            });

            resolve(files);
        }).catch((err) => {
            reject(err);
        })
                
    });    
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
        
        fs.stat(path, (err, stats) => {
            if (err) return reject(err);

            // If the path is a directory, read all files from
            // that directory
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

            // If the path is a file, read the information
            // of these files
            if ( stats.isFile() ) {
                const type: string = mime.lookup(path);

                // File will be given back, when no supported
                // MIME types are configured, or the detected
                // MIME type is allowed
                if ( supportedMIMETypes.length > 0 && supportedMIMETypes.indexOf(type) == -1 ) {
                    return resolve([]);
                }

                const infos: FileInformation = {
                    path,
                    size: stats.size,
                    type
                };

                return resolve([infos]);
            }
        });
    });
}
