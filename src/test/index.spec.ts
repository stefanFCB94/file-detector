import { expect } from 'chai';
import * as mocha from 'mocha';
import { suite, test } from 'mocha-typescript';
import {getFilesOfDir, FileInformation} from '../lib/index';
import * as path from 'path';

function sortReturn(a: FileInformation, b: FileInformation): number {
    if ( a.path > b.path ) return 1;
    if ( a.path < b.path ) return -1;
    if ( a.type > b.type ) return 1;
    if ( a.type < b.type ) return -1;
    return a.size - b.size;
}

const filesToBeDetected: FileInformation[] = [
    { path: path.resolve(__dirname, '../../src/test/testdir', 'with_tags.mp3'), size: 6731, type: 'audio/mpeg' },
    { path: path.resolve(__dirname, '../../src/test/testdir', 'subdir/with_tags.mp3'), size: 6731, type: 'audio/mpeg' }
];
filesToBeDetected.sort(sortReturn);


@suite('Check if files in directories are read correct')
class DetectFiles {

    

    @test('Check if directory is read correct, when all path is given as parameter')
    detect_files_dir_as_param(done: Function) {
        const dir: string = path.resolve(__dirname, '../../src/test/testdir');

        // Read files
        getFilesOfDir(dir).then(function(data) {
            
            expect(data).to.be.a('array');
            expect(data.length).to.be.equal(2);
            
            data.sort(sortReturn);

            for ( let i: number = 0; i < data.length; i++ ) {
                expect(data[i]).to.be.eql(filesToBeDetected[i]);
            }
            
            done();
        }).catch(function(err) {
            done(err);
        });
    }

    @test('Check if directory is read correct, when path is read from config file')
    detect_files_dir_from_config(done: Function) {
        process.env.NODE_ENV = 'test';

        // Read files
        getFilesOfDir().then(function(data) {
            
            expect(data).to.be.a('array');
            expect(data.length).to.be.equal(2);

            data.sort(sortReturn);

            for ( let i: number = 0; i < data.length; i++ ) {
                expect(data[i]).to.be.eql(filesToBeDetected[i]);
            }

            done();
        }).catch(function(err) {
            done(err);
        });

    }

    @test('Check if right error is given, when not existing path is given as parameter')
    detect_files_not_existing_dir(done: Function) {
        const dir: string = 'errordir/errordir/errordir';

        getFilesOfDir(dir).then((data) => {
            done(new Error('Should throw ENOENT error'));
        }).catch((err) => {
            expect(err).to.be.not.null;
            expect(err.code).to.be.equal('ENOENT');

            done();
        });

    }

    @test('Check if multiple dirs are read correct (duplicates removed)')
    detect_files_multiple_dirs_as_param(done: Function) {
        const dir: string[] = [
            'src/test/testdir',
            'src/test/testdir/subdir'
        ];

        getFilesOfDir(dir).then((data) => {
            
            expect(data).to.be.a('array');
            expect(data.length).to.be.equal(filesToBeDetected.length);

            for ( let i:number = 0; i < data.length; i++ ) {
                expect(data[i]).to.be.eql(filesToBeDetected[i]);
            }

            done();
        }).catch((err) => {
            done(err);
        });
    }

}



