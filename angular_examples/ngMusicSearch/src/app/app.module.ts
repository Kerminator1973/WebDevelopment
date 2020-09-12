import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientJsonpModule, HttpClient } from '@angular/common/http';
import { Routes, RouterModule, Router, ActivatedRoute} from '@angular/router';
import { AppComponent, SearchService, routes } from './app.component';
import { SearchComponent, HomeComponent, HeaderComponent } from './app.component';
import { ArtistAlbumListComponent, ArtistTrackListComponent,
  ArtistMusicVideoListComponent, ArtistComponent } from './app.component';


@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {useHash: true})
  ],
  declarations: [
    AppComponent,
    SearchComponent,
    HomeComponent,
    HeaderComponent,
    ArtistAlbumListComponent,
    ArtistTrackListComponent,
    ArtistMusicVideoListComponent,
    ArtistComponent
  ],
  bootstrap: [AppComponent],
  providers: [SearchService]
})
export class AppModule { }
