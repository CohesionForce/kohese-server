import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { AuthTokenFactory } from './auth-token.factory';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authTokenFactory: AuthTokenFactory) {
  }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authTokenFactory.getToken().mergeMap((token) => {
      return next.handle(req.clone({setHeaders: {Authorization: 'Bearer ' + token}}));
    });
  }
}