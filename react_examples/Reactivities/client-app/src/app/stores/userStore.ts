import { makeAutoObservable, runInAction } from "mobx";
import agent from "../api/agent";
import { User, UserFormValues } from "../models/user";
import { store } from "./store";
import { history } from '../..';    // См.: createBrowserHistory()

export default class UserStore {
    user!: User | null;

    constructor() {
        makeAutoObservable(this)
    }

    get isLoggedIn() {
        return !!this.user;
    }

    login = async (creds: UserFormValues) => {
        try {
            const user = await agent.Account.login(creds);

            // Сохраняем токен в Store (localStorage)
            store.commonStore.setToken(user.token);

            // Поскольку user устанавливается как результат await-операции,
            // необходимо использовать runInAction()
            runInAction(() => this.user = user);

            // Переходим на главную страницу приложения
            history.push('/activities');

            // Закрываем "модальный диалог" после выполнения запроса в API
            store.modalStore.closeModal();
        }
        catch (error)
        {
            throw error;   
        }
    }

    logout = () => {
        store.commonStore.setToken(null);
        window.localStorage.removeItem('jwt');
        this.user = null;
        history.push('/');
    }

    getUser = async () => {
        try {
            const user = await agent.Account.current();
            runInAction(() => this.user = user);
        } catch (error) {
            console.log(error);
        }
    }

    register = async (creds: UserFormValues) => {
        try {
            const user = await agent.Account.register(creds);
            store.commonStore.setToken(user.token);
            runInAction(() => this.user = user);
            history.push('/activities');
            store.modalStore.closeModal();
        }
        catch (error)
        {
            throw error;   
        }
    }

    setImage = (image: string) => {
        if (this.user) this.user.image = image;
    }
}