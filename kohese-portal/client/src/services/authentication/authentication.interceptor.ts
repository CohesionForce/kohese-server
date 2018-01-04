import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {
  }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request: HttpRequest<any> = req;
    let authenticationService: AuthenticationService = this.injector.get(AuthenticationService);
    let token: string = authenticationService.getToken().getValue();
    if (token) {
      request = req.clone({setHeaders: {Authorization: 'Bearer ' + token}});
    }
    
    return next.handle(request);
  }
}