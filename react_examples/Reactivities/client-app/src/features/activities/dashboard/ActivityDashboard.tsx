import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Loader, Grid } from 'semantic-ui-react';
import { PagingParams } from '../../../app/models/pagination';
import { useStore } from '../../../app/stores/store';
import ActivityFilters from './ActivityFilters';
import ActivityList from './ActivityList';
import ActivityListItemPlaceholder from './ActivityListItemPlaceholder';

// Можно было бы использовать упрощённый вариант определения свойства объекта:
//      export default function ActivityDashboard({activities}: Props) {
// В этом случае мы могли бы написать вместо: Props 
//      {props.activities.map((activity) => (
// вот такой код:
//      {activities.map((activity) => (

// Ниже в коде использовался типовой для JavaScript трюк:
//      {activities[0] && 
//      <ActivityDetails activity={activities[0]} />}
// JSX-код трансформируется в обычный JavaScript-код вызова React-компонента 
// и при исполнении приведённая выше конструкция сначала сравнит activities[0]
// с null/undefined (это происходит т.к. используется логическое «И»), и если 
// значение не пустое, тогда будет вызван React-компонент, которому будет передан 
// нулевой элемент через свойство activity

export default observer( function ActivityDashboard() {

    // Определяем объект для доступа к централизованному хранилищу.
    // Хранилище используется в JSX-коде, например:
    //    <h2>{activityStore.title}</h2>
    const {activityStore} = useStore();
    const {loadActivities, activityRegistry, setPagingParams, pagination} = activityStore;
    const [loadingNext, setLoadingNext] = useState(false);

    function handleGetNext() {
        setLoadingNext(true);
        setPagingParams(new PagingParams(pagination!.currentPage + 1));
        loadActivities().then(() => setLoadingNext(false));
    }

    // Загружаем список элементов из API, используя Axios и систему
    // управления состояниями приложения ActivityStore
    useEffect(() => {
        if (activityRegistry.size <= 1) loadActivities();
    }, [loadActivities, activityRegistry.size]);

    // Если осуществляется загрузка страницы, то возвращает специализированный
    // компонент, в котором используются Dimmer и Loader.
    // Раньше был вот такой код, но пото его заменили на Placeholders...
    //if (activityStore.loadingInitial && !loadingNext) 
    //    return <LoadingComponent content='Loading activities...' />    

    return (
        <Grid>
            <Grid.Column width='10'>
                {activityStore.loadingInitial && !loadingNext ? (
                    <>
                        <ActivityListItemPlaceholder />
                        <ActivityListItemPlaceholder />
                    </>
                ) : (
                    <InfiniteScroll
                        pageStart={0}
                        loadMore={handleGetNext}
                        hasMore={!loadingNext && !!pagination && pagination.currentPage < pagination.totalPages}
                        initialLoad={false}
                    >
                        <ActivityList />
                    </InfiniteScroll>
                )}

            </Grid.Column>
            <Grid.Column width='6'>
                <ActivityFilters />
            </Grid.Column>
            <Grid.Column width={10}>
                <Loader active={loadingNext} />
            </Grid.Column>
        </Grid>
    )
})
