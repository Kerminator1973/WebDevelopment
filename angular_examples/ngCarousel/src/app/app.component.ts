import { Component, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { map } from 'rxjs/operators';

// Эта коллекция используется в первом задании - создать карусель
class CarouselImage {
  public filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }
}

// Эта коллекция используется во втором задании - создать список статей
class Article {

  public title: string;
  public text: string;
  public picture: string;
  public last_modification: Date; // Тип данных - дата последней модификации

  constructor(title: string, text: string, picture: string, last_modification: Date) {
    this.title = title;
    this.text = text;
    this.picture = picture;
    this.last_modification = last_modification;
  }
}


// Компонент используется в рамках второго контрольного задания.
// Ключевая идея второго контрольного задания: необходимо использовать
// условие *ngIf, чтобы не отображать картинку, если она не указана.
// Совет: чтобы вывести дату в желаемом формате на экран, необходимо
// использовать т.н. DatePipe, см. код ниже по тексту
@Component({
  selector: 'article-list',
  template: `
<div class="col-md-4" *ngFor="let article of articles">
  <div class="card" [ngClass]="{
    'card-outline-primary': article.picture.length == 0,
    'card-outline-danger': article.picture.length > 0
  }">
  <div class="card-block">
    <h4 class="card-title">{{ article.title }}</h4>
    <p class="card-text" *ngIf="article.picture.length == 0">{{ article.text }}</p>
    <p class="card-text">
      <small class="text-muted">Last updated {{ article.last_modification | date: 'dd/MM/yyyy' }}</small>
    </p>
  </div>
  <img class="card-img-bottom img-fluid" *ngIf="article.picture.length > 0" 
    src="../../assets/images/{{ article.picture }}"  width="416px" height="234px" />
  </div>
</div>
  `
})
export class ArticlesListComponent {

  articles: Article[];

  constructor() {
    this.articles = [
      new Article('Прибыли в Тайланд', 'Мы прилетели в Бангкок на самолёте Thai Airlines', '', new Date(2017, 8, 23)),
      new Article('Корейские рестораны - одно из наших излюбленных мест', '', '2.jpg', new Date(2017, 8, 24)),
      new Article('В Чайна-таун мы покупаем зелёный чай', '', '5.jpg', new Date(2017, 8, 25)),
      new Article('Возвращаемся домой', 'Послезавтра нужно идти в школу', '', new Date(2017, 9, 6)),
    ];
  }
}


// Ещё один пример, в котором используется Async Pipe связанный
// с Observable-объектом.
// Атрибут означает, что всё, что находится внутри тэга <p></p>
// является обычным текстом и к нему не нужно применять никакую
// Angular-обработку
@Component({
  selector: 'async-pipe',
  template: `
<div>
  <h4>AsyncPipe</h4>
  <p ngNonBindable>{{ observable | async }}</p>
  <p>{{ observable | async }}</p>
</div>
`
})
export class AsyncPipeComponent {
  observable: Observable<number>;

  constructor() {
    this.observable = this.getObservable();
  }

  getObservable() {
    return interval(1000).pipe(take(32), map((v) => v * v));
  }
}


// Описание главного экрана приложения, на котором отображаются
// компоненты, имеющие отношение к совершенно разным тестовым
// заданиями
@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  template: `
  <div id="carousel" class="carousel">
    <button class="arrow prev" (click)="goPrev()">⇦</button>
    <div class="gallery">
      <ul class="images" #carousel_element>
        <li *ngFor="let ci of pictures">
          <img src="../../assets/images/{{ci.filename}}">
        </li>
      </ul>
    </div>
    <button class="arrow next" (click)="goNext()">⇨</button>
  </div>
  <br/>
  <article-list></article-list>
  <br/>
  <async-pipe></async-pipe>
  `,
})
export class AppComponent {
  // Определяем статическое значение (константа) - ширина картинки
  private static picture_width = 832;

  title = 'app';

  // Список всех отображаемых в карусели изображений
  pictures: CarouselImage[];

  // Индекс текущей отображаемой фотографии
  private current_image: number;


  // Определяем ссылку на элемент DOM, с идентификатором "#carousel_element"
  @ViewChild('carousel_element', { static: false }) carouselEl: ElementRef;

  // Инициализируем объект в конструкторе
  constructor() {

    this.current_image = 0;

    // Список изображений можно загрузить, например, из базы данных
    this.pictures = [
      new CarouselImage('1.jpg'),
      new CarouselImage('2.jpg'),
      new CarouselImage('3.jpg'),
      new CarouselImage('4.jpg'),
      new CarouselImage('5.jpg'),
      new CarouselImage('6.jpg'),
      new CarouselImage('7.jpg'),
      new CarouselImage('8.jpg'),
      new CarouselImage('9.jpg'),
    ];
  }

  // Функция позволяет вернуться к предыдущей фотографии
  goPrev() {

    if (this.current_image > 0 ) {
      this.current_image--;

      const position = -this.current_image * AppComponent.picture_width;
      this.carouselEl.nativeElement.style.marginLeft = position + 'px';
    }
  }

  // Функция позволяет перейти к следующей фотографии
  goNext() {

    if (this.current_image + 1 < this.pictures.length ) {
      this.current_image++;

      const position = -this.current_image * AppComponent.picture_width;
      this.carouselEl.nativeElement.style.marginLeft = position + 'px';
    }
  }
}
