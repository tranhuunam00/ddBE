import { Controller, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('photos')
export class PhotosController {
    @Post("upload")
    @UseInterceptors(
        FileInterceptor("img",{
            dest:"./upload",
        })
    )
    uploadSingle(@UploadedFile() file ,@Res() res){

        res.json(file.path);
        console.log(file)
    }
}
