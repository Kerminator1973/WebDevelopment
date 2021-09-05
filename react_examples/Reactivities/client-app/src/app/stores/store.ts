import { createContext, useContext } from "react";
import ActivityStore from "./activityStore";
import CommentStore from "./commentStore";
import CommonStore from "./commonStore";
import ModalStore from "./modalStores";
import ProfileStore from "./profileStore";
import UserStore from "./userStore";

// MobX позволяет использовать несколько хранилищ состояний. 
// Определяем interface для строгой типизации
interface Store {
    activityStore: ActivityStore;
    commonStore: CommonStore;
    userStore: UserStore;
    modalStore: ModalStore;
    profileStore: ProfileStore;
    commentStore: CommentStore;
}

// Определяем и инициализируем объект централизированного хранилища
export const store: Store = {
    activityStore: new ActivityStore(),
    commonStore: new CommonStore(),
    userStore: new UserStore(),
    modalStore: new ModalStore(),
    profileStore: new ProfileStore(),
    commentStore: new CommentStore()
}

// Генерируем функциональный компонент, через который будет
// доступно наше хранилище. Этот функциональный компонент должен
// быть определён в иерархии компонентов JSX на самом высоком
// уровне - в "index.tsx", см.:
//      <StoreContext.Provider value={store}>
export const StoreContext = createContext(store);

// Для удобства, определяем специальную wrapper-функцию
// для доступа к хранилищу из дочерних компонентов. Например,
// эта функция используется в "App.tsx"
export function useStore() {
    return useContext(StoreContext);
}