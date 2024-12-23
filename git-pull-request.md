# Что такое Pull Request в Git

Pull Request - стандартный способ внесения изменений в чужой репозитарий, опубликованный в исходных текстах на GitHub.com.

Ниже приведены выдержки из официальной документации на сайте [git-scm.com](https://git-scm.com/book/ru/v2/GitHub-%D0%92%D0%BD%D0%B5%D1%81%D0%B5%D0%BD%D0%B8%D0%B5-%D1%81%D0%BE%D0%B1%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D0%BE%D0%B3%D0%BE-%D0%B2%D0%BA%D0%BB%D0%B0%D0%B4%D0%B0-%D0%B2-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B#:~:text=%D0%97%D0%B0%D0%BF%D1%80%D0%BE%D1%81%20%D0%BD%D0%B0%20%D0%BF%D1%80%D0%B8%D0%BD%D1%8F%D1%82%D0%B8%D0%B5%20%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B9%20(Pull,%D1%87%D0%B5%D0%B3%D0%BE%20%D0%B0%D0%B2%D1%82%D0%BE%D1%80%20%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0%20%D0%BC%D0%BE%D0%B6%D0%B5%D1%82%20%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C).

Запрос на принятие изменений (Pull Request) откроет новую ветвь с обсуждением отправляемого кода, и автор оригинального проекта, а так же другие его участники, могут принимать участие в обсуждении предлагаемых изменений до тех пор, пока автор проекта не будет ими доволен, после чего автор проекта может добавить предлагаемые изменения в проект.

Для того, чтобы создать ответвление проекта, зайдите на страницу проекта и нажмите кнопку «Создать ответвление» («Fork»), которая расположена в правом верхнем углу.

Через несколько секунд вы будете перенаправлены на собственную новую проектную страницу, содержащую вашу копию, в которой у вас есть права на запись.

## Типовой Workflow

1. Создайте форк проекта
2. Создайте тематическую ветку на основании ветки master
3. Создайте один или несколько коммитов с изменениями, улучшающих проект
4. Отправьте эту ветку в ваш проект на GitHub
5. Откройте запрос на слияние на GitHub
6. Обсуждайте его, вносите изменения, если нужно
7. Владелец проекта принимает решение о принятии изменений, либо об их отклонении
8. Получите обновлённую ветку master и отправьте её в свой форк

## Использование GitHub CLI

Для создания Pull Reuqest через CLI, можно мспользовать команду:

```shell
gh pr create
```

Подробная информация по команде: `gh pr create --help`
