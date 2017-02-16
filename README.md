# Title

Description

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installing

Install the module with npm to use it in your project.
```
npm install --production file-detector
```

To change the code or run tests of the module you can install it with its development dependencies:
```
npm install file-detector
```


After installing, the module can be used the following way:
```typescript
import {getFilesOfDir, FileInformation} from 'file-detector';

const dir: string = 'testdir';
getFilesOfDir(dir).then((files) => {
    // Logs found files to the console
    // Each file is is a object
    console.log(files);
}).catch((err) => {
    throw err;
})
```

The function returns a array with all found files in the directory / directories.
Each file is a object with the following keys:
|Key|Description|
|---|---|
|path|Absolute path to the found file|
|size|The size of the found file in bytes|
|type|The MIME type of the found file|


If no path is given as parameter, the function looks, if a config file, for the actual setted node environment is given.
The config file must have the following structure:
```json
{
    "File_Detection": {
        "supported_mime_types": [
            "audio/mpeg"
        ],

        "directories": [
            "./src/test/testdir"
        ]
    }
}
```

The config file has the following keys:
|Key|Description|
|---|---|
|supported_mime_types|If given the found files will be filterd, only files of the configured MIME types will be given back. If no config file is found, the key is not given in the config file or the array is empty, all found files will be given back.|
|directories|If no parameter is given for the function, the function tries to detect the directories, which should be read, from this config key.|

## Testing the module

To test the module you can use the built in tests.
For testing, the frameworks mocha and chai are used. To check the code coverage the framework istanbul is used.

To run the test install all development dependencies, with following command:

```
npm install file-detector
```

To start the tests run the following command:
```
gulp test
```

The results of the code coverage are generated as HTML output in the folder "coverage".

## Versioning

I use [SemVer](http://semver.org/) for versioning.

## Authors

* [**Stefan Läufle**](https://github.com/stefanFCB94)

## License

This project is licensed under the MIT License
