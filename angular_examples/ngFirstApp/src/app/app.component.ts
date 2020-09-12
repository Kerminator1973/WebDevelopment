import { Input, Output, EventEmitter, Component, VERSION, ViewEncapsulation,
  AfterViewInit, ViewChild, ElementRef, Directive, Renderer,
  HostListener, HostBinding, OnInit } from '@angular/core';

// Импортируем класс Pipe, который позволит создать Custom Pipe
import { Pipe } from '@angular/core';

// Импортируем вспомогательные классы из модуля @angular/forms
import { FormsModule, FormGroup, FormControl, ReactiveFormsModule,
  Validators } from '@angular/forms';

  // Импортируем классы необходимые для выполнения Dependency Injection
import { Inject, InjectionToken } from '@angular/core';

// Определяем токен...
export const MAX_JOKES_TOKEN = new InjectionToken('Max Jokes');

class Joke {
  public setup: string;
  public punchline: string;

  constructor(setup: string, punchline: string) {
    this.setup = setup;
    this.punchline = punchline;
  }
}


// Определяем собственный Custom Pipe, который будет заменять
// указанные слова на строку символов "@!?"
@Pipe({
  name:"clean"
})
export class CleanPipe {
  transform(value: string, bad_words: string): string {

    // Разбиваем строку с грубыми словами на массив
    var arr = bad_words.split(',')
    for (var word of arr) {

      // Заменяем все вхождения грубых слов на символы маски.
      // Кстати, на сайте http://jsben.ch/LFfWA можно посмотреть
      // benchmark выполнения разных алгоритмов. Связка split/join
      // работает значительно быстрее регулярных выражений
      value = value.split(word).join('$%#@!');
    }

    // Возвращаем модифицированное значение
    return value;
  }
}


// Для того, чтобы иметь возможность конфигурировать пользовательскую
// директиву (Custom Directive), используя @Input(), необходимо
// экспортировать специализированный интерфейс.
// Таким образом, компенсируется ошибка в примере книги «Angular: 
// From Theory To Practice» by Asim Hussain. В книге было указано:
//    @Input('ccCardHover') config: Object = { ...
// но такой код не собирается актуальными версиями Node.js и
// мне пришлось переписать код вот так:
//    @Input('ccCardHover') config: CardHoverConfig = { ...
export interface CardHoverConfig {
  querySelector: String;
}

// Определяем Custom Directive, которая позволяет выполнять некоторый код
// при определении DOM-элемента. В нашем случае, у элемента будет
// устанавливаться свойство 'backgroundColor'.
// В данном примере, Custom Directive будет использован у JokeComponent
@Directive({
  selector: '[ccCardHover]'
})
export class CardHoverDirective {

  // Binding позволяет устанавливать/удалять класс у элемента, в зависимости
  // от фактического значения переменной ishovering. Как только мы меняем
  // эту переменную в коде, renderer модифицирует DOM и у элемента с
  // Custom Directive "ccCardHover" появляется, или исчезает рамка
  @HostBinding('class.card-outline-primary') private ishovering: boolean;

  // Определяем набор конфигурационных параметров, которые могут 
  // был использованы непосредственно в шаблоне HTML-кода.
  // Пример, см.: <div class="card card-block" [ccCardHover]...
  // Значение свойства используется в методах onMouseOver() и
  // onMouseOut()
  @Input('ccCardHover') config: CardHoverConfig = {
    querySelector: '.card-text'
  };

	constructor(private el:ElementRef, private renderer: Renderer) {
    // Следующая строка кода закомментирована - вся работа осуществляется посредством
    // HostListener-а. Но пример я сохранил для понимания того, что можно
    // делать в конструкторе Custom Directive
		// renderer.setElementStyle(el.nativeElement, 'backgroundColor', 'gray');
  }

  @HostListener('mouseover') onMouseOver() {
    // Когда курсор оказывается над элементом с установленной
    // Custom Directive "ccCardHover", то у элемента с классом
    // '.card-text' устанавливается свойство 'display' в значение
    // 'block' и это не требует разработки какого-либо кода в
    // в компоненте (Component).
    let part = this.el.nativeElement.querySelector(this.config.querySelector);
    this.renderer.setElementStyle(part, 'display', 'block');

    this.ishovering = true;
  }

