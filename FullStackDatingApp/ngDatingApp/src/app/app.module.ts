import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule, TabsModule, BsDatepickerModule, PaginationModule, ButtonsModule, ModalModule } from 'ngx-bootstrap';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxGalleryModule } from 'ngx-gallery';
import { FileUploadModule } from '../../node_modules/ng2-file-upload';
import { TimeAgoPipe} from 'time-ago-pipe';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { AuthService } from './_services/auth.service';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { AlertifyService } from './_services/alertify.service';
import { MemberListComponent } from './members/member-list/member-list.component';
import { ListsComponent } from './lists/lists.component';
import { MessagesComponent } from './messages/messages.component';
import { appRoutes } from './routes';
import { AuthGuard } from './_guards/auth.guard';
import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { UserService } from './_services/user.service';
import { ErrorInterceptorProvider } from './_services/error.interceptor';
import { MemberCardComponent } from './members/member-card/member-card.component';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberEditComponent } from './members/member-edit/member-edit.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberListResolver } from './_resolvers/member-list.resolver';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { PhotoEditorComponent } from './members/photo-editor/photo-editor.component';
import { ListsResolver } from './_resolvers/lists.resolver';
import { MessagesResolver } from './_resolvers/messages.resolver';
import { MemberMessagesComponent } from './members/member-messages/member-messages.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { HasRoleDirective } from './_directives/hasRole.directive';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { PhotoManagementComponent } from './admin/photo-management/photo-management.component';
import { AdminService } from './_services/admin.service';
import { RolesModalComponent } from './admin/roles-modal/roles-modal.component';

export function tokenGetter() {
    return localStorage.getItem('token');   // Указываем, где хранится bearer token
}


@NgModule({
   declarations: [
      AppComponent,
      NavComponent,
      HomeComponent,
      RegisterComponent,
      ListsComponent,
      MessagesComponent,
      MemberListComponent,
      MemberCardComponent,
      MemberDetailComponent,
      MemberEditComponent,
      MemberMessagesComponent,
      PhotoEditorComponent,
      TimeAgoPipe,
      AdminPanelComponent,
      HasRoleDirective,
      UserManagementComponent,
      PhotoManagementComponent,
      RolesModalComponent
   ],
   imports: [
      BrowserModule,
      HttpClientModule,
      FormsModule,
      ReactiveFormsModule,
      BsDropdownModule.forRoot(),
      BsDatepickerModule.forRoot(),
      PaginationModule.forRoot(),
      TabsModule.forRoot(),
      ButtonsModule.forRoot(),
      JwtModule.forRoot({   // Включив JwtModule в imports мы активируем механизм автоматического
          config: {         // добавления поля "Authorization" с bearer token для Routes из
              tokenGetter: tokenGetter,                 // ...
              whitelistedDomains: ['localhost:5000'],   // "белого списка"
              blacklistedRoutes: ['localhost:5000/api/auth']
          }
      }),
      RouterModule.forRoot(appRoutes),
      // Библиотека заменяющая bootstrap.js в Angular
      NgxGalleryModule,
      // Библиотека, позволяющая выгружать изображения  на сервер
      FileUploadModule,
      // Добавляем компонент "Модальный диалог"
      ModalModule.forRoot()
   ],
   providers: [
      // Указываем, что объект класса является сервисом и может быть Injected в другие классы
      AuthService,
      // Определяем AlertifyJS, как Injectable-сервис
      AlertifyService,
      // Добавляем сервис AuthGuard, который осуществляет проверку
      // права доступа пользователя к определённым Routes приложения
      AuthGuard,
      // Сервис обеспечивает проверку признака внесения изменения в полях ввода
      // данных формы (dirty) и принятие решения о необходимости перехода в таблице
      // Routes. Целевая задача - уведомить пользователя о том, что выполнив переход
      // через навигационную панель, введённые данные могут быть потеряны
      PreventUnsavedChanges,
      // Сервис преобразования сообщений об ошибках в HTTP-заголовке в строку текста
      ErrorInterceptorProvider,
      // Ещё один сервис позволяет запрашивать информацию о пользователях сервиса знакомств
      UserService,
      // Дополнительные сервисы, которые осуществляют загрузку данных перед переходом
      // на Route Angular-приложения
      MemberDetailResolver,
      MemberListResolver,
      MemberEditResolver,
      ListsResolver,
      MessagesResolver,
      AdminService
   ],
   entryComponents: [
      RolesModalComponent
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
