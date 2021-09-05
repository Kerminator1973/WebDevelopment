import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { Activity, ActivityFormValues } from '../models/activity';
import {history} from '../..';      // См.: createBrowserHistory()
import { store } from '../stores/store';
import { User, UserFormValues } from '../models/user';
import { Photo, Profile } from '../models/profile';
import { PaginatedResult } from '../models/pagination';

// Добавляем функцию, которая будет имитировать задержку при загрузке
// данных через API. Эта функция нужна только для проверки функционала
// Progress Bar
const sleep = (delay: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

// Фиксируем базовый URL разработанного нами API
axios.defaults.baseURL = 'http://localhost:5000/api';

// Используем Axios Interceptors для того, чтобы добавлять в заголовок
// каждого запроса JWT
axios.interceptors.request.use(config => {
    const token = store.commonStore.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Разрабатываем функцию interceptor, которая будет вызываться
// при каждом выполнении запроса к API и будет задерживать обработку
// ответа API выполнение на одну секунду
axios.interceptors.response.use(async response => {
    await sleep(1000);

    // Если в ответе API есть заголовок pagination, то извлекаем JSON
    // ответ и возвращаем полученный документ, добавив в него дополнительный
    // JavaScript-объект pagination с данными из header-а
    const pagination = response.headers['pagination'];
    if (pagination) {
        response.data = new PaginatedResult(response.data, JSON.parse(pagination));
        return response as AxiosResponse<PaginatedResult<any>>;
    }

    return response;
}, (error: AxiosError) => {

    // Обрабатываем все коды ошибок доступа к REST API в одном месте.
    // В общем случае, мы либо выводим Toaster, либо выполняем переход
    // на некоторую страницу приложения (NotFound)
    const {data, status, config} = error.response!;
    switch (status) {
    case 400:

        if (typeof data === 'string') {
            toast.error(data);
        }

        if (config.method === 'get' && data.errors.hasOwnProperty('id')) {
            history.push('/not-found');
        }
        if (data.errors) {
            const modalStateErrors = [];
            for (const key in data.errors) {
                if (data.errors[key]) {
                    modalStateErrors.push(data.errors[key]);
                }
            }
            throw modalStateErrors.flat();
        }
        break;
    case 401:
        toast.error('unauthorised');
        break;
    case 404:
        // Используем History-объект для перехода на форму "NotFound.tsx"
        history.push('not-found');
        break;
    case 500:
        store.commonStore.setServerError(data);
        history.push('/server-error');
        break;
    }
    return Promise.reject(error);
});

// Определяем вспомогательную функцию, которая получает на входе объект
// типа AxiosResponse, а возвращает значение поле "data" (результат запроса).
// Если бы мы написали строку вот так, то она была бы не "type safety", 
// т.к. принимала бы значение типа "any":
//      const responseBody = (response: AxiosResponse) => response.data;
// Для добавления "type safity" добавляем generic type:
const responseBody = <T> (response: AxiosResponse<T>) => response.data;

// Определяем внутренний объект requests, в котором определяем запросы к API
// в терминах RESTful. В определении функций используем generic type <T>,
// фактическое значение которого будет взято при определении высокоуровненых
// функций-wrapper-ов, в частности: Activities.list()
const requests = {
    get: <T> (url: string) => axios.get<T>(url).then(responseBody),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
    delete: <T> (url: string) => axios.delete<T>(url).then(responseBody),
}

// Определяем высокоуровневые функции-wrapper-ы
const Activities = {
    list: (params: URLSearchParams) => axios.get<PaginatedResult<Activity[]>>('/activities', {params})
        .then(responseBody),
    details: (id: string) => requests.get<Activity>(`/activities/${id}`),
    create: (activity: ActivityFormValues) => requests.post<void>('/activities', activity),
    update: (activity: ActivityFormValues) => requests.put<void>(`/activities/${activity.id}`, activity),
    delete: (id: string) => requests.delete<void>(`/activities/${id}`),
    attend: (id: string) => requests.post<void>(`/activities/${id}/attend`, {})
}

const Account = {
    current: () => requests.get<User>('/account'),
    login: (user: UserFormValues) => requests.post<User>('/account/login', user),
    register: (user: UserFormValues) => requests.post<User>('/account/register', user)
}

// Группа функций позволяет получить информацию о профиле пользователя (включая URL-фотографий),
// а также выгрузить фотографию на сервер, через API
const Profiles = {
    get: (username: string) => requests.get<Profile>(`/profiles/${username}`),
    uploadPhoto: (file: Blob) => {

        // Чтобы данные были корректно обработаны на сервере, необходимо
        // создать специализированный запрос с использованием formData
        // и дополнительным указанием типа контента (multipart/form-data).
        // Имя передаваемого блока данных (File) является критичным
        let formData = new FormData();
        formData.append('File', file);
        return axios.post<Photo>('photos', formData, {
            headers: {'Content-type': 'multipart/form-data'}
        });
    },
    setMainPhoto: (id: string) => requests.post(`/photos/${id}/setMain`, {}),
    deletePhoto: (id: string) => requests.delete(`/photos/${id}`),
    updateProfile: (profile: Partial<Profile>) => requests.put(`/profiles`, profile),
    updateFollowing: (username: string) => requests.post(`/follow/${username}`, {}),
    listFollowings: (username: string, predicated: string) => 
        requests.get<Profile[]>(`/follow/${username}?predicate=${predicated}`)
}

// Определяем proxy-объект, через который будет предоставляться доступ
// к методам API
const agent = {
    Activities,
    Account,
    Profiles
}

export default agent;