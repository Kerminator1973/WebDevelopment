import {Injectable} from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 401) {
                        return throwError(error.statusText);
                    }

                    // Определяем, есть ли в http-заголовке поле 'Application-Error'
                    const applicationError = error.headers.get('Application-Error');
                    if (applicationError) {
                        // Если соответствующее поле есть, возвращаем текст поля, как описание ошибки
                        console.error(applicationError);
                        return throwError(applicationError);
                    }

                    // Обрабатываем объект error.error, преобразуя объект словарь
                    // в текстовую строку
                    const serverError = error.error;
                    let modalStateErrors = '';
                    if (serverError && typeof serverError === 'object') {
                        for (const key in serverError) {
                            if (serverError[key]) {
                                modalStateErrors += serverError[key] + '\n';
                            }
                        }
                    }

                    // Если в текстовой строке что-то удалось сохранить, то возвращаем
                    // эту строку. Если строка оказалась пустой, то возвращаем текст
                    // 'Server error'
                    return throwError(modalStateErrors || serverError || 'Server Error');
                }
            })
        );
    }
}

// Описываем структуру, которая будет использована при определении сервиса в "app.module.ts"
export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
};
