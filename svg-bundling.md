# Объединение нескольких SVG-файлов в один

Из [проведённых исследований](https://habr.com/ru/company/vdsina/blog/535570/) следует, что количество запросов к web-серверу критично влияет на скорость загрузки страницы. При этом, размер элемента влияет на скорость загрузки не так сильно.

В случае, если в приложении используется несколько SVG-файлов, например, в качестве иконок на кнопках, имеет смысл объединить их в один файл.

Допустим, мы выбрали две векторных иконки "pencil" и "user" на сайте [FontAwesome](https://fontawesome.com/icons?d=gallery) и решили поместить их в один SVG-файл. Выглядеть объединённый файл может так:

```xml
<svg id="svg-sprite" xmlns="http://www.w3.org/2000/svg">

    <symbol id="pencil" 
        aria-hidden="true" focusable="false" data-prefix="fas" data-icon="pencil-alt" 
        class="svg-inline--fa fa-pencil-alt fa-w-16" role="img"
        viewBox="0 0 512 512">
        <path  fill="#6393EC" d="M497.9 142.1l-46.1 46.1c-4.7 4.7-12.3 4.7-17 0l-111-111c-4.7-4.7-4.7-12.3 0-17l46.1-46.1c18.7-18.7 49.1-18.7 67.9 0l60.1 60.1c18.8 18.7 18.8 49.1 0 67.9zM284.2 99.8L21.6 362.4.4 483.9c-2.9 16.4 11.4 30.6 27.8 27.8l121.5-21.3 262.6-262.6c4.7-4.7 4.7-12.3 0-17l-111-111c-4.8-4.7-12.4-4.7-17.1 0zM124.1 339.9c-5.5-5.5-5.5-14.3 0-19.8l154-154c5.5-5.5 14.3-5.5 19.8 0s5.5 14.3 0 19.8l-154 154c-5.5 5.5-14.3 5.5-19.8 0zM88 424h48v36.3l-64.5 11.3-31.1-31.1L51.7 376H88v48z">
        </path>
    </symbol>

    <symbol id="user"
        aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" 
        class="svg-inline--fa fa-user fa-w-14" role="img"
        viewBox="0 0 448 512">
        <path fill="currentColor" d="M313.6 304c-28.7 0-42.5 16-89.6 16-47.1 0-60.8-16-89.6-16C60.2 304 0 364.2 0 438.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-25.6c0-74.2-60.2-134.4-134.4-134.4zM400 464H48v-25.6c0-47.6 38.8-86.4 86.4-86.4 14.6 0 38.3 16 89.6 16 51.7 0 74.9-16 89.6-16 47.6 0 86.4 38.8 86.4 86.4V464zM224 288c79.5 0 144-64.5 144-144S303.5 0 224 0 80 64.5 80 144s64.5 144 144 144zm0-240c52.9 0 96 43.1 96 96s-43.1 96-96 96-96-43.1-96-96 43.1-96 96-96z">
        </path>
    </symbol>
    
</svg>
```

**Update 2024**: ещё один сайт с действительно бесплатными SVG-иконками называется [iconify.design](https://icon-sets.iconify.design/oi/).

Для каждой иконки мы поменяли тэг **svg** на **symbol**, а так же убрали атрибут xmlns, т.к. он уже применяется у родительского элемента "svg-sprite".

Использовать иконки в HTML-верстке можно так:

```html
<svg class="icon">
    <use xlink:href="/img/images.svg#user"></use>
</svg>
```

В атрибуте "xlink:href" мы указываем имя файла, в котором находятся иконки, а затем, после символа разделителя # вводим имя векторной картинки так, как это указано в атрибуте "id".

Поскольку в файле "images.svg" не были явным образом указаны размеры векторного изображения, следует использовать специальный CSS-класс:

```css
.icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    overflow: hidden;
}
```

ВАЖНО: приведённые выше рекомендации работают только в том случае, если svg-файл загружается с сайта (например, с сервера приложений на Node.js). Если мы делаем локальное приложение, запускаемоё с жёсткого диска, то браузер может блокировать загрузку svg-файла, считая подобное действие нарушением информационной безопасности.

Ключевое обсуждение: https://stackoverflow.com/questions/52427858/preloader-script-change-svg-fill-color-before-page-load/52439542#52439542although

## Динамическое добавление SVG в HTML-верстку

Создать SVG-элемент динамически можно используя функцию **createElementNS**(). Например:

``` js
let iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
iconSvg.setAttribute('fill', 'gray');
iconSvg.setAttribute('viewBox', '0 0 512 512');
iconSvg.setAttribute('stroke', 'gray');
iconSvg.classList.add('post-icon');

const iconPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
iconPath1.setAttribute(
    'points',
    '512,59.076 452.922,0 256,196.922 59.076,0 0,59.076 196.922,256 0,452.922 59.076,512 256,315.076 452.922,512 512,452.922 315.076,256'
);
iconSvg.appendChild(iconPath1);
```

Созданный элемент следует включить в некоторый родительский элемент, например:

``` span
let span = document.createElement('span');
span.className = "svgtool";
span.append(iconSvg);
```