  @HostListener('mouseout') onMouseOut() {
    // При выходе за пределы элемента, свойство 'display' элемента
    // с классом '.card-text' будет возвращего в 'none'
    const part = this.el.nativeElement.querySelector(this.config.querySelector);
    this.renderer.setElementStyle(part, 'display', 'none');

    this.ishovering = false;
  }
}

@Component({
  selector: 'joke',
  template: `
<div class="card card-block" [ccCardHover]="{querySelector: '.card-text'}">
  <h4 class="card-title">
    <ng-content select="span"></ng-content>
  </h4>
  <p class="card-text" [style.display]= "'none'">
    <ng-content select="h1"></ng-content>
  </p>
<a (click)="deleteItem()" class="btn btn-danger">Delete</a>  
</div>
  `
})
export class JokeComponent {
  @Input('joke') data: Joke;
  @Output() jokeDeleted = new EventEmitter<Joke>();

  deleteItem() {
    this.jokeDeleted.emit(this.data);
  }
}

@Component({
  selector: 'joke-form',
  template: `
<div class="card card-block">
  <h4 class="card-title">Create Joke</h4>
  <form novalidate
        [formGroup]="form">
    <div class="form-group"
         [ngClass]="{
        'has-danger': setup.invalid && (setup.dirty || setup.touched),
        'has-success': setup.valid && (setup.dirty || setup.touched)
      }">
      <input type="text"
             class="form-control"
             placeholder="Enter the setup"
             formControlName="setup">
      <div class="form-control-feedback"
           *ngIf="setup.errors && (setup.dirty || setup.touched)">
        <p *ngIf="setup.errors.required">Setup is required</p>
      </div>
    </div>
    <div class="form-group"
         [ngClass]="{
        'has-danger': punchline.invalid && (punchline.dirty || punchline.touched),
        'has-success': punchline.valid && (punchline.dirty || punchline.touched)
      }">
      <input type="text"
             class="form-control"
             placeholder="Enter the punchline"
             formControlName="punchline">
      <div class="form-control-feedback"
           *ngIf="punchline.errors && (punchline.dirty || punchline.touched)">
        <p *ngIf="punchline.errors.required">Punchline is required</p>
      </div>
    </div>
    <button type="button"
            class="btn btn-primary"
            [disabled]="form.invalid"
            (click)="createJoke(setup.value, punchline.value)">Create
    </button>
  </form>
</div>
  `,
  styles: [
    `
    .card {
      background-color: gray;
    }
    `
  ],
  encapsulation: ViewEncapsulation.Emulated
})
export class JokeFormComponent implements OnInit {
  @Output() jokeCreated = new EventEmitter<Joke>();

  // Определяем форму и входящие в неё органы управления
  form: FormGroup;
  punchline: FormControl;
  setup: FormControl;

  ngOnInit() {
    // Фактически создаём переменные, которые используются
    // в HTML-шаблоне при определении связей этих переменных
    // с органами управления, определёнными в HTML-шаблоне
    this.createFormControls();
    this.createForm();
  }

  createFormControls() {
    // Создаём органы управления
    this.setup = new FormControl('', Validators.required);
    this.punchline = new FormControl('', Validators.required);
  }

  createForm() {
    // Включаем ранее созданные органы управления в форму
    this.form = new FormGroup({
      punchline: this.punchline,
      setup: this.setup
    });
  }

  createJoke(setup: string, punchline: string) {
    this.jokeCreated.emit(new Joke(setup, punchline));
  }
}

// Определяем провайдер (сервис), который будет являться контейнером шуток
// для компонента joke-list.
// По сути, класс JokeService будет являться Model для JokeListComponent.
// JokeListComponent, в свою очередь содержит View, определённый в шаблоне
// html-кода и Controller, определённый как javascript-код в реализации
// класса JokeListComponent
export class JokeService {
  jokes: Joke[];

