import { Controller, Inject, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { buffer } from 'stream/consumers';
import {diskStorage} from "multer"
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Observable, Observer } from 'rxjs';
import path from 'path/posix';
import { MessageModule } from '../message/message.module';
import { MessageService } from '../message/message.service';

@Controller('photos')
export class PhotosController {
    constructor(private readonly messageService: MessageService){}
    @Post("upload")
    @UseInterceptors(
        FileInterceptor("img",{
            storage:diskStorage({
                destination:"src/upload",
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
    async uploadSingle(@UploadedFile() file ,@Res() res) {
        res.json(file.path);
        console.log(file)
    }
}
