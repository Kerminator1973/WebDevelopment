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

## Шаблон проектирования Builder

Шаблон проектирования Builder чаще всего применяется для того, чтобы заменить конструктор объекта c большим количеством параметров. Чаще всего, конструктор с большим количеством параметров всё равно существует, но Builder позволяет использовать его косвенно, значительно увеличивает читаемость и снижает вероятность возникновения ошибки.

 Пример реализации:

```js
class BoatBuilder {
    widthMotors (count, brand, model) {
        this.hasMotor = true;
        this.motorCount = count;
        this.motorBrand = brand;
        this.motorModel = model;
        return this;
    }

    withSails (count, material, color) {
        this.hasSails = true;
        this.sailsCount = count;
        this.sailsMaterial = material;
        this.sailsColor = color;
        return this;
    }

    // hull = корпус
    hullColor (color) {
        this.hullColor = color;
        return this;
    }

    withCabin () {
        this.hasCabin = true;
        return this;
    }

    build() {
        return new Boat({
            hasMotor: this.hasMotor,
            motorCount: this.motorCount,
            motorBrand: this.motorBrand,
            motorModel: this.motorModel,
            hasSails: this.hasSails,
            sailsCount: this.sailsCount,
            sailsMaterial: this.sailsMaterial,
            sailsColor: this.sailsColor,
            hullColor: this.hullColor,
            hasCabin: this.hasCabin
        });
    }
}
```

Вспомогательный класс Builder позволяет создавать объект класса Boat в человеко-читаемой манере (что и является главной целью этого шаблона проектирования):

```js
const myBoat = new BoatBuilder()
    .withMotors(2, 'Best Motor Co.', 'OM123')
    .withSails(1, 'fabric', 'white')
    .withCabin()
    .hullColor('blue')
    .build();
```

Важный момент состоит в том, что значительную часть параметров можно сделать default-ными и не указывать их явным образом при конструировании экземпляра класса.

Также важно, что в каждом методе установки параметром можно приводить их дополнительную обработку: type casting, validation, normalization.

Один из практических примеров использования шаблона проектирования Builder - [SuperAgent](https://nodejsdp.link/superagent-src-builder).

## Revealing Constructor

Reveal = раскрыть.

Одна из особенностей JavaScript состоит в том, что если некоторый объект передаётся в чужую библиотеку, или функции, поля этого объекта могут быть изменены там. Это происходит потому, что JavaScript передаёт объекты по ссылке, чтобы ускорить выполнение приложения. Чтобы избежать изменения полей объекта "чужим" кодом, перед вызовом чужих функций создаётся _defensive copy_ - копия объекта, которая и передаётся "чужакам".

Чтобы избежать необходимости создания defensive copy, передаваемый в чужой код объект должен быть неизменяемым (_immutable objects_). 

Тема _immutable objects_ крайне важна в JavaScript, т.е. она позволяет не только избежать создания defensive copy, но и, например, реализовать  механизм _effective change detection_, который активно применяется в таких библиотеках, как React, Angular и Vue.js. В этих библиотеках, каждое изменение состояния/объекта требует создания новой копии. Это означает, что о том произошло ли изменение можно судить просто сравнивая ссылки на зафиксированное значение и текущее значение, используя triple equal (===).

Однако, на практике, при создании объекта может потребоваться выполнить какие-то дополнительные настройки объекта. Но после создания, объект становится **immutable**. Что бывает нужно сделать при использовании шаблона проектирования Revealing Constructor:

- создать объект, который может быть изменён только на этапе создания
- может быть настроено _custom behavior_ на этапе создания
- некоторые переменные класса могут быть проинициализированы только на этапе создания

Шаблон проектирования Revealing Constructor позволяет вносить изменения только на этапе создания, что и дало слова Revealing (раскрывающий) и Constructor в его названии.

В общем виде, применение шаблона выглядит следующим образом:

```js
const object = new SomeClass(function executor(revealedMembers) {
    // Вся настройка осущесвтляется только через revealedMembers на этапе создания
});
```

Реальный пример из жизни - Promises: состояния Promises не может быть изменено просто так. Для его изменения используются только resolve и reject. Для реализации цепочки Promises, на каждом этапе создаётся новый Promise.
