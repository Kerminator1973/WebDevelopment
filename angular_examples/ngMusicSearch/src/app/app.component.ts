import {NgModule, Component, Injectable} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {HttpClientModule } from '@angular/common/http';
import {HttpClientJsonpModule, HttpClient } from '@angular/common/http';
import {Routes, RouterModule, Router, ActivatedRoute} from '@angular/router';
import {ReactiveFormsModule, FormControl, FormsModule} from '@angular/forms';
import {Observable} from 'rxjs';

class SearchItem {
  constructor(public name: string,
              public artist: string,
              public link: string,
              public thumbnail: string,
              public artistId: string) {
  }
}


// Сервис SearchService осуществляет поиск треков на сервисе Apple iTunes
// по их названию. Первоначальная реализация использовала http-запросы,
// затем была заменена на JSONP (в соответствии с Activity Task )
@Injectable()
export class SearchService {
  // Тип string, для переменной apiRoot, не указываем, т.е. он явно выводится
  apiRoot = 'https://itunes.apple.com/search';
  results: SearchItem[];

  // Вариант кода использующего Http
  // constructor(private http: Http) { ...

  // Более прогрессивная реализация использует JSONP, которая позволяет
  // обойти проблему CORS
  constructor(private jsonp: HttpClient) {
    this.results = [];
  }

  search(term: string) {
    const promise = new Promise((resolve, reject) => {
      const apiURL = `${this.apiRoot}?term=${term}&media=music&limit=20`;

      // Результат выполнения запроса преобразуется в Promise и при получении
      // положительного ответа от сервиса iTunes, обрабатывает все элементы
      // JSON-а, используя map() и лямбда-функцию преобразования отдельного элемента.
      // Все выделенные объекты SearchItem затем помещаются в коллекцию,
      // которая используется для отображения результата в HTML-коде.
      // См. *ngFor="let track of itunes.results"
      this.jsonp.get(apiURL)
          .toPromise()
          .then(
              (res: any) => { // Success

                console.log(res);

                // К этому моменту, контейнер результатов запроса,
                // которым является this.results заполняется списком
                // объектов SearchItem. Angular подхватит эти данные
                // и отобразит их в шаблоне 'app-root', в ul с классом
                // "list-group", см. ngFor
                this.results = res.results.map((item: any) => {
                  return new SearchItem(
                    item.trackName,
                    item.artistName,
                    item.trackViewUrl,
                    item.artworkUrl30,
                    item.artistId
                  );
                });

                resolve();
              },
              msg => { // Error
                console.log(msg);
                reject(msg);
              }
          );
    });

    // Мы возвращаем объект promise для того, чтобы к вызову функции search()
    // можно было бы применить .then() и реализовать в нём сокрытие сообщения
    // "Loading..."
    return promise;
  }
}

@Component({
  selector: 'app-search',
  template: `<form class="form-inline">
  <div class="form-group">
    <input type="search"
           class="form-control"
           placeholder="Enter search string"
           #search>
  </div>
  <button type="button"
          class="btn btn-primary"
          (click)="onSearch(search.value)">
    Search
  </button>
</form>
<hr />
<div class="text-center">
  <p class="lead"
     *ngIf="loading">Loading...</p>
</div>
<div class="list-group">
  <a [routerLink]="['/artist', track.artistId]"
     class="list-group-item list-group-item-action"
     *ngFor="let track of itunes.results">
    <img src="{{track.thumbnail}}">
    {{ track.name }} <span class="text-muted">by</span> {{ track.artist }}
  </a>
</div>
 `
})
export class SearchComponent {
  private loading = false;

  constructor(private itunes: SearchService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.params.subscribe(params => {
      console.log(params);
      if (params['term']) {
        this.doSearch(params['term']);
      }
    });
  }

  doSearch(term: string) {
    this.loading = true;
    this.itunes.search(term)
      .then(_ => this.loading = false)
      .catch(() => console.log('Возникла ошибка при выполнении запроса'));
  }

  onSearch(term: string) {
    this.router.navigate(['search', {term: term}]);
  }
}

@Component({
  selector: 'app-home',
  template: `
<div class="jumbotron">
  <h1 class="display-3">iTunes Search App</h1>
</div>
 `
})
export class HomeComponent {
}

@Component({
  selector: 'app-header',
  template: `<nav class="navbar navbar-light bg-faded">
  <a class="navbar-brand"
     [routerLink]="['home']">iTunes Search App
  </a>
  <ul class="nav navbar-nav">
    <li class="nav-item"
        [routerLinkActive]="['active']">
      <a class="nav-link"
         [routerLink]="['home']">Home
      </a>
    </li>
    <li class="nav-item"
        [routerLinkActive]="['active']">
      <a class="nav-link"
         [routerLink]="['search']">Search
      </a>
    </li>
  </ul>
</nav>
 `
})
export class HeaderComponent {
  constructor(private router: Router) {
  }

