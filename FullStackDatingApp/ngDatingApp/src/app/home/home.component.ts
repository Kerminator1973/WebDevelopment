import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  registerMode = false;
  values: any;

  // Выполняем Injection сервиса для доступа к ресурсам по протоколу Http
  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  registerActivate() {
    this.registerMode = true;
  }

  // Метод вызывается при нажатии в дочернем компоненте кнопки "Cancel". Благодаря
  // использованию декоратора @Output() и соответствующий связи в HTML-коде, будет
  // вызван данный метод
  cancelRegisterMode(registerMode: boolean) {
    this.registerMode = registerMode;
  }
}
