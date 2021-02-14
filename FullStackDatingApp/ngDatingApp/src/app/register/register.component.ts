import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { User } from '../_models/User';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  // Модель, в которой будут хранится значения, вводимые в органах управления формы
  user: User;

  // Определяем Reactive Form - используется в качестве альтернативы Templare Forms
  registerForm: FormGroup;

  // Определяем набор конфигурационных параметров для органа ввода даты (BsDatapicker)
  bsConfig: Partial<BsDatepickerConfig>;

  // Добавляем атрибут, посредством которого можно будет передавать
  // события родительскому компоненту
  @Output() cancelRegister = new EventEmitter();

  constructor(private authService: AuthService, private router: Router,
    private alartify: AlertifyService, private fb: FormBuilder) { }

  ngOnInit() {
    this.bsConfig = {
      containerClass: 'theme-red'
    };
    this.createRegisterForm();
  }

  // Функция осуществляет регистрацию органов управления в Reactive Form
  createRegisterForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],                         // Тип: radio-button
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: [null, Validators.required], // Тип: дата
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {validator: this.passwordMatchValidator});
  }

  // Функция осуществляет сравнение введённого пароля и его копии. Функция
  // реализует т.н. "Custom validation". Функция возвращает null, если содержимое
  // полей редактирования является корректным. В случае, если валидация не была
  // успешной, следует вернуть набор полей, позволяющих идентифицировать причину
  // ошибочности введённых данных
  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : {'mismatch': true};
  }

  // Метод используется для регистрации пользователя
  register() {
    if (this.registerForm.valid) {

      // Создаём копию данных, введённых на форме в объекте user,
      // имеющего тип User. Функция Object.assign() использует
      // первый параметр, в качестве target, а второй параметр, в
      // качестве source и копирует поля из из source to target
      this.user = Object.assign({}, this.registerForm.value);

      // Осуществляем регистрацию пользователя с указанными полями
      this.authService.register(this.user).subscribe(() => {
        this.alartify.success('Registration successful');
      }, error => {
       this.alartify.error(error);
      }, () => {

        // Если регистрация пользователя прошла успешно, то
        // автоматически выполняем вход на сайт под указанным
        // логином, с указанным паролем и переводим
        // пользователя на страницы members
        this.authService.login(this.user).subscribe(() => {
          this.router.navigate(['/members']);
        });
      });
    }
  }

  // Обработчик нажатия кнопки "Cancel"
  cancel() {

    // Генерируем события для родительского компонента
    this.cancelRegister.emit(false);
  }
}
