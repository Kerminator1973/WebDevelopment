import { Injectable } from '@angular/core';
declare let alertify: any;

@Injectable({
  providedIn: 'root'
})
export class AlertifyService {

  constructor() { }

  // Функция-wrapper, используется для того, чтобы задать некоторый
  // вопрос пользователю и если будет выбран вариант ДА, выполняется
  // callback-функция
  confirm(message: string, okCallback: () => any) {
    alertify.confirm(message, function(e) {
      if (e) {
        okCallback();
      }
    });
  }

  // Далее идут wrapper-функции библиотеки AlertifyJS: https://alertifyjs.com/
  success(message: string) {
    alertify.success(message);
  }

  error(message: string) {
    alertify.error(message);
  }

  warning(message: string) {
    alertify.warning(message);
  }

  message(message: string) {
    alertify.message(message);
  }
}
