import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent, ArticlesListComponent, AsyncPipeComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent, ArticlesListComponent, AsyncPipeComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