  goHome() {
    this.router.navigate(['']);
  }

  goSearch() {
    this.router.navigate(['search']);
  }
}

@Component({
  selector: 'app-artist-track-list',
  template: `
<ul class="list-group">
	<li class="list-group-item"
	    *ngFor="let track of tracks">
		<img src="{{track.artworkUrl30}}">
		<a target="_blank"
		   href="{{track.trackViewUrl}}">{{ track.trackName }}
		</a>
	</li>
</ul>
 `
})
export class ArtistTrackListComponent {
  private tracks: any[];

  constructor(private jsonp: HttpClient,
              private route: ActivatedRoute) {
    this.route.parent.params.subscribe(params => {
      this.jsonp.get(`https://itunes.apple.com/lookup?id=${params['artistId']}&entity=song`)
          .toPromise()
          .then((res: any) => {
            console.log(res.results);
            this.tracks = res.results.slice(1);
          });
    });
  }
}

@Component({
  selector: 'app-artist-album-list',
  template: `<ul class="list-group">
	<li class="list-group-item"
	    *ngFor="let album of albums">
		<img src="{{album.artworkUrl60}}">
		<a target="_blank"
		   href="{{album.collectionViewUrl}}">{{ album.collectionName }}
		</a>
	</li>
</ul>
 `
})
export class ArtistAlbumListComponent {
  private albums: any[];

  constructor(private jsonp: HttpClient,
              private route: ActivatedRoute) {
    this.route.parent.params.subscribe(params => {
      this.jsonp.get(`https://itunes.apple.com/lookup?id=${params['artistId']}&entity=album`)
          .toPromise()
          .then((res: any) => {
            console.log(res.results);
            this.albums = res.results.slice(1);
          });
    });
  }
}

@Component({
  selector: 'app-artist-video-list',
  template: `
  <ul class="list-group">
	<li class="list-group-item"
	    *ngFor="let video of videos">
		<img src="{{video.artworkUrl60}}">
		<a target="_blank"
		   href="{{video.collectionViewUrl}}">{{ video.trackName }}
		</a>
	</li>
</ul>
 `
})
export class ArtistMusicVideoListComponent {
  private videos: any[];

  constructor(private jsonp: HttpClient,
              private route: ActivatedRoute) {
    this.route.parent.params.subscribe(params => {
      this.jsonp.get(`https://itunes.apple.com/lookup?id=${params['artistId']}&entity=musicVideo`)
          .toPromise()
          .then((res: any) => {
            console.log(res.results);
            this.videos = res.results.slice(1);
          });
    });
  }
}

@Component({
  selector: 'app-artist',
  template: `<div class="card">
  <div class="card-block">
    <h4>{{artist?.artistName}} <span class="tag tag-default">{{artist?.primaryGenreName}}</span></h4>
    <hr />
    <footer>
      <ul class="nav nav-pills">
        <li class="nav-item">
          <a class="nav-link"
             [routerLinkActive]="['active']"
             [routerLink]="['./tracks']">Tracks
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link"
             [routerLinkActive]="['active']"
             [routerLink]="['./albums']">Albums
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link"
             [routerLinkActive]="['active']"
             [routerLink]="['./videos']">Videos
          </a>
        </li>
      </ul>
    </footer>
  </div>
</div>
<div class="m-t-1">
  <router-outlet></router-outlet>
</div>
 `
})
export class ArtistComponent {
  private artist: any;

  constructor(private jsonp: HttpClient,
              private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.jsonp.get(`https://itunes.apple.com/lookup?id=${params['artistId']}`)
          .toPromise()
          .then((res: any) => {
            console.log(res.results);
            this.artist = res.results[0];
            console.log(this.artist);
          });
    });
  }
}

@Component({
  selector: 'app-root',
  template: `
	<app-header></app-header>
	<div class="m-t-1">
    <router-outlet></router-outlet>
  </div>
 `
})
export class AppComponent {
}

// Таблица маршрутизации, которая включает, в том числе, и
// дочернюю таблицу маршрутизации
export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'find', redirectTo: 'search'},
  {path: 'home', component: HomeComponent},
  {path: 'search', component: SearchComponent},
  {
    path: 'artist/:artistId',
    component: ArtistComponent,
    children: [
      {path: '', redirectTo: 'tracks', pathMatch: 'full'},
      {path: 'tracks', component: ArtistTrackListComponent},
      {path: 'albums', component: ArtistAlbumListComponent},
      {path: 'videos', component: ArtistMusicVideoListComponent},
    ]
  },
  {path: '**', component: HomeComponent}
];
