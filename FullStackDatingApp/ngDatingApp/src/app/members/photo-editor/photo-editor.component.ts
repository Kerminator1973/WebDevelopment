import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { environment } from '../../../environments/environment';
import { Photo } from '../../_models/Photo';
import { AlertifyService } from '../../_services/alertify.service';
import { AuthService } from '../../_services/auth.service';
import { UserService } from '../../_services/user.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  @Output() getMemberPhotoChange = new EventEmitter<string>();
  baseUrl = environment.apiUrl;
  // Определяем компонент выгрузки изображений на сервер (ng2-file-upload)
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  currentMain: Photo;

  constructor(private authService: AuthService, private userService: UserService,
    private alertify: AlertifyService) { }

  ngOnInit() {
    this.initializeUploader();
  }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    // Создаём объект, через который будет осуществляться загрузка изображений
    // на сервер. Важный момент - явно включаем в заголовок JWT Token
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    // Магическим образом решаем проблему с Credentials. Без этой строки
    // выгрузки файла на сервер не произойдёт
    this.uploader.onAfterAddingFile = (file) => {file.withCredentials = false; };

    // В случае, если файл был успешно выгружен на сервер, будет вызвана
    // callback-функция onSuccessItem(). Поскольку в ответе сервера содержится
    // вся необходимая информация об изображении, ответ сервера используется
    // для формирования объекта "фотография" и добавления его в коллекцию
    // this.photos. После этого, фоттография автоматически появится на экране -
    // Angular об этом позаботиться
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const res: Photo = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain
        };
        this.photos.push(photo);

        // Если была добавлена первая фотография пользователя, считаем, что
        // это изображение пользователя и испольузем его везде, где следует
        // показывать фотографию пользователя (доска, navbar, и т.д.)
        if (photo.isMain) {
          this.authService.changeMemberPhoto(photo.url);
          this.authService.currentUser.photoUrl = photo.url;
          localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
        }
      }
    };
  }

  setMainPhoto(photo: Photo) {

    this.userService.setMainPhoto(this.authService.decodedToken.nameid, photo.id).subscribe(() => {
      // Осуществлем поиск главного изображения в списке изображений.
      // Предполагаем, что будет найден хотя бы один элемент с флагом
      // isMain (и это корректное предположение).
      this.currentMain = this.photos.filter(p => p.isMain === true)[0];

      // У найденного "главного изображения" снимаем флаг isMain
      this.currentMain.isMain = false;

      // Устанавливаем флаг "isMain" на изображение, которое было
      // изменено при вызове функции setMainPhoto через WebAPI
      photo.isMain = true;

      this.authService.changeMemberPhoto(photo.url);
      this.authService.currentUser.photoUrl = photo.url;
      localStorage.setItem('user', JSON.stringify(this.authService.currentUser));

    }, error => {
      this.alertify.error(error);
    });
  }

  deletePhoto(id: number) {
    this.alertify.confirm('Are you sure you want to delete this photo?', () => {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, id).subscribe(() => {
        this.photos.splice(this.photos.findIndex(p => p.id === id), 1);
        this.alertify.success('Photo has been deleted');
      }, error => {
        this.alertify.error('Failed to delete the photo');
      });
    });
  }
}
