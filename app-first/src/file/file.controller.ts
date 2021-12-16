import { Controller, Get, Inject, Param, ParseIntPipe, Post, Req, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { buffer } from 'stream/consumers';
import {diskStorage} from "multer"
import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Observable, Observer } from 'rxjs';
import path from 'path/posix';
import { MessageModule } from '../message/message.module';
import { MessageService } from '../message/message.service';
import { createWriteStream } from 'fs';
import { UserService } from '../user/user.service';
import { FeedService } from '../feed/feed.service';
import { EventsGateway } from '../events/event,gateway';



@Controller('file')
export class FileController {
    constructor(private readonly messageService: MessageService,
        private userService: UserService,
        private feedService: FeedService,
        private eventsGateway:EventsGateway
        ){}
    @Post("img/upload")
    @UseInterceptors(
        FileInterceptor("img",{
            storage:diskStorage({
                destination:"../upload",
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
    async uploadSingleImg(@UploadedFile() file ,@Res() res : Response, @Req() req: Request) {
        console.log(file)
        try{
            console.log("userOwn id " + req.user["_id"])
          

            console.log( "body " + req.body.eventChangeImgUser)
            if(req.body.eventChangeImgUser != undefined && req.body.eventChangeImgUser != null){
                if(req.body.eventChangeImgUser == "avatar" || req.body.eventChangeImgUser == "cover"){
                    let a:string[] = file.path.split("\\");
                    let pathImg = a[2];
                    console.log(pathImg)
                    let result = await this.userService.changeUserImg(req.body.eventChangeImgUser,pathImg,req.user["_id"],)
                    if(result=="done"){
                        return res.json(pathImg);
                    }else{
                        return res.json("error")
                    }
                }
                if(req.body.eventChangeImgUser=="message"){
                    let a:string[] = file.path.split("\\");
                    let pathImg = a[2];

                   
                    let result=await this.messageService.create({"path":pathImg,message:"","sourceId":req.user["_id"],
                                                   "targetId":req.body.targetId,"time":req.body.time})
                    this.eventsGateway.emitClientMessage({"path":pathImg,message:"","sourceId":req.user["_id"],
                                                 "targetId":req.body.targetId,"time":req.body.time})
                    return res.json(pathImg);
                }
                if(req.body.eventChangeImgUser=="comment"){
                    let a:string[] = file.path.split("\\");
                    let pathImg = a[2];
                    let result= await this.feedService.createComment(req.body.feedId,  {
                        "pathImg": pathImg,
                        "messages":"",
                        "sourceUserId": req.user["_id"].toString(),
                        "createdAt": req.body.createdAt,
                      
                      })
                      if(result=="done"){ return res.json(pathImg);}
                    else{return res.json("error")}
                }
                
            }else{return res.json("error")}

        }catch(err){return res.json("error")}
    }
    //..............................download................................

    @Get("download/:fileName")
    download(@Res() res, @Param() params){
        console.log(params.fileName)
        // let param=res.params["id"]
        // console.log(param)
    
        return  res.download("../upload/"+params.fileName)
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
    //................................upload multi.--------------------------
    @Post('uploadFiles')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'img', maxCount: 2 },
        { name: 'background', maxCount: 1 },
        ],{
            storage:diskStorage({
                destination:"../upload",
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
