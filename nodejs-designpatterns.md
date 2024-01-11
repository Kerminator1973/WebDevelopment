# Шаблоны проектирования Node.js

Один из ключевых шаблонов проектирования - **Factory**. Смысл шаблона хорошо иллюстрирует следующих пример:

```js
function createImage (name) {
    if (name.match(/\.jp?g$/)) {
        return new ImageJpeg(name);
    } else if (name.match(/\.gif$/)) {
        return new ImageGif(name);
    } else if (name.match(/\.png$/)) {
        return new ImagePng(name);
    } else {
        throw new Error('Unsupported format')
    }
}
```

Шаблон позволяет легко скрыть особенности создания объекта необходимого пользователю типа за функцией, или классом. Этот тип шаблонов проектирования относят к **Creational Design Patterns**.

Также этот шаблон может быть использован как механизм **инкапсуляции**, т.е. сокрытия реализации (спасибо механизму closures):

```js
function createPerson (name) {
    const privateProperties = {};

    const person = {
        setName (name) {
            if (!name) {
                throw new Error('A person must have a name');
            }
            privateProperties.name = name;
        },
        getName () {
            return privateProperties.name;
        }
    };

    person.setName(name);
    return person;
}
```

В приведённом выше примере мы ограничиваем доступ пользователя объекта к полю privateProperties, который становится эквивалентен private и возвращаем объект с двумя публичными функциями, которые контролируемо используют поле privateProperties.

## Другие методики для инкапсуляции

Closures не удинственный механизм, который можно использовать для инкапсуляции. Другие подходы:

- Использование _the hashbang_, начиная с Node.js 12: https://github.com/tc39/proposal-class-fields#private-fields
- Использование WeakMaps: https://fitzgeraldnick.com/2014/01/13/hiding-implementation-details-with-e6-weakmaps.html
- Using symbols as keys for private properties: https://2ality.com/2016/01/private-data-classes.html#using-symbols-as-keys-for-private-properties
- Private-переменные в конструкторе по методике Douglas Crockford: https://www.crockford.com/javascript/private.html
- Использвование конвециональных договорённостей (conventions), в частности префикса "_" (underscore) в именах переменных (Python style)
