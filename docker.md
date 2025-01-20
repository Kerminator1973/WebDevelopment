# Контейнеризация

Понятие **Linux контейнер** стандартизовано организацией Open Container Initiative [OCI](https://opencontainers.org/) и определено как "стандартная единица программного обеспечения, которая упаковывает код и его зависимости таким образом, чтобы программное обеспечение могло работать быстро и надёжно на разных компьютерах".

Наиболее распространёнными решениями являются:

- Docker - позволяет создавать и запускать контейнер
- Docker Compose - позволяет запускать несколько разных контейнеров на одной машине, используя один управляющий скрипт
- Kubernetes - позволяет развертывать множество контейнеров на разных машинах, используя комплексные стратегии развертывания

Предположим, что у нас есть Node.js-код:

```js
import { createServer } from 'http';
import { hostname } from 'os';

const version = 1;
const server = createServer((req, res) => {
    let i = 1e7; while (i > 0) { i--;};
    res.end(`Hello from ${hostname()} (v${version})`);
});
server.listen(8080);
```

Для того, чтобы запустить этот код, нам нужен файл "package.json". Важно добавить в файл "package.json" команду запуска приложения, а также указать модульную систему:

```json
  "scripts": {
    "start": "node app.js"
  },
  "type": "module"
```

Мы можем разработать специальный скрипт для [Docker](https://www.docker.com/) и сохранить его в специальный файл "Dockerfile":

```docker
FROM node:14-alpine
EXPOSE 8080
COPY app.js package.json /app/
WORKDIR /app
CMD ["npm", "start"]
```

Этот файл даёт Docker-у указания:

- использовать образ "node:14-alpine" в качестве базового
- использовать порт 8080 для доступа к приложению внутри контейнера
- скопировать из текущей машины в контейнер файлы app.js и package.json (в папку /app)
- использовать папку /app контейнера в качестве рабочей
- после запуска контейнера запустить в нём команду `npm start`

Собрать Docker-образ можно командой `docker build .`

Узнать короткий идентификатор образа можно командой `docker images`. Пример вывода:

```console
developer@developer-HP-ENVY-15-Notebook-PC:~/projects/docker-tests$ docker images
REPOSITORY               TAG       IMAGE ID       CREATED          SIZE
<none>                   <none>    6acb3296b4e3   15 seconds ago   119MB
<none>                   <none>    873dc75a8cac   13 minutes ago   119MB
<none>                   <none>    9a6e9419ba53   24 minutes ago   119MB
```

В логе сборки будет указан идентификатор образа, который можно использовать для его запуска, например: 

```console
 => [2/3] COPY app.js package.json /app/                                   0.4s
 => [3/3] WORKDIR /app                                                     0.0s
 => exporting to image                                                     0.0s
 => => exporting layers                                                    0.0s
 => => writing image sha256:6acb3296b4e3f5fb075e89cfb5686cb177b57e1808f61  0.0s
```

Соответственно, запустить этот образ можно командой:

```shell
docker run -it -p 8080:8080 6acb3296b4e3
```

Остановить все контейнеры можно командой:

```shell
docker stop $(docker ps -a -q)
```

Чтобы не мучаться с цифровыми идентификаторами образов, мы можем указать имя образа явным образом, например:

```shell
docker build -t hello-web:v1 .
docker run -it -p 8080:8080 hello-web:v1
```

Заметим, что при каждой сборке создаётся новый image. Список images можно посмотреть командой:

```shell
docker images
```

Удалить image можно командой: `docker rmi [imagetag]`. Ключ `-f` позволяет принудительно удалить образ.

Обычно используется не один контейнер, а группа контейнеров, работающих совместно (см. Docker Compose). Конейнер представляет собой песочницу и не может получать неконтролируемый доступ к ресурсам хостовой операционной системы. Также другие контейнеры не могут получать неконтролируемый доступ к данным контейнера, т.е. контейнер является изолированной песочницей.

### Где могут храниться образы?

Основное место хранения - Docker Hub, однако, подобный сервис предлагают: Docker Registry, Google Cloud Container Registry, Amazon Elastic Container Registry.

## Kubernetes

Kubernetes - средства оркестрации контейнерами, выполняет следующие действия:

- позволяет объединять множество nodes в один логический кластер, добавлять и удалять nodes динамически, без влияния на общую работоспособность кластера
- гарантирует, что система будет всегда доступна. Если конкретный контейнер становится недоступен, Kubernetes перезапускает его
- предоставляет функционал service discovery и load balancing
- предоставляет доступ к хранилищам данных (persistances)
- автоматически обновляет программное обеспечение и позволяет откатиться на предыдущую версию без _downtime_
- предоставляет хранилище секретов и чувствительных данных, а также соответствующую систему управления

Для управления кластером используется [kubectl](https://kubernetes.io/docs/tasks/tools/).

Для изучения технологии рекомендуется использовать кластер из одного node - **minicube**

Ключевые термины Kubernates:

- **deployment** - по сути, этот термин обозначает систему, т.е. что-то что запускается в работу. В deployment, например, можно добавить ещё один образ. Создать deployment можно командой: `kubectl create deployment hello-web --image=hello-web:v1`
- **pod** - это запущенный образ, или группа образов запущенная на одной машине. Получить список pod-ов можно командой: `kubectl get pods`
- **expose** - обеспечить видимость портов pod-а. Выполнить expose можно командой: `kubectl expose deployment hello-web --type=LoadBalancer --port=8080 minicube service hello-web`
- **scale**: выполнить масштабирование, например, поднять несколько дополнительных машин с заданным образом
- **rollout**: обновить определённый образ на работающих машинах

## Практика - запуск контейнера с Postgres

Проверка корректности установки Docker: `docker --version`

Для того, чтобы запустить контейнер с Postgres можно не разрабатывать Dockerfile - достаточно указать необходимые параметры в команджной строке:

```shell
sudo docker run -p 5432:5432 --name pglocal -e POSTGRES_PASSWORD=developer -d postgres
```

Эта команда запустит контейнер PostgreSQL в фоновом (_detached_) режиме и присвоит ему имя pglocal. Пароль указывается явным образом.

Ключевой параметр `-p 5432:5432` который отвечает за mapping портов и без которого достучаться из хостовой машины к Docker-образу гостевой машины не удастся.

Посмотреть имена доступных контейнеров можно командой:

```shell
sudo docker ps
```

Вывод может выглядеть следующим образом:

```output
CONTAINER ID   IMAGE      COMMAND                  CREATED          STATUS          PORTS      NAMES
0926cd3bed8e   postgres   "docker-entrypoint.s…"   18 minutes ago   Up 18 minutes   5432/tcp   pglocal
```

Если контейнер будет создан, но не запущен, мы можем запустить его командой:

```shell
sudo docker start pglocal
```

Подключиться к контейнеру и запустить управляющую консоль можно следующей командой:

```shell
sudo docker exec -it pglocal psql --username=postgres --dbname=postgres
```

Сокращённый вариант команды:

```shell
sudo docker exec -it pglocal psql -U postgres -d postgres
```

Подключившись, мы можем, например, запросить список баз данных текущего запущенного сервера, используя команду `\l`. Более традиционный SQL-синтаксис команды запроса имён созданных баз данных выглядит так:

```sql
SELECT datname FROM pg_database;
```

Выйти из консоли можно командой `\q` (quit).

Инструкция по установке [pgAdmin 4 доступна здесь](https://www.pgadmin.org/download/pgadmin-4-apt/).

### Очистка системы

Остановить контейнер можно командой:

```shell
sudo docker stop pglocal
```

Следует заметить, что при перезагрузке операционной системы контейнер автоматически не перезапускается.

Удалить все контейнеры, которые уже не выполняют полезную нагрузку, но занимают дисковое пространство, можно командой:

```csharp
docker system prune
```

Посмотреть список образов можно командой: `sudo docker images`, а удалить конкретный образ можно командой: `sudo docker rmi [имя образа]`

### Подключение к СУБД из Windows

Если мы выполним команду `ip a` на виртуальной машине, то можем увидеть следующую информацию:

```output
2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:0c:29:62:36:1d brd ff:ff:ff:ff:ff:ff
    altname enp2s1
    inet 192.168.133.130/24 brd 192.168.133.255 scope global dynamic noprefixroute ens33
```

Мы можем выполнить ping виртуальной машины с host-компьютера командой `ping 192.168.133.130`. Если мы запустим, например, web-сервер на гостевой машине, который будет слушать порт 3000, то по адресу `http://192.168.133.130:3000` мы запрос с хостовой машины будет выполнен.

Для настройки сетевого взаимодействия мы можем создать простое приложение на Node.js и попробовать получить к нему доступ через браузер. Пример приложения (файл "app.js"):

```js
const http = require("http");
http.createServer(function(request,response){
     
    response.end("Hello NodeJS!");
     
}).listen(3000, function(){
    console.log("Сервер начал прослушивание запросов на порту 3000");
});
```

Запустить приложение можно командой: `node app.js`. Соответственно, обратиться к этому приложению через браузер можно по адресу: `localhost:3000`. Следует обратить особенно внимание на тот факт, что IP-адрес, с которого приходит запрос не указывается, т.е. мы принимаем запросы с любого IP-адреса.

### Firewall

Для того, чтобы убедиться в том, что firewall не запущен, следует выполнить команду `sudo ufw disable`. Состояние "inactive" означает, что fire wall отключен.

### Compose-файл

Стартовый Compose-файл из статьи [Запускаем PostgreSQL в Docker: от простого к сложному](https://habr.com/ru/articles/578744/) by IvanVakhrushev:

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:13.3
    environment:
      POSTGRES_DB: "habrdb"
      POSTGRES_USER: "habrpguser"
      POSTGRES_PASSWORD: "pgpwd4habr"
    ports:
      - "5432:5432"
```

## DockerHub перестал работать в России

Ключевая статья [DockerHub перестал работать в России](https://habr.com/ru/news/818177/) by freehabr.

**Update** 6 июня 2024 года: через неделю отключения, включили снова. Что это было?

Решением проблемы - использовать зеркала. Примеры:

- https://gallery.ecr.aws/
- https://mirror.gcr.io
- https://cloud.google.com/artifact-registry/docs/pull-cached-dockerhub-images
- https://daocloud.io
- https://c.163.com/
- https://registry.docker-cn.com
- https://quay.io/

Настройка в Docker (файл - "/etc/docker/daemon.json") выглядит так:

```json
"registry-mirrors": ["https://daocloud.io", "https://c.163.com/", "https://registry.docker-cn.com"]
```

Либо в файле "/etc/containerd/config.toml":

```config
[plugins."io.containerd.grpc.v1.cri".registry.mirrors]
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."docker.io"]
    endpoint = ["https://registry-1.docker.io", "https://mirror.gcr.io"]
```

Статьи о настройки прокси-кэша (TTL кеша выкручивается в бесконечность):

- Настройка прокси-кеша - must-have в пайпайнах уже давно (вспоминаем введённые лимиты на pull с hub.docker.io): https://docs.docker.com/docker-hub/mirror/
- Комбинируем с настройкой search-name по умолчанию (для образов с коротким именем): https://www.redhat.com/en/blog/be-careful-when-pulling-images-short-name - получаем вполне прозрачный workaround

Можно использовать [GitLab Dependency Proxy](https://docs.gitlab.com/ee/user/packages/dependency_proxy/). Нужно создать PAT с правами read_registry и write_registry, а затем можно выполнять команды:

```shell
docker pull gitlab.com/my-group/dependency_proxy/containers/nginx:latest
```

### Ответ на уход Docker из России

Инструкция и зеркало на [Хуёкер.ио](https://huecker.io/)

Update 2024: всё снова работает.

## Практика - Taiga SCRUM

[Taiga.io](https://taiga.io/) - SCRUM доска с открытыми исходными текстами, которая может быть использована в режиме self-hosted.

Доступ к исходным текстам Taiga доступен на [GitHub](https://github.com/taigaio).

Основная модель развертывания self-hosted варианта - использование Docker и Docker-Compose. Базовая статья по развертыванию доступна по [ссылке](https://community.taiga.io/t/taiga-30min-setup/170).

У приложения есть архитектура, оно горизонтально масштабируется и состоит из типовых блоков: база данных на Postgres, Bаckend на Django + Python, Frontend (Angular с CoffeeScript), RabbitMQ (управление очередями сообщений), Async (система обмена сообщениями), Gateway. Компоненты системы являются контейнерами Docker. Для запуска работоспособной системы используется 9 Docker-контейнеров, которые "поднимаются" посредством Docker Compose.

Для запуска контейнеров используется команда:

```shell
sudo ./launch-taiga.sh
```

После запуска приложения, подключиться к нему можно из браузера: `http://localhost:9000/`

Остановить все контейнеры можно командой:

```shell
sudo docker-compose down
```

Подключиться к запущенному контейнеру можно командой:

```shell
sudo docker exec -it taiga-docker-taiga-back-1 bash
```

Внутри запущенного контейнера можно запустить консоль Python 3 и выполнять в ней некоторые команды:

```shell
python3 manage.py shell
```

Пример команды добавления в систему нового пользователя:

```python
from taiga.users.models import User
user = User.objects.create_user(username='max', password='Любимый пароль', email='Почта пользователя')
```

Настройки параметров системы осуществляется в файле ".env", который находится в папке запуска контейнеров.

После внесения изменения изменений в конфигурационные параметры (отключение телеметрии и изменение секретного слова), следует пересобрать образы:

```shell
sudo docker compose up –d --build
```

Перезапустить контейнеры можно командой:

```shell
sudo docker-compose restart 
```

Для создания супер-пользователя следует использовать специализированный скрипт:

```shell
sudo ./taiga-manage.sh createsuperuser
```

Проверить корректность настройки параметров можно находясь внутри контейнера, выполнив команду:

```shell
echo $DEFAULT_FROM_EMAIL
```

Проверить отправку сообщения по электронной почте можно выполнив команду:

```shell
sudo ./taiga-manage.sh sendtestemail user@mail.ru
```

Можно попытаться подключиться к контейнеру с Backend-ом командой: `python manage.py shell`, а затем выполнить следующий код:

```shell
from django.core.mail import send_mail
send_mail("subject", "body", "SP..@....shq", ["ker...@...ru"])
```

Настройки конкретного Docker-контейнера можно посмотреть командой:

```shell
sudo docker inspect taiga-docker-taiga-back-1
```

Команда даёт информацию о привязках (Mount), портах и Alias-ах, например:

```config
"Aliases": [
  "taiga-docker-taiga-back-1",
  "taiga-back"
],
"Ports": {
  "8000/tcp": null
},
```

## Оптимизация размера контейнеров Docker

[dive](https://github.com/wagoodman/dive) - инструмент для просмотра содержимого контейнеров Docker. Цель - поиск избыточности и минимизация размера.

Рекомендуется к прочтению статья [Mount — ещё один способ уменьшения размера Docker-образа](https://habr.com/ru/articles/851384/) by WondeRu. В статье приведены способы уменьшения размера контейнера Docker.

## Как сохранить изменения в контейнере в новом образе

Иногда возникает потребность сохранить изменения, выполненные в некотором контейнере. Примером таких изменений могут являться: установка нового программного обеспечения, изменения в конфигурационный файлах, и т.д. Docker позволяет создать на основе контейнера новый образ. Для этого следует использовать команду `docker commit`.

## С чем ещё познакомиться?

Рекомендуется для ознакомления курс [по DevOps](https://www.devsecblueprint.com/) от **The DevSec Blueprint!**.

## Добавление пользователя в группу docker

Чтобы не повышать привелегии при каждом выполнении команды docker посредством sudo, следует включить пользователя в группу "docker".

С начала нужно проверить, что пользователь ещё не входит в группу docker:

```shell
groups $USER
```

Затем следует добавить пользователя в группу:

```shell
sudo usermod -aG docker $USER
```

После добавления пользователя в группу следует выйти из системы и повторной войти. В качестве альтернативы можно выполнить команду:

```shell
newgrp docker
```

Может потребоваться перезапустить сервис docker:

```shell
sudo systemctl restart docker
```

Проверить права доступа к socket-ам docker:

```shell
ls -l /var/run/docker.sock
```

Команда должна выдать что-то похожее на:

```shell
srw-rw---- 1 root docker 0 date time /var/run/docker.sock
```

Важно принять во внимание, что в случае, если Docker установлен через snap, могут потребоваться другие действия. Приоритетный способ установки - через добавление источника пакетов, сертификатов и apt-get. Это более сложный путь, чем установка через sudo, но дальнейшая работа с Docker будет проще.
