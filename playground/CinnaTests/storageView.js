// Данный файл является зависимым от "moduleLinker.js". Читать оба файла следует вместе

const gModuleLinkerSizes = [18, 22, 26, 30, 34, 38];                        // Предусмотренный диапазон радиусов "точки привязки"
let gCurrentModuleLinkerSize = 38;                                          // Текущий радиус "точки привязки"

// Координаты ячеек модулей, нормированные к 1000
const gSafeCoordinates = [
    {
        id: "Unknown",   // Модуль на 9 сейфов для отладки Unknown
        safes: [
            { top: 0, bottom: 85, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 90, bottom: 175, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 180, bottom: 265, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 270, bottom: 355, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 360, bottom: 445, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 450, bottom: 535, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 540, bottom: 625, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 630, bottom: 715, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 720, bottom: 805, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
        ],
    },
    {
        id: "Default",	// Модуль по умолчанию на один сейф.
        safes: [
            { top: 0, bottom: 256, h: 256, w: 256, d: 256, volume: 16.256, info: 'Сейф модуля по умолчанию.' },
        ],
    },
    {
        id: "D5503",	// D5510 // Модуль на 3 сейфа
        safes: [
            { top: 0, bottom: 280, h: 612, w: 280, d: 395, volume: 67.6872, info: 'пункт для дополнительных данных о сейфе' },
            { top: 285, bottom: 565, h: 612, w: 280, d: 395, volume: 67.6872, info: 'пункт для дополнительных данных о сейфе' },
            { top: 570, bottom: 850, h: 612, w: 280, d: 395, volume: 67.6872, info: 'пункт для дополнительных данных о сейфе' },
        ],
    },
    {
        id: "D5504",   // Модуль на 4 сейфа
        safes: [
            { top: 0, bottom: 210, h: 454, w: 280, d: 395, volume: 50.2124, info: 'пункт для дополнительных данных о сейфе' },
            { top: 215, bottom: 425, h: 454, w: 280, d: 395, volume: 50.2124, info: 'пункт для дополнительных данных о сейфе' },
            { top: 430, bottom: 640, h: 454, w: 280, d: 395, volume: 50.2124, info: 'пункт для дополнительных данных о сейфе' },
            { top: 645, bottom: 855, h: 454, w: 280, d: 395, volume: 50.2124, info: 'пункт для дополнительных данных о сейфе' },
        ],
    },
    {
        id: "D5509",   // Модуль на 9 сейфов
        safes: [
            { top: 0, bottom: 85, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 90, bottom: 175, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 180, bottom: 265, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 270, bottom: 355, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 360, bottom: 445, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 450, bottom: 535, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 540, bottom: 625, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 630, bottom: 715, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
            { top: 720, bottom: 805, h: 192, w: 280, d: 395, volume: 21.2352, info: 'пункт для дополнительных данных о сейфе' },
        ],
    },
    {
        id: "D5514",    // Модуль на 14 сейфов
        safes: [
            { top: 0, bottom: 53, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 58, bottom: 111, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 116, bottom: 169, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 174, bottom: 227, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 232, bottom: 285, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 290, bottom: 343, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 348, bottom: 401, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 406, bottom: 459, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 464, bottom: 517, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 522, bottom: 575, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 580, bottom: 633, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 638, bottom: 691, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 696, bottom: 749, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
            { top: 754, bottom: 807, h: 117, w: 280, d: 395, volume: 12.9402, info: 'пункт для дополнительных данных о сейфе' },
        ],
    },
    {
        id: "D5533",   // Модуль на 33 сейфа
        safes: [
            { top: 0, bottom: 32, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 36, bottom: 68, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 72, bottom: 104, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 108, bottom: 140, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 144, bottom: 176, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 180, bottom: 212, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 216, bottom: 248, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 252, bottom: 284, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 288, bottom: 320, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 324, bottom: 356, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 360, bottom: 392, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 396, bottom: 428, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 432, bottom: 464, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 468, bottom: 500, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 504, bottom: 536, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 540, bottom: 572, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 576, bottom: 608, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 612, bottom: 644, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 648, bottom: 680, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 684, bottom: 716, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 720, bottom: 752, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 756, bottom: 788, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 792, bottom: 824, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 828, bottom: 860, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 864, bottom: 896, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 900, bottom: 932, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 936, bottom: 968, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 972, bottom: 1004, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 1008, bottom: 1040, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 1044, bottom: 1076, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 1080, bottom: 1112, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 1116, bottom: 1148, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
            { top: 1152, bottom: 1184, h: 56, w: 280, d: 395, volume: 6.1936, info: 'пункт для дополнительных данных о сейфе' },
        ],
    }
];

// Канал взаимодействия с сервером мониторинга по протоколу SignalR
let gConnection = null;

window.addEventListener("load", function () {

    // При старте редактора загружаем список "точек привязки". Важно принять во внимание,
    // что при загрузке точек привязки используется нормирование их координат к области
    // отображения топологической схемы, т.е. изображение топологической схемы должно
    // быть уже загружено. Именно по этой причине, функция вызывается в обработчике
    // сообщения "load", а не "DOMContentLoaded"
    downloadModuleLinkers(false, function () { });

    // Взаимодействие посредством SignalR
    gConnection = new signalR.HubConnectionBuilder().withUrl("/monitoringHub").build();

    gConnection.on("onWholeStorageState", function (state) {

        console.log("Получена информация о состоянии всего ХЦК");

        // При передаче объекта с .NET в JS Runtime, имена полей объектов
        // будут изменятся: первый символ имени поля будет переведён
        // в нижний регистр
        state?.currentModules?.forEach(module => {

            // Впервые обрабатываемые модули, нужно добавить во внутреннее хранилище.
            if (getgIDCModule(module.id) == undefined) {                    // Если модуль изменяется впервые
                gIDCmodules.push(new IDCmodule(module.id,
                    module.model,
                    module.safes?.reduce(function (accumulator, item) {
                        return Math.min(accumulator, item.id);
                    }, module.safes[0].id)
                ));                                                         // Добавление модуля в список
            }

            // Сохранение состояний модулей.
            module.moduleProperties?.forEach(prop => {
                changeModuleProp(module.id, prop.name, prop.value);
            });

            // Сохранение состояний сейфов.
            module.safes?.forEach(safe => {
                changeSafeProperties(module.id, safe.id, safe.safeProperties);
            });
        });
    });

    gConnection.on("onWholeModuleState", function (state) {
        console.log("Получена информация о текущем состоянии модуля, с состоянием сейфов");

        if (state.safeProperties && state.safeProperties.length > 0) {

            const id = state.safeProperties[0].moduleId;

            // Изменяем состояние отдельных сейфов в выезжающей панели
            state?.moduleProperties?.forEach(prop => {
                changeModuleProp(id, prop.name, prop.current);
            });

            state?.safeProperties?.forEach(prop => {
                changeSafeProperties(id, prop.safeId, prop);
            });
        }
    });

    // Отображение изменения состояния (консолидированного) конкретного модуля - отбражается
    // на топологической схеме
    gConnection.on("onModuleStatusChange", function (moduleId, state) {
        changeModuleIcon(moduleId, state);
    });

    // Обработчик изменения свойств конкретного модуля - отображается на схеме модуля
    gConnection.on("onModulePropertyChange", function (moduleId, propKey, propValue) {
        changeModuleProp(moduleId, propKey, propValue);
    });

    // Получено сообщение об изменении свойств конкретной ячейки.
    gConnection.on("onSafePropertiesChange", function (moduleId, safeId, state) {

        changeSafeProperties(moduleId, safeId, state);
    });

    // Добавляем функционал, связанные с обработкой критичных уведомлений
    initCriticalIssueLib(gConnection);

    gConnection.start().then(function () {

        const _thisStorageId = $("#StorageID").text();
        gConnection.invoke("StartObservation", _thisStorageId);

        // Загружаем состояние ХЦК
        const _nStorageId = parseInt(_thisStorageId, 10);
        if (isNaN(_nStorageId)) {
            console.error("Ошибка типа идентификатора ХЦК");
            return;
        }

        gConnection.invoke("RequestStorageState", _nStorageId).then(() => {
            console.log("Запрос состояния хранилища принят в работу");
        });

    }).catch(function (err) {
        console.error(err.toString());
    });
});

/**
 * Функция позволяет добавить иконку внутри точки привязки
 *  @param {number} logicalId - Идентификатор модуля
 *  @param {string} iconString - Имя используемой иконки
 */
function addModuleLinkerIcon(logicalId, iconString) {

    const _width = gCurrentModuleLinkerSize * 6 / 10;
    const referenceDiv = document.getElementById(`moduleLinker${logicalId}`);

    if (referenceDiv !== null) {
        referenceDiv.innerHTML = `<svg width=${_width} height=${_width} class="icon${iconString}"><use xlink:href="/icons.svg#${iconString}"></use></svg>`;
        referenceDiv.classList.remove("module-linker-smooth");
        referenceDiv.classList.add("module-linker-hasicon");
    }
}

/**
 * Функция позволяет удалить иконку внутри точки привязки
 *  @param {number} logicalId - Идентификатор модуля
 */
function deleteModuleLinkerIcon(logicalId) {

    const referenceDiv = document.getElementById(`moduleLinker${logicalId}`);
    if (referenceDiv !== null) {
        referenceDiv.innerHTML = "";
        referenceDiv.classList.remove("module-linker-hasicon");
        referenceDiv.classList.add("module-linker-smooth");
    }
} 

// -------------------------------- //
// Модель хранилища.
// В качаестве параметров задается идентификатор (пока наименование).
function IDCstorage(id) {
    this.id = id;                                                           // Идентификатор хранилища
    this.modules = [];                                                      // Список модулей
}

// Модель модуля хранилища.
// В качестве параметров задается тип модуля.
function IDCmodule(id, type = "Default", firstSafeId = 1) {
    // Основные обязательные параметры.
    this.id = id;                                                           // Идентификатор модуля
    this.type = type;                                                       // Тип модуля

    // Физические параметры (состояния).
    this.ErrorState;                                                  // Исправность модуля
    this.HWSectionState;                                              // Аппаратный отсек (закрытость)
    this.MasterKeyState;                                              // Мастер-ключ (закрытость сейфов)
    this.AlarmState;                                                  // Тревога (шлейф контроля физического доступа)
    this.ConnectState;                                                // Связь с модулем
    this.MemoryState;                                                 // Память модуля
    this.PowerState;                                                  // Электропитание модуля
    this.safes = [];                                                  // Список сейфов
    this.openSafes = 0;                                              // Список открытых сейфов

   

    for (const coordinate of gSafeCoordinates) {
        if (coordinate.id === this.type) {
            for (let j = 0; j < coordinate.safes.length; j++) {
                const safe = coordinate.safes[j];
                this.safes.push(new IDCsafe(
                    firstSafeId + j,
                    safe.top,
                    safe.bottom - safe.top,
                    safe.bottom,
                    safe.h,
                    safe.w,
                    safe.d,
                    safe.volume,
                    safe.info,
                    safe.isLockBlock,
                    safe.isLockOpen,
                    safe.isDoorOpen,
                    safe.isFaulty,
                    safe.isMasterKeyUsed,
                    safe.isClientInside
                ));
            }
        }
    }

    this.refreshStorageSсheme = function () {

        let allSafesArr = this.safes;
        let showPersonIcon = [];

       

        allSafesArr.forEach((el) => {
            if (el.clientInside === 1) {
                showPersonIcon.push(el.id);
                //this.openSafes.push(el.id)
            }
           
        })
        console.log('showPersonIcon:', showPersonIcon)

        this.openSafes = showPersonIcon.length
        console.log('this.openSafes:', this.openSafes)
        
        // Обновление иконок на точках привязки схемы ХЦК
        const states = [this.ErrorState, this.HWSectionState, this.MasterKeyState, this.AlarmState, this.ConnectState, this.MemoryState, this.PowerState];
        if (showPersonIcon.length !== 0) {;
            changeModuleIcon(this.id, 2);
        } else if (states.some((el) => el === 2)) {
            changeModuleIcon(this.id, 0);
        } else if (states.some((el) => el === 255)) {
            changeModuleIcon(this.id, 1);
        } else if (states.some((el) => el === 1)) {
            deleteModuleLinkerIcon(this.id);
        }
    }

    // Разные методы.
    this.refreshDetail = function () {                                      // Обновление информации о модуле
        // Обновление общей информации (в основном текстовая).
        let divMD = document.getElementById("moduleDetailId");              // Блок текствовой информации о модуле
        if (divMD) {
            divMD.innerHTML = "";                                           // Очистка содержимого

            let elemH5 = document.createElement("h5");                      // Блок наименования модуля
                elemH5.style.textAlign = "center";
                elemH5.innerHTML = "Модуль: "
                    let elemSpan = document.createElement("span");
                    elemSpan.id = "spanModuleNameId";
                    elemSpan.innerHTML = this.id;
                elemH5.appendChild(elemSpan);
            divMD.appendChild(elemH5);

            let elemType = document.createElement("div");                   // Блок наименования модели модуля
                elemType.style.textAlign = "center";
            elemType.innerHTML = "Модель: " + this.type + ", всего сейфов: " + this.safes.length + " шт., открытых сейфов: " + this.openSafes;
            divMD.appendChild(elemType);
        }

        // Обновление статусной информации (в основном иконки и подписи).
        switch (this.ErrorState) { // Исправность модуля
            case 1:
                document.getElementById("iconNoCheck").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red", "iconNone");
                document.getElementById("iconNoCheck").classList.add("iconNone");

                document.getElementById("iconCheck").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red", "iconNone");
                document.getElementById("iconCheck").classList.add("icon-big-green");
                document.getElementById("iconCheckText").innerText = "Модуль исправен";
                break;
            case 2:
                document.getElementById("iconCheck").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red", "iconNone");
                document.getElementById("iconCheck").classList.add("iconNone");

                document.getElementById("iconNoCheck").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red", "iconNone");
                document.getElementById("iconNoCheck").classList.add("icon-big-red");
                document.getElementById("iconNoCheckText").innerText = "Модуль неисправен";
                break;
            case 255:
                document.getElementById("iconCheck").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red", "iconNone");
                document.getElementById("iconCheck").classList.add("icon-big-gray");
                document.getElementById("iconCheckText").innerText = "Модуль: неизвестно";
                break;
        }
        switch (this.HWSectionState) { // Состояние аппаратного отсека
            case 1:
                document.getElementById("iconHardwareStorage").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconHardwareStorage").classList.add("icon-big-green");
                document.getElementById("iconHardwareStorageText").innerText = "Аппаратный отсек закрыт";
                break;
            case 2:
                document.getElementById("iconHardwareStorage").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconHardwareStorage").classList.add("icon-big-red");
                document.getElementById("iconHardwareStorageText").innerText = "Аппаратный отсек открыт";
                break;
            case 255:
                document.getElementById("iconHardwareStorage").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconHardwareStorage").classList.add("icon-big-gray");
                document.getElementById("iconHardwareStorageText").innerText = "Аппаратный отсек: неизвестно";
                break;
        }
        switch (this.MasterKeyState) { // Состояние мастер-ключа
            case 1:
                document.getElementById("iconMasterKeyUsed").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconMasterKeyUsed").classList.add("icon-big-green");
                document.getElementById("iconMasterKeyUsedText").innerText = "Мастер-ключ не вставлен";
                break;
            case 2:
                document.getElementById("iconMasterKeyUsed").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconMasterKeyUsed").classList.add("icon-big-red");
                document.getElementById("iconMasterKeyUsedText").innerText = "Мастер-ключ повернут";
                break;
            case 255:
                document.getElementById("iconMasterKeyUsed").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconMasterKeyUsed").classList.add("icon-big-gray");
                document.getElementById("iconMasterKeyUsedText").innerText = "Мастер-ключ: неизвестно";
                break;
        }
        switch (this.AlarmState) { // Состояние тревоги
            case 1:
                document.getElementById("iconSilentAlarm").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconSilentAlarm").classList.add("icon-big-green");
                document.getElementById("iconSilentAlarmText").innerText = "Тревоги нет";
                break;
            case 2:
                document.getElementById("iconSilentAlarm").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconSilentAlarm").classList.add("icon-big-red");
                document.getElementById("iconSilentAlarmText").innerText = "Тревога!";
                break;
            case 255:
                document.getElementById("iconSilentAlarm").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconSilentAlarm").classList.add("icon-big-gray");
                document.getElementById("iconSilentAlarmText").innerText = "Тревога: неизвестно";
                break;
        }

        switch (this.ConnectState) { // Состояние связи с модулем
            case 1:
                document.getElementById("iconReduce").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconReduce").classList.add("icon-big-green");
                document.getElementById("iconReduceText").innerText = "Модуль на связи";
                break;
            case 2:
                document.getElementById("iconReduce").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconReduce").classList.add("icon-big-red");
                document.getElementById("iconReduceText").innerText = "Нет связи с модулем";
                break;
            case 255:
                document.getElementById("iconReduce").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconReduce").classList.add("icon-big-gray");
                document.getElementById("iconReduceText").innerText = "Связь с модулем: неизвестно";
                break;
        };

        switch (this.MemoryState) { //Состояние памяти модуля
            case 1:
                document.getElementById("iconMemoryFault").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconMemoryFault").classList.add("icon-big-green");
                document.getElementById("iconMemoryFaultText").classList.innerText = "Память исправна";
                break;
            case 2:
                document.getElementById("iconMemoryFault").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconMemoryFault").classList.add("icon-big-red");
                document.getElementById("iconMemoryFaultText").innerText = "Память неисправна";
                break;
            case 255:
                document.getElementById("iconMemoryFault").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconMemoryFault").classList.add("icon-big-gray");
                document.getElementById("iconMemoryFaultText").innerText = "Память: неизвестно";
                break;
        }

        switch (this.PowerState) {
            case 1:
                document.getElementById("iconElecticityOff").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconElecticityOff").classList.add("icon-big-green");
                document.getElementById("iconElecticityOffText").innerText = "Электропитание есть";
                break;
            case 2:
                document.getElementById("iconElecticityOff").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconElecticityOff").classList.add("icon-big-red");
                document.getElementById("iconElecticityOffText").innerText = "Электропитания нет";
                break;
            case 255:
                document.getElementById("iconElecticityOff").classList.remove("icon-big-gray", "icon-big-green", "icon-big-red");
                document.getElementById("iconElecticityOff").classList.add("icon-big-gray");
                document.getElementById("iconElecticityOffText").innerText = "Электропитание: неизвестно";
                break;
        }
    }

    this.getSafe = function (x, y) {           // Получение сейфа по координатам
        for (const safe of this.safes) {       // Перебор списка сейфов
            if (safe.checkPosition(x, y)) {    // При попадании в положение и  размеры сейфа
                return safe;                   // Возврат его
            }
        }
    };

    this.drawScheme = function (canvas) {                                   // Рисование схемы модуля
        let context = canvas.getContext("2d");                              // Инструмент рисования
        canvas.width = 200;                                                 // Горизонталь (ширина) рисования в точках
        canvas.height = 1200;                                               // Вертикаль (высота) рисования в точках

        context.clearRect(0, 0, canvas.width, canvas.height);               // Очищаем canvas

        // TODO: Размеры линий желательно вычислять от размера модуля.
        context.lineWidth = 2;                                              // Толщина линий
        context.font = "25px RobotoCondensed";                              // Используемый шрифт 
        context.beginPath();

        // Выбранный сейф.
        if (gIDCsafeCurrent) {
            context.fillStyle = "#CCFF66";
            context.fillRect(4, Math.round(canvas.height * gIDCsafeCurrent["top"] / 1200), canvas.width - 8, Math.round(canvas.height * gIDCsafeCurrent["height"] / 1200));
            context.fillStyle = "#000000";
        }
        
        // Сейф под курсором.
        if (gIDCsafeMouseEnter) {
            context.fillStyle = "#ffff00";
            context.fillRect(4, Math.round(canvas.height * gIDCsafeMouseEnter["top"] / 1200), canvas.width - 8, Math.round(canvas.height * gIDCsafeMouseEnter["height"] / 1200));
            context.fillStyle = "#000000";
        }

        // Горизонталь (сейфы).
        let top = 0, bottom = 0                                             // Границы изображения сейфа
        for (let i = 0; i < this.safes.length; i++) {                       // Перебор известных сейфо
            // Вертикальные границы сейфа.
            top = Math.round(canvas.height * this.safes[i]["top"] / 1200);
            bottom = Math.round(canvas.height * (this.safes[i]["top"] + this.safes[i]["height"]) / 1200);
            // Рисование самого сейфа.
            context.moveTo(4, top);
            context.lineTo(4, bottom);
            context.lineTo(canvas.width - 4, bottom);
            context.lineTo(canvas.width - 4, top);
            context.lineTo(4, top);            

            // Функция асинхронной загрузки иконок на прямоугольниках сейфов в canvas
            function loadImage(url) {
                return new Promise((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve(image);
                    image.onerror = reject;
                    image.src = url;
                });
            }

            async function drawIconAsync(url, x, y, width, height) {
                const loadedIcon = await loadImage(url);
                let iconWidth = 22; // Ширина иконки
                let ratio = 512 / 512; // Соотношение сторон иконки
                let iconHeight = iconWidth / ratio; // Вычисление высоты иконки на основе соотношения
                context.drawImage(loadedIcon, x, y - iconHeight / 2, width, height); // Отрисовка иконки
            }

        //Вызов функции для отрисовки иконки "Мастер ключ ПОВЕРНУТ / НЕ ИСПОЛЬЗУЕТСЯ"
        drawIconAsync('/masterkey_gray.svg', 55, (bottom + top) / 2, 22, 22);

        //Отрисовка иконки "ЗАМОК ЗАБЛОКИРОВАН / РАЗБЛОКИРОВАН"
        switch (this.safes[i]["LockBlockUnblock"]) {
            
            case 1:
                drawIconAsync('/lockblockunblock_green.svg', 90, (bottom + top) / 2, 22, 22);
                break;
            case 2:
                drawIconAsync('/lockblockunblock_red.svg', 90, (bottom + top) / 2, 22, 22);
                break;      
            case 0:
            default:
                drawIconAsync('/lockblockunblock_gray.svg', 90, (bottom + top) / 2, 22, 22);
                break;      
        }

        //Отрисовка иконки "ДВЕРЬ ОТКРЫТА / ЗАКРЫТА"
        switch (this.safes[i]["DoorCloseOpen"]) {
            case 1:
                // АСИНХРОННАЯ отрисовка измененной иконки
                drawIconAsync('/doorclose_green.svg', 125, (bottom + top) / 2, 22, 22);
                break; 
            case 2:
                // АСИНХРОННАЯ отрисовка измененной иконки
                drawIconAsync('/dooropen_red.svg', 125, (bottom + top) / 2, 22, 22);
                break;
            case 0:
            default:
                // АСИНХРОННАЯ отрисовка измененной иконки
                drawIconAsync('/doorclose_gray.svg', 125, (bottom + top) / 2, 22, 22);
                break;
        }

        //Отрисовка иконки "СЕЙФ ИСПРАВЕН / НЕИСПРАВЕН" (только при статусе "Неисправен" / клике на кнопку "Неисправен")
        switch (this.safes[i]["LockError"]) {
            
            case 1:
                break;
            case 2:
                drawIconAsync('/safefault_red.svg', 160, (bottom + top) / 2, 22, 22);
                break;
            case 0:
            default:
                break;
        }

        context.textbaseline = "middle";                                              // вертикальное выравнивание надписей по центру прямоугольника
        context.fillText(this.safes[i]["number"], 8, ((bottom + top) / 2) + 9);             // Прописываем номер каждого сейфа  
        }
        context.stroke();                                                             // Отображение нарисованного
    };
}

    // Модель сейфа.
    // В качестве параметров задает номер и геометрия сейфа.
function IDCsafe(number, top, height, bottom, h, w, d, volume, info, isLockBlock, isLockOpen, isDoorOpen, isFaulty, isMasterKeyUsed, isClientInside) {

        // Основные обязательные параметры.
        this.id = number;                                                       // Идентификатор сейфа
        this.number = number;                                                   // Какой-то номер (может не потребоваться)
        //this.modNumber;                                                         // Номер модуля, в котором находится сейф
        this.top = top;                                                         // Смещение от верха колонки, точки
        this.bottom = bottom;
        this.height = height;                                                   // Размер (высота) сейфа, точки
        this.h = h;
        this.w = w;
        this.d = d;
        this.volume = volume;
        this.info = info;

        // Физические параметры (состояния).
        this.DoorCloseOpen = isDoorOpen;                                         // Информация по открытости двери сейфа
        this.LockBlockUnblock = isLockBlock;                                     // Информация по блокировке замка сейфа
        this.LockCloseOpen = isLockOpen;                                         // Информация по открытости замка сейфа

        this.LockError = isFaulty;                                               // Информация об исправности (поломке) сейфа
        this.MasterKeyState = isMasterKeyUsed;                                   // Информация об использовании мастер-ключа
        this.clientInside = isClientInside;                                      // Информация о нахождении клиента внутри

        // Логические параметры (состояния).
        this.reserv;                                                             // Информация о зарезервированности сейфа
        this.rent;                                                               // Информация об аренде сейфа

        // Разные методы.

        //this.clientInside - индикатор присутствия клиента в сейфе. Если выполняются три условия - присваиваем 1, если нет - 0.
        this.isClientInside = function () {
            //Условие, которое говорит о том, что "Клиент внутри"
            if (this.LockBlockUnblock === 2 && this.LockCloseOpen === 2 && this.DoorCloseOpen === 2) {
                this.clientInside = 1;
            } else {
                this.clientInside = 0;
            }
        }
        
        this.getDetailDiv = function () {                                       // Получение подробной информации о сейфе

            let safeCard = document.createElement("div");                           // Элемент, подробной информации о сейфе

            let textInfo = document.createElement("div")                        // Блок с текстовой информацией о сейфе
                safeCard.appendChild(textInfo)

            let safeNumber = document.createElement("div");                     // Элемент с номером сейфа
                safeNumber.style.textAlign = "center";
            let elemH5 = document.createElement("h5");
                elemH5.innerText = "Сейф: "
                    let elemSpan = document.createElement("span");
                        elemSpan.id = "spanSafeNameId";
                        elemSpan.innerHTML = this.number;
                    elemH5.appendChild(elemSpan);
                safeNumber.appendChild(elemH5);
                textInfo.appendChild(safeNumber);

            let safeVolume = document.createElement("div");                      // Элемент с объемом сейфа
                safeVolume.style.marginBottom = "5px";
                safeVolume.innerText = "Объём: "
                let valVol = document.createElement("span")
                valVol.innerHTML = this.volume + " дм\u00B3"
                safeVolume.appendChild(valVol)
                textInfo.appendChild(safeVolume);

            let safeSize = document.createElement("div");                       // Элемент с габаритами сейфа
                safeSize.style.marginBottom = "5px";
                safeSize.innerText = "Габариты (В х Ш х Г), мм: ";
            let valHWD = document.createElement("div");
                valHWD.innerHTML = this.h + " x " + this.w + " x " + this.d;
                safeSize.appendChild(valHWD);
                textInfo.appendChild(safeSize);

            let safeAddInfo = document.createElement("div");                   // Элемент с доп.информацией о сейфе
                safeAddInfo.style.marginBottom = "15px";
                safeAddInfo.innerText = "Доп.информация: ";
            let valText = document.createElement("span")
                valText.innerHTML = this.info;
            safeAddInfo.appendChild(valText);
            textInfo.appendChild(safeAddInfo);

            let iconsBlock = document.createElement("div");                           // Блок с иконками состояний сейфа
            safeCard.append(iconsBlock);

            let iconMasterKeyUsed = document.createElement("div");                    // Иконка "МАСТЕР-КЛЮЧ" с текстом состояния
                iconMasterKeyUsed.id = "iconSafeMasterKeyUsed";
                iconMasterKeyUsed.setAttribute('data-bs-toggle', 'tooltip');
                iconMasterKeyUsed.setAttribute('title', 'Мастер-ключ');
            let iconMasterKeyUsedText = document.createElement("span");
                iconMasterKeyUsedText.id = "iconSafeMasterKeyUsedText";
                iconMasterKeyUsedText.style.fontSize = "13px";
                iconMasterKeyUsedText.innerText = "Состояние неизвестно";

            switch (this.MasterKeyState) {
                case 1:
                    iconMasterKeyUsed.classList.add("icon-big-green")
                    iconMasterKeyUsed.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0 160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24v-40h40c13.3 0 24-10.7 24-24v-40h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3m40-256a40 40 0 1 1 0 80 40 40 0 1 1 0-80"/></svg>`;
                    iconMasterKeyUsedText.innerText = "Мастер-ключ неиспользован";
                    break;
                case 2:
                    iconMasterKeyUsed.classList.add("icon-big-red")
                    iconMasterKeyUsed.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0 160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24v-40h40c13.3 0 24-10.7 24-24v-40h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3m40-256a40 40 0 1 1 0 80 40 40 0 1 1 0-80"/></svg>`;
                    iconMasterKeyUsedText.innerText = "Мастер-ключ провернут";
                    sendNotification("Мастер-ключ провернут", gIDCmoduleCurrent.id, this.id);
                    break;
                case 0:
                default:
                    iconMasterKeyUsed.classList.add("icon-big-gray")
                    iconMasterKeyUsed.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0 160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24v-40h40c13.3 0 24-10.7 24-24v-40h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3m40-256a40 40 0 1 1 0 80 40 40 0 1 1 0-80"/></svg>`;
                    iconMasterKeyUsedText.innerText = "Состояние неизвестно";
                    break;
            }
            iconMasterKeyUsed.appendChild(iconMasterKeyUsedText);
            iconsBlock.appendChild(iconMasterKeyUsed);

            let iconLockCloseOpen = document.createElement("div");                     // Иконка "ЗАКРЫТИЕ ЗАМКА" с текстом состояния
                iconLockCloseOpen.id = "divLockCloseOpen";
                iconLockCloseOpen.setAttribute('data-bs-toggle', 'tooltip');
                iconLockCloseOpen.setAttribute('title', 'Закрытие замка');
            let iconLockCloseOpenText = document.createElement("span");
                iconLockCloseOpenText.id = "lockUnlockedIconText";
                iconLockCloseOpenText.style.fontSize = "13px";
            switch (this.LockCloseOpen) {
                
                case 1:
                    iconLockCloseOpen.classList.add("icon-big-green")
                    iconLockCloseOpen.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><g stroke-width="0"/><g stroke-linecap="round" stroke-linejoin="round"/><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M5.25 10.055V8a6.75 6.75 0 0 1 13.5 0v2.055c1.115.083 1.84.293 2.371.824C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16s0-4.243.879-5.121c.53-.531 1.256-.741 2.371-.824M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004Q16.676 9.999 16 10H8q-.677-.001-1.25.004zM14 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0"/></svg>`;
                    iconLockCloseOpenText.innerText = "Замок закрыт";
                    break;
                case 2:
                    iconLockCloseOpen.classList.add("icon-big-red")
                    iconLockCloseOpen.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6.75 8a5.25 5.25 0 0 1 10.335-1.313.75.75 0 0 0 1.452-.374A6.75 6.75 0 0 0 5.25 8v2.055c-1.115.083-1.84.293-2.371.824C2 11.757 2 13.172 2 16s0 4.243.879 5.121C3.757 22 5.172 22 8 22h8c2.828 0 4.243 0 5.121-.879C22 20.243 22 18.828 22 16s0-4.243-.879-5.121C20.243 10 18.828 10 16 10H8q-.677-.001-1.25.004zM14 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0" /></svg>`;
                    iconLockCloseOpenText.innerText = "Замок открыт";
                    sendNotification('Замок открыт', gIDCmoduleCurrent.id, this.id)
                    break;
                case 0:
                default:
                    iconLockCloseOpen.classList.add("icon-big-gray")
                    iconLockCloseOpen.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6.75 8a5.25 5.25 0 0 1 10.335-1.313.75.75 0 0 0 1.452-.374A6.75 6.75 0 0 0 5.25 8v2.055c-1.115.083-1.84.293-2.371.824C2 11.757 2 13.172 2 16s0 4.243.879 5.121C3.757 22 5.172 22 8 22h8c2.828 0 4.243 0 5.121-.879C22 20.243 22 18.828 22 16s0-4.243-.879-5.121C20.243 10 18.828 10 16 10H8q-.677-.001-1.25.004zM14 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0" /></svg>`;
                    iconLockCloseOpenText.innerText = "Состояние неизвестно";
                    break;
            }
            iconLockCloseOpen.appendChild(iconLockCloseOpenText);
            iconsBlock.appendChild(iconLockCloseOpen);
            
            let iconLockBlockUnblock = document.createElement("div");                  // Иконка "БЛОКИРОВКА ЗАМКА" с текстом состояния
                iconLockBlockUnblock.id = "divLockBlockUnblock";                           // Общую логику выносим за рамки switch...case
                iconLockBlockUnblock.setAttribute('data-bs-toggle', 'tooltip');
                iconLockBlockUnblock.setAttribute('title', 'Блокировка замка');
            let iconLockBlockUnblockText = document.createElement("span");
                iconLockBlockUnblockText.id = "iconLockBlockUnblockText";
                iconLockBlockUnblockText.style.fontSize = "13px";

            switch (this.LockBlockUnblock) {                                           // Логика поведения иконки и текста для разных состояний
                
                case 1:
                    iconLockBlockUnblock.classList.add("icon-big-green");
                    iconLockBlockUnblock.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><path fill="currentColor" d="M256 0C114.615 0 0 114.615 0 256s114.615 256 256 256 256-114.615 256-256S397.385 0 256 0m130.594 226.664L252.747 360.511a40.27 40.27 0 0 1-56.95-.001l-70.388-70.389c-15.726-15.726-15.726-41.223.001-56.95 15.727-15.725 41.224-15.726 56.95.001l41.913 41.915 105.371-105.371c15.727-15.726 41.223-15.726 56.951.001 15.724 15.723 15.724 41.221-.001 56.947"/></svg>`;
                    iconLockBlockUnblockText.innerText = "Замок заблокирован";
                    break;
                case 2:
                    iconLockBlockUnblock.classList.add("icon-big-red");
                    iconLockBlockUnblock.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490" xml:space="preserve"><path fill="currentColor" d="M76.563 490h336.875C455.547 490 490 455.547 490 413.438V76.563C490 34.453 455.547 0 413.437 0H76.563C34.453 0 0 34.453 0 76.563v336.875C0 455.547 34.453 490 76.563 490m48.272-314.555 50.61-50.611L245 194.39l69.555-69.555 50.61 50.611L295.611 245l69.555 69.555-50.61 50.611L245 295.611l-69.555 69.555-50.61-50.61L194.389 245z"/></svg>`;
                    iconLockBlockUnblockText.innerText = "Замок разблокирован";
                    sendNotification("Замок разблокирован", gIDCmoduleCurrent.id, this.id);
                    break;
                case 0:
                default:
                    iconLockBlockUnblock.classList.add("icon-big-gray");
                    iconLockBlockUnblock.innerHTML = `<svg class="safeIcons" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" fill-rule="evenodd" d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M4.433 6.191q0-.627.426-1.271.427-.645 1.247-1.067.819-.423 1.91-.423 1.015 0 1.793.354.777.353 1.2.96.423.608.423 1.322 0 .561-.241.984a3 3 0 0 1-.574.73q-.333.307-1.194 1.033a5 5 0 0 0-.381.36 1.5 1.5 0 0 0-.214.284c-.385.89-2.058.79-1.735-.455q.181-.406.482-.714.302-.307.812-.73.45-.369.648-.558a2 2 0 0 0 .336-.42.97.97 0 0 0 .136-.501q0-.529-.416-.892-.417-.363-1.075-.363-.769 0-1.134.367-.364.366-.616 1.08-.238.746-.903.746a.92.92 0 0 1-.661-.261q-.27-.26-.27-.565M8 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/></svg>`;
                    iconLockBlockUnblockText.innerText = "Состояние неизвестно";
                    break;
            }
            iconLockBlockUnblock.appendChild(iconLockBlockUnblockText);
            iconsBlock.appendChild(iconLockBlockUnblock);

            let iconDoorClosed = document.createElement("div");                        // Иконка "ДВЕРЬ ЗАКРЫТА / ОТКРЫТА" с текстом состояния
                iconDoorClosed.id = "divDoorClosed";
                iconDoorClosed.setAttribute('data-bs-toggle', 'tooltip');
                iconDoorClosed.setAttribute('title', 'Открытость двери');
            let iconDoorClosedText = document.createElement("span");
                iconDoorClosedText.id = "iconDoorClosedText";
                iconDoorClosedText.style.fontSize = "13px";

            switch (this.DoorCloseOpen) {
                
                case 1:
                    iconDoorClosed.classList.add("icon-big-green");
                    iconDoorClosed.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 20h-1V3a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v17H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2M7 11a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0Z"/></svg>`
                    iconDoorClosedText.innerText = "Дверь закрыта";
                    break;
                case 2:
                    iconDoorClosed.classList.add("icon-big-red");
                    iconDoorClosed.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M5 5v14a1 1 0 0 0 1 1h3v-2H7V6h2V4H6a1 1 0 0 0-1 1m14.242-.97-8-2A1 1 0 0 0 10 3v18a.998.998 0 0 0 1.242.97l8-2A1 1 0 0 0 20 19V5a1 1 0 0 0-.758-.97M15 12.188a1.001 1.001 0 0 1-2 0v-.377a1 1 0 1 1 2 .001z"/></svg>`
                    iconDoorClosedText.innerText = "Дверь открыта";
                    sendNotification("Дверь открыта", gIDCmoduleCurrent.id, this.id);
                    break;
                case 0:
                default:
                    iconDoorClosed.classList.add("icon-big-gray");
                    iconDoorClosed.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M20 20h-1V3a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v17H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2M7 11a1 1 0 0 1 2 0v2a1 1 0 0 1-2 0Z"/></svg>`
                    iconDoorClosedText.innerText = "Состояние неизвестно";
                    break;
            }
            iconDoorClosed.appendChild(iconDoorClosedText);
            iconsBlock.appendChild(iconDoorClosed);

            let iconWarning = document.createElement("div");                            // Иконка "СЕЙФ ИСПРАВЕН / НЕИСПРАВЕН" с текстом состояния
                iconWarning.id = "warning";
                iconWarning.setAttribute('data-bs-toggle', 'tooltip');
                iconWarning.setAttribute('title', 'Исправность сейфа');
            let iconWarningText = document.createElement("span");
                iconWarningText.id = "warningText";
                iconWarningText.style.fontSize = "13px";

            switch (this.LockError) {
                
                case 1:
                    iconWarning.classList.add("icon-big-green");
                    iconWarning.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7.2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8.2-40.1l216-368C228.7 39.5 241.8 32 256 32m0 128c-13.3 0-24 10.7-24 24v112c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24m32 224a32 32 0 1 0-64 0 32 32 0 1 0 64 0"/></svg>`;
                    iconWarningText.innerText = "Сейф исправен";
                    break;
                case 2:
                    iconWarning.classList.add("icon-big-red");
                    iconWarning.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7.2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8.2-40.1l216-368C228.7 39.5 241.8 32 256 32m0 128c-13.3 0-24 10.7-24 24v112c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24m32 224a32 32 0 1 0-64 0 32 32 0 1 0 64 0"/></svg>`;
                    iconWarningText.innerText = "Сейф неисправен";
                    sendNotification("Сейф неисправен", gIDCmoduleCurrent.id, this.id);
                    break;
                case 0:
                default:
                    iconWarning.classList.add("icon-big-gray");
                    iconWarning.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7.2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8.2-40.1l216-368C228.7 39.5 241.8 32 256 32m0 128c-13.3 0-24 10.7-24 24v112c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24m32 224a32 32 0 1 0-64 0 32 32 0 1 0 64 0"/></svg>`;
                    iconWarningText.innerText = "Состояние неизвестно";
                    break;
            }

            iconWarning.appendChild(iconWarningText);
            iconsBlock.appendChild(iconWarning);


            let SSCB = document.createElement("div");                                   // Общий контейнер с кнопками "НЕИСПРАВЕН / ИСПРАВЕН" + "РАЗБЛОКИРОВАТЬ / ЗАБЛОКИРОВАТЬ"
                SSCB.id = "SSCB";
                safeCard.append(SSCB);

            let SSCB__leftTextBtn = document.createElement("div");                      // Контейнер "Установить статус сейфа:" + кнопка "НЕИСПРАВЕН / ИСПРАВЕН"
                SSCB__leftTextBtn.id = "SSCB__leftTextBtn";
                SSCB.appendChild(SSCB__leftTextBtn);

            let SSCB__leftText = document.createElement("div");
                SSCB__leftText.id = "SSCB__leftText";
                SSCB__leftText.innerText = "Установить статус сейфа:";
                SSCB__leftTextBtn.appendChild(SSCB__leftText);

            let SSCB__leftBtn = document.createElement("button");
                SSCB__leftBtn.id = "SSCB__leftBtn";
                SSCB__leftBtn.classList.add("btn", "btn-primary", "btn-sm");
                SSCB__leftBtn.innerText = "Неисправен";

            SSCB__leftBtn.addEventListener("click", async () => {        // Хэндлер, который по клику на кнопку "ИСПРАВЕН / НЕИСПРАВЕН" меняет состояние, иконку и цвет текста
                if (this.LockError === 1) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                    iconWarning.classList.remove("icon-big-green");
                    iconWarning.classList.add("icon-big-red");
                    this.LockError = 2;
                    iconWarning.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7.2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8.2-40.1l216-368C228.7 39.5 241.8 32 256 32m0 128c-13.3 0-24 10.7-24 24v112c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24m32 224a32 32 0 1 0-64 0 32 32 0 1 0 64 0"/></svg>`;

                    let iconWarningText = document.createElement("span");
                        iconWarningText.id = "warningText";
                        iconWarningText.style.fontSize = "13px";
                        iconWarningText.innerText = "Сейф неисправен";
                        iconWarning.appendChild(iconWarningText);

                    SSCB__leftBtn.innerText = "Исправен";

                    sendNotification('Сейф неисправен', gIDCmoduleCurrent.id, this.id)

                } else {
                    await new Promise(resolve => setTimeout(resolve, 0));
                    iconWarning.classList.remove("icon-big-red");
                    iconWarning.classList.add("icon-big-green");
                    this.LockError = 1;
                    iconWarning.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7.2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8.2-40.1l216-368C228.7 39.5 241.8 32 256 32m0 128c-13.3 0-24 10.7-24 24v112c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24m32 224a32 32 0 1 0-64 0 32 32 0 1 0 64 0"/></svg>`;

                    let iconWarningText = document.createElement("span");
                        iconWarningText.id = "warningText";
                        iconWarningText.style.fontSize = "13px";
                        iconWarningText.innerText = "Сейф исправен";
                        iconWarning.appendChild(iconWarningText);

                    SSCB__leftBtn.innerText = "Неисправен";  
                } 
            })

            SSCB__leftTextBtn.appendChild(SSCB__leftBtn);

            let SSCB__rightTextBtn = document.createElement("div");
                SSCB__rightTextBtn.id = "SSCB__rightTextBtn";
                SSCB.appendChild(SSCB__rightTextBtn);

            let SSCB__rightText = document.createElement("div");
                SSCB__rightText.id = "SSCB__rightText";
                SSCB__rightText.innerText = "Замок сейфа:";
                SSCB__rightTextBtn.appendChild(SSCB__rightText);

            let SSCB__rightBtn = document.createElement("button");
                SSCB__rightBtn.id = "SSCB__rightBtn";
                SSCB__rightBtn.classList.add("btn", "btn-primary", "btn-sm");
                SSCB__rightBtn.innerText = "Разблокировать";

            SSCB__rightBtn.addEventListener("click", async () => {       // Хэндлер, который по клику на кнопку "РАЗБЛОКИРОВАН / ЗАБЛОКИРОВАН" меняет состояние, иконку и цвет текста
                if (this.LockBlockUnblock === 1) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                    iconLockBlockUnblock.classList.remove("icon-big-green");
                    iconLockBlockUnblock.classList.add("icon-big-red");
                    this.LockBlockUnblock = 2;
                    iconLockBlockUnblock.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490" xml:space="preserve"><path fill="currentColor" d="M76.563 490h336.875C455.547 490 490 455.547 490 413.438V76.563C490 34.453 455.547 0 413.437 0H76.563C34.453 0 0 34.453 0 76.563v336.875C0 455.547 34.453 490 76.563 490m48.272-314.555 50.61-50.611L245 194.39l69.555-69.555 50.61 50.611L295.611 245l69.555 69.555-50.61 50.611L245 295.611l-69.555 69.555-50.61-50.61L194.389 245z"/></svg>`;

                    let iconDoorClosedText = document.createElement("span");
                        iconDoorClosedText.id = "iconDoorClosedText";
                        iconDoorClosedText.style.fontSize = "13px";
                        iconLockBlockUnblockText.innerText = "Замок разблокирован";
                        iconLockBlockUnblock.appendChild(iconLockBlockUnblockText);

                    SSCB__rightBtn.innerText = "Заблокировать";

                    sendNotification('Замок разблокирован', gIDCmoduleCurrent.id, this.id)

                } else {
                    await new Promise(resolve => setTimeout(resolve, 0));
                    iconLockBlockUnblock.classList.remove("icon-big-red");
                    iconLockBlockUnblock.classList.add("icon-big-green");
                    this.LockBlockUnblock = 1;
                    iconLockBlockUnblock.innerHTML = `<svg class="safeIcons" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><path fill="currentColor" d="M256 0C114.615 0 0 114.615 0 256s114.615 256 256 256 256-114.615 256-256S397.385 0 256 0m130.594 226.664L252.747 360.511a40.27 40.27 0 0 1-56.95-.001l-70.388-70.389c-15.726-15.726-15.726-41.223.001-56.95 15.727-15.725 41.224-15.726 56.95.001l41.913 41.915 105.371-105.371c15.727-15.726 41.223-15.726 56.951.001 15.724 15.723 15.724 41.221-.001 56.947"/></svg>`;

                    let iconDoorClosedText = document.createElement("span");
                        iconDoorClosedText.id = "iconDoorClosedText";
                        iconDoorClosedText.style.fontSize = "13px";
                        iconLockBlockUnblockText.innerText = "Замок заблокирован";
                        iconLockBlockUnblock.appendChild(iconLockBlockUnblockText);

                    SSCB__rightBtn.innerText = "Разблокировать";
                }
            })
            SSCB__rightTextBtn.appendChild(SSCB__rightBtn);
            return safeCard;
        }

        this.checkPosition = function (x, y) {                                  // Проверка координат сейфа
            return ((y <= (this.top + this.height)) && (y >= this.top))         // Попадание в геометрию сейфа
        };
}

    // -------------------------------- //

    let gIDCmodules = [];                                                       // Список модулей изначально пустой
    let gIDCmoduleCurrent;                                                      // Текущий отображаемый и изменяемый модуль
    let gIDCsafeCurrent;                                                        // Текущий отображаемый и изменяемый сейф
    let gIDCsafeMouseEnter = null;                                              // Сейф под курсором (немного иначе отрисовывается) 

    // Получение модуля из списка.
    function getgIDCModule(id) {
        for (const module of gIDCmodules) {                                     // Перебор списка модулей
            if (module["id"] == id) {                                           // Если модуль был
                return module;                                                  // Текущий обрабатываемый модуль
            }
        }
}

    // Браузер полностью загрузил HTML, было построено DOM - дерево, но внешние ресурсы, такие как картинки и стили, могут быть ещё не загружены.
    document.addEventListener('DOMContentLoaded', function (event) {
        // Создание структуры содержимого области отображения состояния модуля (колонки).

        let divCMD = document.getElementById("divContainerModuleDiagramId");    // Получение блока отображения схемы модуля

        // Добавление схемы модуля.
        let divM = document.createElement("div");                               // Элемент, содержащий схему и детализацию
        divM.id = "divModuleId";

        divCMD.appendChild(divM)

        let divMS = document.createElement("div");                          // Элемент-контернер для детализации
        divMS.id = "containerDetailId";
        divM.appendChild(divMS)

        let divMI = document.createElement("div");                          // Элемент для схемы модуля
        divMI.id = "divModuleImageId";
        // Напоминание: Нужно помнить, что работа с "canvas" предполагает отсутсвие связи с отображением
        //              его содержимого в окне браузера. Последнее выполняется с использованием аппаратного
        //              ускорения и почти не управляемо из Javascript-а. Фактически, отображение того, что нарисовано,
        //              будет искажено CSS-настройками HTML-элемента или внешним js-кодом, изменяющим HTML-элемент, в то время
        //              когда js-код для "canvas"-а будет показывать ожидаемое отображение.



        let canvasM = document.createElement("canvas");                 // Элемент, отображения схемы
        // Сложная обработка клика мыши на элемента canvas-а.
        // Фактически нужно проверять наличие активных областей и обрабатывать согласно им.
        canvasM.addEventListener("click", function (event) {
            let coordsCM = this.getBoundingClientRect();                // Размеры элемента отображения схемы модуля
            let shiftX = event.clientX - coordsCM.left;                 // Смещение курсора на элемента, горизонталь
            let shiftY = event.clientY - coordsCM.top;                  // Смещение курсора на элемента, вертикаль
            shiftX = Math.round(shiftX * this.width / coordsCM.width);      // Корректировка смещения внутри canvas, горизонталь
            shiftY = Math.round(shiftY * this.height / coordsCM.height);    // Корректировка смещения внутри canvas, вертикаль
            // Проверка попадания координат курсора по сейфу.
            if (gIDCmoduleCurrent.getSafe(shiftX, shiftY)) {                    // Если выбран новый сейф
                gIDCsafeCurrent = gIDCmoduleCurrent.getSafe(shiftX, shiftY);    // Получение сейфа по координатам
                // Отображение блока с подробной информацией.
                let divSD = document.getElementById("safeDetailId");
                if (divSD) {
                    divSD.textContent = ''; 
                    divSD.appendChild(gIDCsafeCurrent.getDetailDiv());  // Заполнение блока с подробной информацией
                }
                gIDCmoduleCurrent.drawScheme(this);                     // Рисование схемы модуля
            }
        });
        // Движение мыши должно подсвечивать сейфы.
        canvasM.addEventListener("mousemove", function (event) {
            let coordsCM = this.getBoundingClientRect();                // Размеры элемента отображения схемы модуля
            let shiftX = event.clientX - coordsCM.left;                 // Смещение курсора на элемента, горизонталь
            let shiftY = event.clientY - coordsCM.top;                  // Смещение курсора на элемента, вертикаль
            shiftX = Math.round(shiftX * this.width / coordsCM.width);      // Корректировка смещения внутри canvas, горизонталь
            shiftY = Math.round(shiftY * this.height / coordsCM.height);    // Корректировка смещения внутри canvas, вертикаль
            // Проверка попадания координат курсора по сейфу.
            let tempIDCsafeMouseEnter = gIDCmoduleCurrent.getSafe(shiftX, shiftY);  // При нахождении сейфа под курсором
            if (tempIDCsafeMouseEnter != gIDCsafeMouseEnter) {          // Если сейф новый
                gIDCsafeMouseEnter = tempIDCsafeMouseEnter;             // Новый сейф под курсором (или нет сейфа)
                //gIDCmoduleCurrent.drawScheme(this);                     // Перерисовка схемы модуля
            }
        });
        // Движение мыши должно подсвечивать сейфы.
        canvasM.addEventListener("mouseleave", function (event) {
            gIDCsafeMouseEnter = null;                                  // Сброс сейфа под курсором
            gIDCmoduleCurrent.drawScheme(this);                         // Рисование схемы модуля
        });
        divMI.appendChild(canvasM);
        divMS.appendChild(divMI);

        let divMSI = document.createElement("div");                         // Общий контейнер для текстовой информации о модуле и сейфе
        divMSI.id = "divModuleSafeInfoId"
        divMSI.style.width = "260px";
        divMS.appendChild(divMSI);

        let divMID = document.createElement("div");                         // Элемент с общей информацией о модуле (модель + кол-во сейфов + иконки состояний)
        divMID.id = "divModuleIconsDetail"
        divMSI.appendChild(divMID)

        let divMD = document.createElement("div");                          // Элемент для детализации модуля
            divMD.id = "moduleDetailId";
            let elemH5 = document.createElement("h5");                      // Блок наименования модуля
                elemH5.style.textAlign = "center";
                elemH5.innerHTML = "Модуль "
                    let elemSpan = document.createElement("span");
                    elemSpan.id = "spanModuleNameId";
                    elemSpan.innerHTML = "не выбран";
                elemH5.appendChild(elemSpan);
            divMD.appendChild(elemH5);
            let elemType = document.createElement("div");                   // Блок наименования модели модуля
                elemType.style.textAlign = "center";
                elemType.innerHTML = "Для выбора модуля нажмите на схеме хранилища."
            divMD.appendChild(elemType);
        divMID.appendChild(divMD);

        let divMIC = document.querySelector(".icons-module-row")         // Добавляем иконки в div с информацией о модуле и сейфах
        divMID.appendChild(divMIC);

        let divSID = document.createElement("div")                       // Элемент с общей информацией о сейфе (объём, габариты, дата + иконки состояний + кнопки состояний)
        divSID.id = "divSafeIconsDetail"
        divMSI.appendChild(divSID)


        let divSD = document.createElement("div");                        // Элемент для детализации сейфа
            divSD.id = "safeDetailId";
            divSD.style.width = "240px";
            divSD.style.fontSize = "14px";
            divSID.appendChild(divSD);

        // Добавление возможности сокрытия области отображения схемы модуля.
        let divLabelClose = divCMD.querySelector("#divLabelClose");             // Кнопка скрытия схемы модуля
        let divLabelOpen = divCMD.querySelector("#divLabelOpen");               // Кнопка показа схемы модуля
        divLabelClose.addEventListener("click", function () {
            divCMD.style.width = "20px";
            divCMD.style.overflow = "hidden";
            divLabelClose.style.display = "none";
            divLabelOpen.style.display = "block";
        });
        divLabelOpen.addEventListener("click", function () {
            divCMD.style.width = "480px";
            divCMD.style.overflow = "auto";
            divLabelClose.style.display = "block";
            divLabelOpen.style.display = "none";

            
            let canvas = divCMD.querySelector("canvas");                          // Устанавливаем размеры canvas при открытии модуля
            canvas.width = 5;
            canvas.height = 1200;
        });
    });

    /**
        * Функция заменяет иконку состояния конкретного модуля
        *  @param {number} moduleId - Идентификатор модуля
        *  @param {number} moduleState - Новое состояние модуля
        */
function changeModuleIcon(moduleId, moduleState) {

    switch (moduleState) {
        case 0:
            addModuleLinkerIcon(moduleId, "error");
            break;
        case 1:
            addModuleLinkerIcon(moduleId, "warning");
            break;
        case 2:
            addModuleLinkerIcon(moduleId, "person");
            break;
        default:
            deleteModuleLinkerIcon(moduleId);
            break;
    }
}

/**
    * Функция заменяет иконку состояния конкретного модуля
    *  @param {number} moduleId - Идентификатор модуля
    *  @param {number} propKey - Идентификатор свойства модуля
    *  @param {number} propValue - Новое значение свойства
*/
function changeModuleProp(moduleId, propKey, propValue) {

    // Впервые обрабатываемые модули, нужно добавить во внутреннее хранилище.
    if (getgIDCModule(moduleId) == undefined) {                             // Если модуль изменяется впервые
        gIDCmodules.push(new IDCmodule(moduleId));                          // Добавление модуля в список
    }

    // Поиск и изменение информации по модулю.
    for (let i = 0; i < gIDCmodules.length; i++) {                          // Перебор списка модулей
        if (moduleId == gIDCmodules[i]["id"]) {                             // При совпадении измененного модуля с обрабатываемым
            switch (propKey) {
                case 1:                                                     // Исправность модуля
                    if (propValue != 0) {
                        gIDCmodules[i]["ErrorState"] = propValue;
                    }
                    break;
                case 2:                                                     // Аппаратный отсек модуля
                    if (propValue != 0) {
                        gIDCmodules[i]["HWSectionState"] = propValue;
                    }
                    break;
                case 3:                                                     // Мастер-ключ модуля
                    if (propValue != 0) {
                        gIDCmodules[i]["MasterKeyState"] = propValue;
                    }
                    break;
                case 4:                                                     // Тревога
                    if (propValue != 0) {
                        gIDCmodules[i]["AlarmState"] = propValue;
                    }
                    break;
                case 5:                                                     // Связь с модулем
                    if (propValue != 0) {
                        gIDCmodules[i]["ConnectState"] = propValue;
                    }
                    break;
                case 6:                                                     // Электричество
                    if (propValue != 0) {
                        gIDCmodules[i]["PowerState"] = propValue;
                    }
                    break;
                case 7:                                                     // Память контроллера
                    if (propValue != 0) {
                        gIDCmodules[i]["MemoryState"] = propValue;
                    }
                    break;
            }
        }
    }

    // Картинку и информацию о отображаемом модуле иногда требуется обновить.
    if (gIDCmoduleCurrent && (moduleId == gIDCmoduleCurrent["id"])) {       // При совпадении измененного модуля с обрабатываемым
        // Обновление информации о выбранном модуле.
        gIDCmoduleCurrent.refreshDetail();
        // Получение и отображение схемы выбранного модуля.
        let divMI = document.getElementById("divModuleImageId");            // Получение блока схемы модуля
        if (divMI) {
            let canvasM = divMI.querySelector("canvas");                    // Получение области рисования
            if (canvasM) gIDCmoduleCurrent.drawScheme(canvasM);             // Рисование схемы модуля
        }
    }

    getgIDCModule(moduleId).refreshStorageSсheme();
}

/**
    * Функция заменяет иконку состояния конкретного модуля
    *  @param {number} moduleId - Идентификатор модуля
    *  @param {number} safeId - Идентификатор сейфа
    *  @param {object} state - Объект, содержащий все свойства сейфа
*/
function changeSafeProperties(moduleId, safeId, state) {

    // Впервые обрабатываемые модули, нужно добавить во внутреннее хранилище.
    if (getgIDCModule(moduleId) == undefined) {                             // Если модуль изменяется впервые
        gIDCmodules.push(new IDCmodule(moduleId));                          // Добавление модуля в список
    }

    //SONARQUBE-СТАЛО
    // Поиск и изменение информации по сейфу.
    for (const module of gIDCmodules) {
        if (moduleId == module["id"]) {
            for (const safe of module.safes) {
                if (safeId == safe["id"]) {
                    state.forEach(function (item) {
                        switch (item.name) {
                            case 1:                                     // Открытость двери сейфа.
                                if (item.value != 0) {
                                    safe["DoorCloseOpen"] = item.value;
                                }
                                break;
                            case 2:                                     // Блокировка замка сейфа.
                                if (item.value != 0) {
                                    safe["LockBlockUnblock"] = item.value;
                                }
                                break;
                            case 3:                                     // Открытость замка сейфа.
                                if (item.value != 0) {
                                    safe["LockCloseOpen"] = item.value;
                                }
                                break;
                            case 4:                                     // Исправность сейфа.
                                if (item.value != 0) {
                                    safe["LockError"] = item.value;
                                }
                                break;
                            case 5:                                     // Логический номер (идентификатор) сейфа.
                                if (item.value != 0) {
                                    safe["id"] = item.value;
                                    safe["number"] = item.value;
                                }
                                break;
                        }
                    });
                    safe.isClientInside();
                    module.refreshStorageSсheme();
                    module.refreshDetail();
                }
            }
        }
    }

    // Картинку отображаемого модуля иногда требуется обновить.
    if (gIDCmoduleCurrent && (moduleId == gIDCmoduleCurrent["id"])) {   // При совпадении измененного модуля с обрабатываемым

        // Получение и отображение схемы выбранного модуля.
        let divMI = document.getElementById("divModuleImageId");        // Получение блока схемы модуля
        if (divMI) {
            let canvasM = divMI.querySelector("canvas");                // Получение области рисования
            if (canvasM) gIDCmoduleCurrent.drawScheme(canvasM);         // Рисование схемы модуля
        }
        if (gIDCsafeCurrent) {                                          // При наличии выбранного сейфа
            // Обновление/отображение блока с подробной информацией.
            let divSD = document.getElementById("safeDetailId");
            if (divSD) {
                divSD.textContent = '';
                divSD.appendChild(gIDCsafeCurrent.getDetailDiv());      // Заполнение блока с подробной информацией
            }
        }
    }
}

   function greet(name) {
       return `Hello, ${name}!`;
   }

   function add(a, b) {
       return a + b;
   }

   // Expose functions to the global scope for testing
   window.greet = greet;
   window.add = add;


function addElement(containerId, text) {
    const container = document.getElementById(containerId);
    if (container) {
        const newDiv = document.createElement('div');
        newDiv.textContent = text;
        container.appendChild(newDiv);
    }
}

window.addElement = addElement;