import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../_models/User';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  // Указываем, что у этого компонента есть свойство, устанавливаемое
  // родительским компонентом, например, посредством использования
  // директивы ngFor. Инициализация выглядит, например, так:
  // <app-member-card [user]="user"></app-member-card>
  @Input() user: User;

  constructor(private authService: AuthService, private userService: UserService,
    private alertify: AlertifyService) { }

  ngOnInit() {  }

  sendLike(id: number) {
    this.userService.sendLike(this.authService.decodedToken.nameid, id).subscribe(data => {
      this.alertify.success('You have liked: ' + this.user.knownAs);
    }, error => {
      this.alertify.error(error);
    });
  }
}
