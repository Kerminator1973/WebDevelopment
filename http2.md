# Использование HTTP/2

Протокол HTTP/1.1 является устаревшим и его использование приводит к замедлению считывания документов при работе по сети Интернет. Более прогрессивными являются протколы [HTTP/2](https://ru.wikipedia.org/wiki/HTTP/2), HTTP/3 (пока редко распространён) и [SPDY](https://ru.wikipedia.org/wiki/SPDY) (разработка Google, постепенно заменяется на HTTP/2).

Ключевые достоинства HTTP/2:

* в рамках одного TCP-соединения передаётся несколько HTTP-запросов, что позволяет избежать многократной установки соединения
* Server Push позволяет передать в браузер файлы до того, как браузер, по факту, их потребует. Это важно, т.к. мы можем знать, что без каскадной таблицы сайт точно работать не будет, но ссылка на каскадную таблицу есть в html-файле, т.е. они будут загружаться последовательно. При использовании Server Push, загрузка каскадной таблицы может начаться одновременно с загрузкой html-файла

Данная инструкция базируется на [статье](https://webapplog.com/http2-node/).

## Использование HTTP/2 совместно с Express

Создание приложения Node.js:

```
npm init
npm i express spdy --save
```

Для работы HTTP/2 требуется использовать защищённое соединение (SSL). Сгенерировать ключи можно, например, утилитой openssl. В частности, openssl встроена в дистрибутив Git. Используя Visual Studio Code можно в окне "Terminal" открыть shell "Git Bush" и ввести команду:

```
openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout privateKey.key -out certificate.crt
```

В результате работы open.ssl будут созданы private-ключ сервера (privateKey.key) и самоподписанный сертификат, с открытым ключём сервера (certificate.crt).

Текст приложения может быть таким:

``` js
const port = 3000
const spdy = require('spdy')
const express = require('express')
const fs = require('fs')

const app = express()

app.get('*', (req, res) => {
    res
        .status(200)
        .json({message: 'ok'})
});

const options = {
    key: fs.readFileSync(__dirname + '/privateKey.key'),
    cert:  fs.readFileSync(__dirname + '/certificate.crt')
};

spdy
    .createServer(options, app)
    .listen(port, (error) => {
        if (error) {
            console.error(error)
            return process.exit(1)
        } else {
            console.log('Listening on port: ' + port + '.')
        }
    });
```

Традиционный запуск Express-приложения выглядит так:

``` js
app.listen(3000, () => {
	console.log('The application is running... The port number is ' + port);
});
```

## Проверка используемого протокола

Для проверки используемого протокола, следует явно указывать протокол подключения к web-серверу: `https://localhost:3000`. Поскольку браузер "не любит" самоподписанные сертификаты, на экран будет выведено сообщение об ошибке, но если нажать на кнопку "Дополнительно", то браузер предложит вариант перехода на сайт, подписанный "ненадёжным" сертификатом.

Если открыть Developer Console F12, выбрать закладку "Network", а также в контекстном меню выбрать "Header Options -> Protocol", то при загрузке страницы, в поле "Protocol" будет отображаться протокол h2. Если не использовать spdy, то в поле протокол можно увидеть "http/1.1".

## Альтернативы

Считается, что при использовании Reverse Proxy, таких как nginx и Apache, поддержка HTTP/2 обеспечивается этими программными решениями. 

В промышленной эксплуатации, рекомендуется использовать подход с использованием Reverse Proxy.
