import { Injectable } from '@angular/core';
import { MemberEditComponent } from '../members/member-edit/member-edit.component';
import { CanDeactivate } from '@angular/router';

@Injectable()
export class PreventUnsavedChanges implements CanDeactivate<MemberEditComponent> {
    canDeactivate(component: MemberEditComponent) {
        // Если поля ввода формы были изменены, уточнить у пользователя,
        // готов ли он(а) потерять свои правки в результате перехода
        if (component.editForm.dirty) {
            return confirm('Are you sure you want to continue? Any unsaved changes will be lost');
        }

        // Если никаких правок в форме не было сделано, то и спрашивать не о чем
        return true;
    }
}
