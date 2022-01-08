# Управление зависимостями в Node.js

При создании проекта Node.js генерируются два файла: "package.json" и "package-lock.json". В первом файле описываются конфигурационные параметры, а также зависимости с указанием имени пакета и минимально необходимой версии. В файле "package-lock.json" указывются загруженные в node_modules пакеты с указанием точной версии, hash-кода и источника, из которого пакет был загружен.

Файл "package-lock.json" формируется при выполнении команды `npm install` и его можно не сохранять в репозитарии кода.

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
