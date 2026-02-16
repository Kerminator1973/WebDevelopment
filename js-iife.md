# Использование IIFE в браузерном JavaScript-коде

С целью снижения когнитивной сложности JavaScript-кода, уменьшения времени анализа и модификации кодовой базы, рекомендуется использовать **Immediately Invoked Function Expression** (IIFE).

Суть подхода состоит в том, что определяется само-вызывающаяся функция, которая инкапсулирует (скрывает) реализацию некоторого изолированного функционала. Как пример - sessionManager, который скрывает особенности реализации функции автоматического обновления аутентификационного токена.

Подход хорош тем, что для перемещения функционала в другой проект, достаточно скопировать всего одну функцию, для анализа кода - также можно ограничиться очень небольшим количеством связанного кода, отсутствуют глобальные переменные, из-за которых возможна коллизия при включении в HTML-документ ссылок на несколько разных js-файлов. Ниже приведён пример реализации из файла "site.js":

```js
const sessionManager = (function () {

    // Конфигурационные параметры
    const CONFIG = {
        logoutUrl: '/Login?handler=Logout', // Точка выхода при завершении срока действия токена
        pingUrl: '/Advices?handler=Ping',   // Точка вызова, в которой может быть обновлён токен
        defaultSessionTimeoutMs: 15 * 60 * 1000,    // Продолжительность сессии по умолчанию
        activityPreventionsMs: 60 * 1000,   // Время, в течение которого ping не осуществляется
        msResentPing: 5000,                 // Время повторной попытки, если сервер не обновил токен
        activityEvents: 'click keydown'     // События, котторые трактуются как активность пользователя
    };

    let logoutTimeoutId = null;
    let lastUserActivity = Date.now();
    let refreshInFlight = false;

    function stopClientSession() {
        window.location.assign(CONFIG.logoutUrl);
    }

    function refreshAuthenticationTicket() {

        // Защита от дублирующих параллельных запросов
        if (refreshInFlight) return;
        refreshInFlight = true;

        // Отправляем не сервер запрос, который может привести к обновлению токена
        $.get({
            url: CONFIG.pingUrl
        })
        .done(function (data, textStatus, jqXHR) {
            const value = jqXHR.getResponseHeader('ExpiredAfter');
            const seconds = parseInt(value, 10);

            if (!isNaN(seconds)) {

                console.log(`Секунд до завершения действия токена: ${seconds}`);

                clearTimeout(logoutTimeoutId);
                logoutTimeoutId = setTimeout(stopClientSession, seconds * 1000);

                // Обновляем время последней активности пользователя
                lastUserActivity = Date.now();

                if (seconds < 60) {

                    console.log(`Токен не обновился. Попробуем послать ещё один запрос через 5 секунд`);

                    // Токен не обновился, т.е. нам нужно отправить запрос ещё раз
                    setTimeout(refreshAuthenticationTicket, CONFIG.msResentPing);
                }
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Request failed:', textStatus, errorThrown);
        })
        .always(function () {
            refreshInFlight = false;
        });
    }

    // Возвращаем публичный API. В данном случае, состоящий только из одного метода
    return {
        init: function () {
            logoutTimeoutId = setTimeout(stopClientSession, CONFIG.defaultSessionTimeoutMs);

            // При загрузке страницы получаем время жизни токена. Кроме информации 
            // о завершении сессии, даём возможность серверу обновить токен
            refreshAuthenticationTicket();

            // Сообщение об активности пользователя посылаем на сервер не раньше,
            // чем через минуту с момента последнего запроса. Мы далаем это чтобы
            // не перегружать сервер сообщениями от оператора
            $(document).on(CONFIG.activityEvents, function () {
                const msPreventPingPeriod = Date.now() - lastUserActivity;

                // Отладка и тестирование кода
                //console.log(`msPreventPingPeriod: ${msPreventPingPeriod}`);

                if (msPreventPingPeriod > CONFIG.activityPreventionsMs) {
                    refreshAuthenticationTicket();
                }
            });
        }
    };
})();

// Запуск после загрузки DOM
document.addEventListener('DOMContentLoaded', sessionManager.init);
```

Легко заметить, что в случае использования ESM в web-приложении, мы могли бы вынести всю эту функцию в отдельным импорт и этом сделало бы код ещё более обозримым и читаемым.

Однако для использования _EcmaScript Modules_ потребуется не только переписать довольно большое количество кода, но и начать применять _bundling_, чтобы уменьшить время загрузки приложения. Таким образом, переход на ESM - вопрос отдалённого будущего. В этом ситуации IIFE кажется вполне приемлемым решением.
