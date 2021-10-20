import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Observable, Observer } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
    canActivate (
        context:ExecutionContext,
    ):boolean |Promise<boolean>|Observable<boolean>{
        // const req = context.switchToHttp().getRequest();
        // const {user} =req;
        // if(user && user.role === 'admin'){
        //     return true;
        // }
        return true;
        throw new HttpException("user is not auth",HttpStatus.UNAUTHORIZED);
    }
}