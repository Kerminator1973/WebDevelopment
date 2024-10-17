# Управление Cache-м

Кэширование является одним из ключевых способов повышения производительности web-приложений, значительно снижая нагрузку на сервера и сокращая путь доставки данных по сетит. Однако неаккуратное использование директив управления cache-м может нарушать работоспособность web-приложений.

Типовой случай (воспроизводился в нескольких реальных проектах): в single page application:

- Пользователь принимает решений выйти из приложения и нажимает кнопку Logout
- SPA удаляет cookie с сессионной информацией в браузере, устанавливает состояние в "пользователь не аутентифицирован" и посылает на сервер команду завершения сессии
- прокси-сервер получает запрос и возвращает HTML-документ с ранее сохранённым cookie, который не является просроченным
- браузер сохраняет cookie
- при нажатии пользователем на кнопку "Login" (чтобы войти под другим логином), приложение обнаруживает корректный cookie с всё ещё открытой сессией и вместо аутентификации сразу открывает главное окно пользователя, с ролью, соответствующей сессии из ранее "удалённого" cookie

Как результат, пользователь не может полноценно выйти из сессии, например, для того, чтобы войти в систему под другим аккаунтом, с другой учётной записью.

## Директивы управления cache

В статье на сайте [MDN](https://developer.mozilla.org/ru/docs/Web/HTTP/Headers/Expires) приводятся несколько директив управления Cookie:

- "Pragma: no-cache" - это устаревший подход, который использовался в HTTP/1.0
- "Expires: 0" - указывает, что копия документа ранее помешённого в cache является просроченной. Однако если в ответе с сервера установлен заголовок "Cache-Control" с директивами "max-age" или "s-maxage", то заголовок Expires игнорируется
- "Cache-Control: no-store" - это явное требование к прокси не хранить ответов и запросов, т.е. пропускать данные сквозь cache
- "Cache-Control: no-cache" - это требование ревалидации cache (т.е. запрос к серверу за уточнением корректности данных в cache), перед его отправкой клиенту

## Особенности работы прокси-серверов

В реальном мире существуют прокси-сервера, которые игнорируют, или частично игнорируют директивы управления cache-м. В одной из практических ситуации прокси-сервер имел глобальную настройку время жизни закэшированных документов (TTL = Time to Live) в 30 секунд и это нарушало работоспособность web-приложения. Проблему удалось решить настроив TTL для конкретного URL, установив его в значение "0".