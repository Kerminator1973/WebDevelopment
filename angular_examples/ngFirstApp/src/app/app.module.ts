import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JokeComponent, JokeListComponent, JokeFormComponent,
  AppComponent, CardHoverDirective, CleanPipe, JokeService } from './app.component';

// Импортируем константу, используемую для конфигурирования сервиса
import { MAX_JOKES_TOKEN} from './app.component';

@NgModule({
  declarations: [
    // Здесь мы указываем, какие из разработанных нами компонентов
    // нашего приложения должны быть включены в Angular-приложение
    AppComponent, JokeComponent, JokeFormComponent, JokeListComponent, CardHoverDirective, CleanPipe
  ],
  imports: [
    // Здесь мы указываем, какие наборы макросов будут использоваться в
    // HTML-шаблонах компонентов Angular
    BrowserModule, FormsModule, ReactiveFormsModule
  ],

  providers: [
    JokeService,
    // Определяем конфигурационный параметр провайдера - максимальное количество шуток
    {provide: MAX_JOKES_TOKEN, useValue: 3}
],
  bootstrap: [AppComponent]
})
export class AppModule { }
