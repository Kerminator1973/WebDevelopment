import { makeAutoObservable, reaction } from "mobx";
import { ServerError } from "../models/serverError"

export default class CommonStore {
    error: ServerError | null = null;

    // При создании компонента считываем из LocalStorage JWT, если
    // он там сохранился с предыдущей сессии
    token: string | null = window.localStorage.getItem('jwt');
    appLoaded = false;

    constructor() {
        makeAutoObservable(this);

        // Уведомляем подписчиков о том, что изменился JWT. Это позволяет 
        // всем заинтересованным компонентам скорректировать своё
        // состояния. Например, подготовить корректные данные в NavBar
        reaction(
            () => this.token,
            token => {
                if (token) {
                    window.localStorage.setItem('jwt', token);
                } else {
                    window.localStorage.removeItem('jwt');
                }
            }
        );
    }

    setServerError = (error: ServerError) => {
        this.error = error;
    }

    // Функция позволяет сохранить полученный от API токен в localStorage
    setToken = (token: string | null) => {
        this.token = token;
    }

    setAppLoaded = () => {
        this.appLoaded = true;
    }
}