import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Button, Header, Segment } from 'semantic-ui-react';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import {v4 as uuid} from 'uuid';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import MyTextInput from '../../../app/common/form/MyTextInput';
import MyTextArea from '../../../app/common/form/MyTextArea';
import MySelectInput from '../../../app/common/form/MySelectInput';
import { categoryOptions } from '../../../app/common/options/categoryOptions';
import MyDateInput from '../../../app/common/form/MyDateInput';
import { ActivityFormValues } from '../../../app/models/activity';

export default observer (function ActivityForm() {

    // Хук useHistory позволяет получить объект для управления переходами
    // между Routes
    const history = useHistory();

    const {activityStore} = useStore();
    const {createActivity, updateActivity, loadActivity, loadingInitial} = activityStore;
    const {id} = useParams<{id: string}>();

    // Определяем состояние, как объект состоящий из нескольких полей
    const [activity, setActivity] = useState<ActivityFormValues>(new ActivityFormValues());

    // Определяем схему валидации значений, вводимых в полях формы
    const validationSchema = Yup.object({
        title: Yup.string().required('The activity title is required'),
        description: Yup.string().required('The activity description is required'),
        category: Yup.string().required('The category title is required'),
        date: Yup.string().required('The activity date is required').nullable(),
        venue: Yup.string().required('The activity venue is required'),
        city: Yup.string().required('The activity city is required')
    });

    // В чтсле параметров хука используется список состоящий из переменных
    // [id, loadActivity]. Этот список называется "зависимостями" (dependancies).
    // Смысл термина «зависимости» состоит именно в том, что код, находящийся внутри
    // хука, зависит от изменения значений этих двух переменных
    useEffect(() => {
        if (id) loadActivity(id).then(activity => setActivity(new ActivityFormValues(activity)))
    }, [id, loadActivity]);

    // В обработчике нажатия на кнопку "Submit", в зависимости от установленного режима,
    // по разному устанавливаем адрес возврата к предыдущей форме
    function handleFromSubmit(activity: ActivityFormValues) {

        if (!activity.id) {
            
            // Добавляем к объекту с ещё не введёнными значениями сгенерированный uuid
            let newActivity = {
                ...activity,
                id: uuid()
            };

            // Создаём новую Activity через API и переходим на Route
            createActivity(newActivity).then(() => history.push(`/activities/${newActivity.id}`));

        } else {

            // Изменяем уже существующую Activity и переходим на Route
            updateActivity(activity).then(() => history.push(`/activities/${activity.id}`));
        }
    }

    if (loadingInitial) return <LoadingComponent content='Loading activity...' />

    return (
        <Segment clearing>
            <Header content='Activity Details' sub color='teal' />
            <Formik 
                validationSchema={validationSchema}
                enableReinitialize 
                initialValues={activity} 
                onSubmit={values => handleFromSubmit(values)}>
                {({handleSubmit, isValid, isSubmitting, dirty}) => (
                    <Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
                        <MyTextInput name='title' placeholder='Title' />
                        <MyTextArea rows={3} placeholder="Description" name='description' />
                        <MySelectInput options={categoryOptions} placeholder="Category" name='category' />
                        <MyDateInput 
                            placeholderText="Date" 
                            name='date'
                            showTimeSelect
                            timeCaption='time'
                            dateFormat='MMMM d, yyyy h:mm aa'
                        />
                        <Header content='Location Details' sub color='teal' />
                        <MyTextInput placeholder="City" name='city' />
                        <MyTextInput placeholder="Venue" name='venue' />
                        <Button 
                            disabled={isSubmitting || !dirty || !isValid}
                            loading={isSubmitting} floated='right' positive type='submit' content='Submit' />
                        <Button as={Link} to='/activities' floated='right' type='button' content='Cancel' />
                    </Form>
                )}
            </Formik>
        </Segment>
    )
})