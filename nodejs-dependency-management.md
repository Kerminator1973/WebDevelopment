# Управление зависимостями в Node.js

При создании проекта Node.js генерируются два файла: "package.json" и "package-lock.json". В первом файле описываются конфигурационные параметры, а также зависимости с указанием имени пакета и минимально необходимой версии. В файле "package-lock.json" указываются загруженные в node_modules пакеты с указанием точной версии, hash-кода и источника, из которого пакет был загружен. 

Файл "package-lock.json" формируется при выполнении команды `npm install` и его можно не сохранять в репозитарии кода. Ценность "package-lock.json" состоит в том, что он позволяет избежать нестабильности кодовой базы из-за расхождений загруженных версий компонентов у разных участников проектной группы. Например, разработчик добавил в проект зависимость от Jest версии 24.3.1 и весь разработанный код протестирован именно с этой версией Jest. Допустим, вышла новая версия Jest - 27.4.7, которая не совместима в 24.3.1. В "package.json" указывается, что в проекте есть зависимость от Jest, а в "package-lock.json" указывается конкретная версия Jest, на которой велась разработка кодовой базы. Когда другой разработчик будет восстнавливать зависимости, NPM восстановит версию 24.3.1, а не 27.4.7. Но если файл "package-lock.json" будет удалён, то NPM загрузит 27.4.7 и это, вероятно, приведёт к возникновению проблем в кодовой базе. См. статью [What Does package-lock.json Do?](https://medium.com/frontend-canteen/what-does-package-lock-json-do-explained-with-diagrams-89c2843ccbe8) by bytefish.

Файл "package.json" неразрывно связан с проектом и удалять его из репозитария нельзя.

## Обновление пакетов

Пакеты систематически обновляются с целью устранения уязвимостей и повышения производительности. Для того, чтобы проверить устаревшие компоненты можно использовать команду `npm outdated`

Пример вывода информации о устаревших компонентах:

```
Package             Current  Wanted  Latest  Location                         Depended by
express              4.17.1  4.17.2  4.17.2  node_modules/express             RUFServerLite
express-session      1.17.1  1.17.2  1.17.2  node_modules/express-session     RUFServerLite
hbs                   4.1.1   4.2.0   4.2.0  node_modules/hbs                 RUFServerLite
jest                 27.3.1  27.4.7  27.4.7  node_modules/jest                RUFServerLite
multer                1.4.2   1.4.4   1.4.4  node_modules/multer              RUFServerLite
mysql2                2.2.5   2.3.3   2.3.3  node_modules/mysql2              RUFServerLite
passport              0.4.1   0.4.1   0.5.2  node_modules/passport            RUFServerLite
supertest             6.1.3   6.1.6   6.1.6  node_modules/supertest           RUFServerLite
swagger-ui           3.52.5  3.52.5   4.1.3  node_modules/swagger-ui          RUFServerLite
swagger-ui-express    4.1.6   4.3.0   4.3.0  node_modules/swagger-ui-express  RUFServerLite
uglify-js           3.13.10  3.14.5  3.14.5  node_modules/uglify-js           RUFServerLite
```

Обновить зависимости в щадящем режиме можно командой `npm update`. Пример вывода результата:

```
Package     Current  Wanted  Latest  Location                 Depended by
passport      0.4.1   0.4.1   0.5.2  node_modules/passport    RUFServerLite
swagger-ui   3.52.5  3.52.5   4.1.3  node_modules/swagger-ui  RUFServerLite
```

В большинстве случае, изменится только файл "package-lock.json", и многие из найденных уязвимостей не будут устранены.

Изменить версию конкретного компонента можно командой: `npm install <packagename>@latest`

Есть специальный package, который принудительно устанавливает самые современные версии - **npm-check-updates**:

```
npx npm-check-updates -u
```

После него нужно выполнить `npm install`. Заметим, что подобное обновление изменит "package.json" и обновление может нарушить работоспособность приложения.

## Аудит безопасности

В **npm** встроен механизм, который осуществляет аудит безопасности: `npm audit report`

Выполнить обновление компонентов исходя из найденных уязвимостей можно командой: `npm audit fix`. Использование ключа `--force` позволяет устранить найденные уязвимости переходом на экспериментальные версии (обычно - нечётные), что может привести к потере работоспособности приложения.
