# Авторизация операций в ASP.NET Core

**IAuthorizationService** - ключевой интерфейс для работы с авторизацией — он позволяет программно проверять, имеет ли пользователь право выполнить какое-то действие или получить доступ к ресурсу.

Интерфейс определён в пространстве имён Microsoft.AspNetCore.Authorization и уже включен в основные шаблоны.

В интерфейсе объявлен один метод — AuthorizeAsync, с несолькими перезагрузками.

Чаще всего используемая перезагрузка:

```csharp
Task<AuthorizationResult> AuthorizeAsync(
    ClaimsPrincipal user,
    object resource,
    IEnumerable<IAuthorizationRequirement> requirements
);
```

Прикладная система передаёт данные авторизованного пользователя, объект к которому проверяется доступ и набор требований для доступа. Метод AuthorizeAsync() возвращает свойство Success, которое может быть либо true (доступ разрешён), либо false (доступ не разрешён).

Пример использования из реального приложения:

```csharp
var canUpdate = await AuthorizationService.AuthorizeAsync(User, "Units", RoleRequirements.Update);
```

В приведённом выше примере, осуществляется проверка права пользователя User доступа к странице "Units" для режима "изменить". Режимы определяются на уровне приложения, например:

```csharp
public static class RoleRequirements
{
    public static readonly OperationAuthorizationRequirement Create =
        new OperationAuthorizationRequirement { Name = Constants.CreateOperationName };
    public static readonly OperationAuthorizationRequirement Read =
        new OperationAuthorizationRequirement { Name = Constants.ReadOperationName };
    public static readonly OperationAuthorizationRequirement Update =
        new OperationAuthorizationRequirement { Name = Constants.UpdateOperationName };
    public static readonly OperationAuthorizationRequirement Delete =
        new OperationAuthorizationRequirement { Name = Constants.DeleteOperationName };
}

public static class Constants
{
    public static readonly string CreateOperationName = "Create";
    public static readonly string ReadOperationName = "Read";
    public static readonly string UpdateOperationName = "Update";
    public static readonly string DeleteOperationName = "Delete";        
}
```

Конкретная реализация сервиса определяется приложением. Например, права доступа пользователей к объектам могут храниться в базе данных. Указывать конкретную реализацию сервиса следует при настройке приложения:

```csharp
services.AddScoped<IAuthorizationHandler, RoleAuthorizationHandler>();
```

```csharp
app.UseAuthorization();
```

## Проблемы решения

Один вызов AuthorizeAsync() обеспечивает проверку только одного права доступа. Если на странице необходимо проверить, например, 14 разных прав, то это может привести к тому, что потребуется выполнить 14 запросов к базе данных. Т.е. можно говорить о том, что к производительности этого решения в практических case-ах есть большие вопросы.
