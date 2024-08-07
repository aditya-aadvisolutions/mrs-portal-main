import JSZip from "jszip";
import { saveAs } from "file-saver";
import ApiService from "@app/services/Api.service";
import { url } from 'inspector';
import { AxiosRequestConfig } from 'axios';
import axios from 'axios';


export class DownloadModel {
    link: string = '';
    fileSize: number = 0;
    fileName: string = '';
}


export const getFile = (url: string) => {
    const httpOptions: AxiosRequestConfig = {
        headers: {
            'Content-Type': getContentType(url),
        },
        responseType: 'blob',
    };

    return new Promise(async (res, rej) => {
        ApiService.requests.get(url, httpOptions)
            .then((response) => {
                return res(response);
            })
    });
};

function getFile1(url: string) {
    const httpOptions: AxiosRequestConfig = {
        headers: {
            'Content-Type': getContentType(url),
        },
        responseType: 'blob',
    };

    return ApiService.requests.get(url, httpOptions)

}

// async function downlodFile(fileInfo: any, callback: Function){
//     fetch(fileInfo.SourceFilePath)
//     .then((res:any) => res.blob())
//     .then((blob:any) => {
//       callback();
//       saveAs(blob, fileInfo.FileName);
//     });
// }


export const downlodFile = async (fileInfo: any, setProgress: any, callback: Function) => {
    try {
        const response = await fetch(fileInfo.SourceFilePath, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/octet-stream',
            }
        });
        if (!response.body) {
            throw new Error('Response body is empty');
          }
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length')!;

        let receivedLength = 0; 
        const chunks: Uint8Array[] = []; 

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            chunks.push(value);
            receivedLength += value.length;
            const progress = Math.floor((receivedLength / contentLength) * 100);
            setProgress(progress);
        }
        const blob = new Blob(chunks);
        saveAs(blob, fileInfo.FileName);

        callback(); 
    } catch (error) {
        console.error('Download error:', error);
        callback();
    }
}
async function createZip(files: any[], zipName: string,setProgress: (progress: number) => void, callback: Function) {
    const name = zipName + '.zip';
    var zip = new JSZip();
    let filesProcessed = 0;
    const totalFiles = files.length;

    // tslint:disable-next-line:prefer-for-of
    // for (let counter = 0; counter < files.length; counter++) {
    //     const element = files[counter];
    //     const fileData: any = await getFile(element);
    //     const b: any = new Blob([fileData], {
    //         type: fileData.type,
    //     });

    //     zip.file(element.substring(element.lastIndexOf('/') + 1),b,);
    // }
    const imagesFetcher = await Promise.all(
        files.map(async (file, index) => {
            const res = await fetch(file.SourceFilePath);
            return res.blob();
        })
    );

    imagesFetcher.forEach((fileBlob, index) => {
        let file = files[index];
        zip.file(file.FileName, fileBlob);
        filesProcessed += 1;
        const progress = Math.floor((filesProcessed / totalFiles) * 100);
        setProgress(progress);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
        if (callback) callback();
        if (content) {
            saveAs(content, name);
        }
    });
}

function getContentType(url: string): string {
    let extension: string = new RegExp(/(?:\.([^.]+))?$/).exec(url)[1];
    // const match = new RegExp(/(?:\.([^.]+))?$/).exec(url);

    // let extension = match && match[1] ? match[1].toLowerCase() : '';

    // var contentType = '';

    switch (extension) {
        case 'pdf': {
            return 'application/pdf';
        }
        case 'xlsx': {
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        case 'xsl': {
            return 'application/vnd.ms-excel';
        }
        case 'csv': {
            return 'application/vnd.ms-excel';
        }
        case 'jpg': {
            return 'image/jpg';
        }
        case 'jpge': {
            return 'image/jpge';
        }
        default: {
            return 'application/json-patch+json';
        }
    }
}


const DownloadZipService = {
    getFile,
    createZip,
    downlodFile
}

export default DownloadZipService;

