# Контейнеризация

Понятие **Linux контейнер** стадартизовано организацией Open Container Initiative [OCI](https://opencontainers.org/) и определено как "стандартная единица программного обеспечения, которая упаковывает код и его зависимости таким образом, чтобы программное обеспечение могло работать быстро и надёжно на разных компьютерах".

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
 => => writing image sha256:9a6e9419ba53f5fb075e89cfb5686cb177b57e1808f61  0.0s
```

Соответственно, запустить этот образ можно командой:

```shell
docker run -it -p 8080:8080 9a6e9419ba53f5fb075e89cfb5686cb177b57e1808f61
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

Удалить image можно командой: `docker rmi [imagetag]`

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
