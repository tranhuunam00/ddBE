import { Controller, Get, Inject, Param, ParseIntPipe, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { buffer } from 'stream/consumers';
import {diskStorage} from "multer"
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Observable, Observer } from 'rxjs';
import path from 'path/posix';
import { MessageModule } from '../message/message.module';
import { MessageService } from '../message/message.service';
import { createWriteStream } from 'fs';


@Controller('file')
export class FileController {
    constructor(private readonly messageService: MessageService){}
    @Post("img/upload")
    @UseInterceptors(
        FileInterceptor("img",{
            storage:diskStorage({
                destination:"D:/ddBe/img_upload",
                filename:(req,file,cb)=>{
                    console.log(file.originalname+uuidv4())
                    let array=file.originalname.split('.')
                    const filename = uuidv4();

                    const extension = array[array.length-1];
                    console.log(extension)
                     cb(null,`${filename}.${extension}`)
                }
            }),
            // limits: {
            //     files: 1,
            //     fileSize: 5 * 10 * 10 * 10 * 10 * 10 * 10 * 10 // 50 mb in bytes
            //   },
            
        })
    )
    async uploadSingleImg(@UploadedFile() file ,@Res() res) {
        res.json(file.path);
        console.log(file)
    }
    //..............................download................................

    @Get("download/:fileId")
    download(@Res() res,@Param("fileId") fileId: number,){
        console.log(fileId)
        // let param=res.params["id"]
        // console.log(param)
        const fileName="0a0d64a1-f384-4ded-b6c7-bdfc88d579d0.jpg"
        return  res.download("src/upload/"+fileName)
    }
    //...............................upload cách 2...........................

    @Post("upload")
    @UseInterceptors(FileInterceptor("file"))
    uploadFile(@UploadedFile() file ,@Res() res){
        const path= "d:\\"+file.originalname
        let fileStream = createWriteStream( path)
        fileStream.write(file.buffer)
        fileStream.end()
        res.json("oki")
    }
    @Post('uploadFiles')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'img', maxCount: 2 },
        { name: 'background', maxCount: 1 },
        ],{
            storage:diskStorage({
                destination:"D:/ddBe/img_upload",
                filename:(req,file,cb)=>{
                    console.log(file.originalname+uuidv4())
                    let array=file.originalname.split('.')
                    const filename = uuidv4();

                    const extension = array[array.length-1];
                    console.log(extension)
                     cb(null,`${filename}.${extension}`)
                }
            }),
            // limits: {
            //     files: 1,
            //     fileSize: 5 * 10 * 10 * 10 * 10 * 10 * 10 * 10 // 50 mb in bytes
            //   },
            
        }))
        uploadFiles(@UploadedFiles() files: { img?: Express.Multer.File[], background?: Express.Multer.File[]},@Res() res) {
        var l =files.img.length;
        let a=[]
        let result=[]
        files.img.map((file)=>a.push(file))
        for( let i= 0;i<l;i++){
            result.push(a[i].path)
        }
    
        res.json(result)
    }
}
