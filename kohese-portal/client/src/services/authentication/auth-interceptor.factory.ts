import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { AuthTokenFactory } from './auth-token.factory';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authTokenFactory: AuthTokenFactory) {
  }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request: HttpRequest<any> = req;
    let token: string = this.authTokenFactory.getToken().getValue();
    if (token) {
      request = req.clone({setHeaders: {Authorization: 'Bearer ' + token}});
    }
    
    return next.handle(request);
  }
}