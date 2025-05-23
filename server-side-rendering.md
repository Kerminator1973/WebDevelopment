# Server-Side Rendering

Можно отменить следующие причины генерации HTML-разметки на сервере:

1. Технологическая сложность существенно ниже, чем при использовании [client-side rendering](client-side-rendering.md)
2. Инструментальные средства генерации HTML-верстки могут быть сложными, но это не потребует загрузки браузером дополнительных библиотек
3. Снижается нагрузка на браузер, который может работать на менее производительных компьютерах
4. Данные находятся в СУБД, максимально близко к серверу и это позволяет реализовывать более сложные алгоритмы выборки данных
5. Всё, что нужно для отображения документа может быть получено минимальным количеством запросов

>В 2025 году, в статье [Проблемы, которых у меня больше нет, потому что я использую рендеринг на стороне сервера](https://habr.com/ru/companies/spring_aio/articles/899832/comments/) в пользу Server-Side rendering играет следующее вещи:
>
>- не нужно упарываться с версионированием REST API, что часто приводит к значимым дополнительным расходам
>- не нужно дублировать валидацию и в клиенте, и на сервере
>- обеспечить безопасность проще только на Server-Side, чем в распределённом приложении (SPA + REST API). Имеется ввиду, что есть аутентификация пользователя, есть ролевая модель - и это части общей системы безопасности. Если делегировать часть функций на клиента, то это создаёт уязвимости, например, авторизованный пользователь с ограниченной ролью может попытаться повысить свою роль используя Developer Console (F12) браузера. В случае, если вля безопасноть реализована на сервере, поверхность атаки существенно сужается
>- управление скачиванием файлов
>- медленная первая загрузка есть только у SPA-приложений
>- локализация пользовательского интерфейса проще на сервере
>- в случае SPA нужна более комплексная и подробная документация
>- и т.д.
>
>В 2024 году интерес разработчиков web-приложений естественным образом смещается в сторону Server-Side Rendering. При этом, по SSR поразумевается использование таких библиотек, как Blazor Server, [Next.js](https://nextjs.org/), [Nuxt](https://nuxt.com/) и других, подобных им.

Для генерации HTML-разметки используются данные (пары "ключ-значение") и шаблон страницы. Интрументальные средства предлагают определённый синтаксис, который позволяет не только указать место на странице для подстановки данных, но и использовать rendering по условию, циклы, локальные переменные, а так же partials (включения блоков верстки).

Ниже приведены примеры использования Express.js + Handlebars и ASP.NET Core 3 + Razor.

## Node.js + Handlebars

Официальная страница [Handlebars.js](https://www.npmjs.com/package/handlebars). Для интеграции Handlebars.js и Express.js, рекомендуется использовать модуль [hbs](https://www.npmjs.com/package/hbs).

Для активации rendering-а необходимо зарегистрировать движок как **view engine** и указать адрес подкаталога с шаблонами HTML-верстки:

```javascript
const app = express()
…
const viewsPath = path.join(__dirname, '../templates')
app.set('view engine', 'hbs')
app.set('views', viewsPath)
```

Вызов функции-рендеринга осуществляется следующим образом:

```javascript
app.get('', (req, res) => {
	res.render('index', {
		title: 'Rendered by Server',
		name: 'Kirill Kirin'
	})
})
```

Первый параметр функции res.**render**() позволяет указать имя шаблона (index.hbs). Второй параметр - список переменных, которые могут быть использованы в шаблоне.

Пример шаблона:

```hbs
<body>
  {{>header}}
  <h1>{{title}}</h1>
  <h3>Written by {{name}}</h3>
```

Handlebars считается очень популярным, но относительно медленным: [The Battle of Express.js Templating Engines — Which One Is the Fastest?](https://javascript.plainenglish.io/handlebars-eta-ejs-1623a6140e56) by Louis Petrik. Часто вместо него рассматривают [Eta](https://eta.js.org/), или [EJS](https://ejs.co/). 

## ASP.NET Core 3 + Razor

В ASP.NET Core 3 осуществляется разделение страницы на верстку (cshtml) и компонент подготовки модели данных (cs).

Под моделью подразумевается класс C#, наследующий свойства PageModel. Шаблон верстки заполняется данными публичных атрибутов этого класса. Пример модели:

```csharp
    public class AccountsModel : PageModel
    {
        private readonly ISO2020Context _context;
        protected IAuthorizationService AuthorizationService { get; }

        public List<Account> ListAccounts { get; set; }
        public AccountDTO account;
        public int CompanyID { get; set; }
        public string CompanyName { get; set; }
        public AccountsModel(ISO2020Context db, IAuthorizationService authorizationService)
        {
            _context = db;            
            AuthorizationService = authorizationService;
        }
	...
        public async Task<ActionResult> OnGetAsync(int id)
        {
            var isAuthorized = await AuthorizationService.AuthorizeAsync(User, "Accounts", RoleRequirements.Read);
	    ...
            catch
            {
                return StatusCode(400);
            }

            return Page();
        }     
```

Следует заметить, что использовать cs-файл не обязательно. Большинство действий можно выполнить непосредственно на cshtml. В частности, можно добавить Dependency Injection не через конструктор в cs-файле, а через директиву @inject:

```csharp
@inject NorthwindContext db
...
<div>@db.Orders.Count()</div>
```

Подключение модели выглядит следующим образом:

```aspnet
@page
@model ISO2020.AccountsModel
```

Пример использования **Razor** синтаксиса:

```html
<div class="container h-100 panel-page-container mt-2" id="unitAccountsContainer">
    @if (Model.CompanyName != null)
    {
        <h4 id="CaptionID" class="col-lg-12 px-0">Список счетов юридического лица: @Model.CompanyName</h4>
    }
    else
    {
        <h4 id="CaptionID" class="col-lg-12 px-0">Список счетов</h4>
    }
    <table id="AccountsTable" class="table table-sm table-striped table-hover table-bordered" style="width:100%">
        <thead>
            <tr>
                <th class="text-center">ID</th>
                <th class="text-center">ID компании</th>
                <th class="text-center">Номер счета</th>
                <th class="text-center">БИК</th>
                <th class="text-center">Пояснение</th>
            </tr>
        </thead>
        <tbody>
            @foreach (var account in Model.ListAccounts)
            {
                <tr class="CompanyClass">
                    <td>@account.Id</td>
                    <td>@account.CompanyId</td>
                    <td>@account.AccountNumber</td>
                    <td>@account.BIK</td>
                    <td>@account.Explanation</td>
                </tr>
            }
        </tbody>
    </table>

    @using (Html.BeginForm("", "", FormMethod.Post))
    {
        @Html.AntiForgeryToken()
        @Html.ValidationSummary(true)
...
```

Доступ к данным модели осуществляется через @Model. Также в тексте могут использоваться различные вспомогательные элементы (*helpers*), такие как @Html.