  constructor(@Inject(MAX_JOKES_TOKEN) public maxJokes: number) {

    this.jokes = [
      new Joke('What did the cheese say when it looked in the mirror?', 'Hello-me (Halloumi)'),
      new Joke('What kind of cheese do you use to disguise a small horse?', 'Mask-a-pony (Mascarpone)'),
      new Joke('A kid threw a lump of cheddar at me', 'I thought \‘That\’s not very mature\’'),
    ];
  }

  addJoke(joke) {

    // Если достигнуто максимальное количество шуток, то удаляем самую старую шутку

    // TODO: подсчёт количества шуток сделан не корректно. В действительности, код
    // позволяет работать с maxJokes + 2 шутками, а не с maxJokes. Это не принципиально
    // для данного упражнения (Activity Task), но бездумно копировать этот код нельзя
    if (this.jokes.length > (this.maxJokes + 1)) {
      this.jokes.splice(this.maxJokes, this.jokes.length - (this.maxJokes + 1));
    }

    // Новую шутку помещаем в самое начало
    // Push new joke to the front
    this.jokes.unshift(joke);
  }

  deleteJoke(joke) {
    debugger;
    const indexToDelete = this.jokes.indexOf(joke);
    if (indexToDelete !== -1) {
      this.jokes.splice(indexToDelete, 1);
    }
  }
}

// В шаблоне использованы для разных подхода наполнения его содержимым:
// Конструкция с использованием *ngFor позволяет размножить объект Joke
// (доступный по селектору joke), используя контейнер jokes, входящий
// в состав компонента JokeListComponent.
// Конструкция с использованием <ng-content></ng-content> называется
// content projection и позволяет вставить content из родительского
// компонента (AppComponent): <joke [joke]="joke">...</joke>
//
// Ещё одно важное изменение внесённое позднее, связано с использованием
// механизма Dependency Injection. Из класса JokeListComponent был
// вынесен функционал связанный с контейнером шуток и этот функционал
// был перенесён в отдельный сервис - jokeService.
@Component({
  selector: 'joke-list',
  template: `
  <joke-form (jokeCreated)="jokeService.addJoke($event)"></joke-form>
  <h4 #header>View Jokes</h4>
  <joke *ngFor="let j of jokeService.jokes" [joke]="j" (jokeDeleted)="jokeService.deleteJoke($event)">
    <span> {{ j.setup | clean:'boo,damn,hell' }} ? </span>
    <h1> {{ j.punchline  | clean:'boo,damn,hell' }} </h1>
  </joke>
  <h4>Content Jokes</h4>
  <ng-content></ng-content>
  `
})
export class JokeListComponent implements AfterViewInit {

  // Внедряем (injection) код внешего объекта JokeService в JokeListComponent
  constructor(private jokeService: JokeService) {
  }

  // Определяем ссылку на элемент шаблона, с идентификатором "#header"
  @ViewChild("header", { static: false }) headerEl: ElementRef;

  ngAfterViewInit() {
    console.log(`ngAfterViewInit - headerEl is ${this.headerEl}`);

    // Используя ссылку на элемент DOM, изменяем его текстовое содержимое
    this.headerEl.nativeElement.textContent = "Best Joke Machine";
  }
}

// В шаблоне корневого компонента включается компонент "список шуток",
// но кроме этого, еще и используется механизм content projection,
// который проецирует определённый в классе AppComponent компонент joke
// в компонент JokeListComponent. Это позволяет иллюстрировать разные
// способы формирования контента: через шаблон и посредством content
// projection. Объект класса Joke, определённый здесь, будет спроецирован
// в область <ng-content></ng-content> класса JokeListComponent 
// (селектор joke-list)
@Component({
  selector: 'app-root',
  template: `
  <joke-list>
    <joke [joke]="joke">
      <span class="setup"> {{joke.setup}}? </span>
      <h1 class="punchline"> {{joke.punchline}} </h1>
    </joke>
  </joke-list>
  `,
})
export class AppComponent {
  title = 'app';
  joke: Joke = new Joke("A kid threw a lump of cheddar at me",
    "I thought that's not very mature");
}
