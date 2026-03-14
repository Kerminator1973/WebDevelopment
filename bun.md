# Использование среды исполнения Bun.js вместо Node.js

Официальный сайт: https://bun.sh/

Установка в Linux осуществляется командой: `curl -fsSL https://bun.sh/install | bash`

Видео на [Youtube](https://www.youtube.com/watch?v=A6OoLlhfZzY&t=229s&ab_channel=PurpleSchool%7CAntonLarichev): Bun 1.0: вместо Node.js? от Anton Larichev. Канал - PurpleSchool.

Также рекомендуется к ознакомлению статья [Релиз Bun Shell (новый shell для JavaScript)](https://habr.com/ru/articles/795949/) от Jarred Sumner (перевод Александр Русаков).

>В декабре 2025 года проект был куплен компанией Anthropic: [Anthropic acquires Bun as Claude Code reaches $1B milestone](https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone). Причина, по которой покупка Bun компанией Anthropic, являющейся лидером в разработке LLM для кодирования, состоит в использовании Bun.js в качестве основного инструмента управления backend-ом в решениях Anthropic.

Статья "Bun in the Oven" (page 58) в журнале "CODE Magazine" январь-февраль 2024 года.

Основные свойства:

- совместим с ESM и CommonJS
- запуск JSX/TSX не требует транспайлинга
- в четыре раза быстрее, чем Node.js. Экспериментальный проект: node.js - 6400+ requests per second, Bun - 11000+. Однако, следует держать в голове, что основные затраты - это работа с базой данных, что нивелирует различия в производительности
- Управление пакетами работает значительно быстрее, чем npm и yarn (приблизительно в 30 раз). Экспериментальный проект: npm - 40+ секунд, Bun - 35+ секунд (без кэша), а с кэшем - 35+ секунд. Т.е. фактически, только эффективно кэширует модули
- быстрый запуск приложения
- написан на языке программирования zig

Bun базируется на Runtime от Apple's Safari.

Bun работает на macOS, Linux и WSL

Проверка версии:

```shell
bun -v
```

Команды bun:

```shell
bun --help
```

Команда `bunx --bun` работает также, как и npx - устанавливает и запускает пакет.

Ключевой компонент - **Bun**. В нём есть куча методов, включая работу с паролями и http. Однако, существует очень мало библиотек и фреймворков, которые поддерживают Bun API.

Однако, **Bun** может работать с существующими проектами. Добавить пакет:

```shell
bun add express
```

Удалить пакет:

```shell
bun remove express
```

Установить все не установленные пакеты:

```shell
bun install
```

Для запуска на существующем проекте, следует удалить **node_modules** и затем установить пакеты средствами Bun. Поскольку Bun не использует package-lock, могут быть установлены новые версии packages, не совместимые с существующим кодом.

В видео Антона Ларичева - большой проект загрузился и успешно работал.

## Похожие проекты

Видео на [YouTube](https://www.youtube.com/watch?v=s9WoPLvw0h0&ab_channel=JavaScript.Ninja) "bun.sh и прочие модные движки: зачем?" от JavaScript Ninja.

Основный проблемы Node.js:

- много устаревших решений в Runtime. Сохраняются для совместимости с ранее разработанными проектами
- значительная часть Runtime написана на JavaScript, т.е. Node.js гарантированно не чемпион производительности
- не совместим с новыми концепциями разработки, в частности, исключительно не эффективен для _Serverless_. Причина - очень долгий холодный запуск

**Deno** - попытка выполнить "работу над ошибками" сделанными в Node.js. Совместимось с Node.js обеспечить не удалось. Написан на C++ и Rust. Сетевая подсистема - это **Rust** и **Tokyo**.

Blueboat: https://blueboat.io/ 

Blueboat написан на **Rust**-е. Runtime Bun.js написан на низкоуровневом языке [Zig](https://ziglang.org/). Zig - попытка заменить Си, но с надёжным управлением память. Особенности Zip: его очень легко установить (нужно просто скопировать bundle на локальный жёсткий диск) и в bundle входят кросс-компиляторы. Например, собрать приложение на платформе x64 из исходников на Си, под aarch64 можно такой командой:

```shell
zig cc -o hello_aarch64 hellow.c -target aarch64
```

Движки JavaScript:

- v8 - Google Chrome. Используется в Node.js
- JavascriptCore - Apple Safari
- SpiderMonkey - Firefox
- MicroJS

Bun.sh - это комбайн, в отличие от Node.js, который состоит из независимых утилит. Комбайны гораздо быстрее, но менее гибкие. Комбайны медленнее развиваются.

**DX** = Developer eXperience.
**AST** = Abstract Syntactic Tree, синтаксическое дерево - представление кода, используемое утилитами платформы.

## Что не получилось с промышленным проектом в КБ ДОРС?

Для тестирования Bun в КБ ДОРС был выбран проект D820F-Proxy, представляющий собой web-сервер на Express. Первый запуск был не успешен, т.к. Runtime Bun не содержит реализацию функции fs.readdirSync(). После того, как вызов этой функции был закомментирован, проект собрался и вполне успешно отработал. Вот спорная строка кода:

```js
const filesToDelete = fs.readdirSync(uploadFolder);
```

Возможно, заработает вот такой код:

```js
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * @param {string | Buffer | URL} directoryPath
 * @returns {Promise<string[]>} - Array of long file paths
 */
async function getFiles( directoryPath ) {

    try {
        const fileNames = await readdir( directoryPath ); // returns a JS array of just short/local file-names, not paths.
        const filePaths = fileNames.map( fn => join( directoryPath, fn ) );
        return filePaths;
    }
    catch (err) {
        console.error( err ); // depending on your application, this `catch` block (as-is) may be inappropriate; consider instead, either not-catching and/or re-throwing a new Error with the previous err attached.
    }
}
```

## Установка на одноплатниках

Установить Bun.js можно на **Raspberry Pi** через snapd, который нужно сначала установить в систему:

```shell
sudo apt update
sudo apt install snapd
```

Перезагружаем машину:

```shell
sudo reboot
```

Устанавливаем CLI:

```shell
sudo snap install core
```

Устанавливаем Bun.js:

```shell
sudo snap install bunjs
```

## Как Bun.js влияет на ближайшее будущее разработок в КБ ДОРС

Bun.js мог бы дать потенциальную выгоду при замене Node.js в высоконагруженных серверных приложениях, при условии, что база данных не будет являться "бутылочным горлышком".

Также можно было бы использовать Bun.js на одноплатниках для снижения вычислительной нагрузки. Нюанс состоит в том, что вычислительная нагрузка на одноплатниках сейчас очень низкая.

Также Bun.js мог бы быть спасением, если бы в КБ были большие проекты на Node.js, а Google перестала бы сопровождать этот инструмент. На начало осени 2023 года, такая ситуация кажется не реалистичной.

Так же следует заметить, что Bun.js очень молодой и не зрелый инструмент. Так, например, в нём пока ещё отсутствует отладчик кода.

Тем не менее, инструмент интересный и за его развитием имеет смысл смотреть.

## Использование Bun для управляющих скриптов (вместо Shell)

Функциональные возможности JavaScript/TypeScript значительно превышают возможности традиционных командных процессоров операционных систем, таких как bash, или zsh. Мы можем достаточно легко заменить basu/zsh на js/ts используя среду исполнения Bun.

Установить Bun можно выполнив команду `curl -fsSL https://bun.sh/install | bash`. Далее следует создать проект и загрузить зависимости:

```shell
bun init
bun add -d @types/bun
```

Скрипт может выглядеть следующим образом:

```js
import { $ } from "bun";

const res = $`ls ./video/`.lines()
let total = 0;
for await (const line of res) {
	if (!line.endsWith(".mp4")) {
		continue;
	}
	const length = await $`ffprobe -i ./video/${line} -show_entries format=duration -v quite -of csv="p=0"`.text()
	total += Number(length)
}
console.log((total / 60).toFixed(2))
```

В приведённом выше примере, мы выполняем shell-команду ls, которая возвращает **promise**. Используя конструкцию `for await()` наш код дождётся выполнения promise и позволит итерировать по результату, т.е. по списку файлов. Далее, к каждому из полученных mp4-файлов применяется команда извлечения данных из файла с видео.

Запустить скрипт можно командой: `bun index.ts`
