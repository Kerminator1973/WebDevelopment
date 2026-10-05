# Транзакционный механизм

Пример создания транзакции в приложении ASP.NET Core:

```csharp
await using var tx = await _db.Database.BeginTransactionAsync();

try
{
    await ProcessStage(result, request.customers, items => ProcessCustomersRequest(items));
    await ProcessStage(result, request.accounts, items => ProcessAccountsRequest(items));
    await ProcessStage(result, request.cashiers, items => ProcessCashiersRequest(items));
    await ProcessStage(result, request.adms, items => ProcessAdmsRequest(items));
    await ProcessStage(result, request.actions, items => ProcessActionsRequest(items));

    await _db.SaveChangesAsync();
    await tx.CommitAsync();
}
catch (Exception ex)
{
    await tx.RollbackAsync();

    _logger.LogError(ex, "Ошибка при обработке запроса CasherPasswSD");

    result.Add(CreateErrorResult(string.Empty, "Внутренняя ошибка обработки запроса"));
    await _db.SaveChangesAsync();
}
```

Однако с использованием транзакций не всё просто - если для добавления новых записей внутри транзакции необходимо выполнять запросы к базе данных, то база данных не увидит записей, которые были добавлены в незавершённой транзакции. Причина - эти записи ещё не включены в текущий snapshot базы данных.

Обойти это ограничение можно, если не выполнять дополнительных SQL-запросов к базе данных при добавлении данных внутри транзакции.

При добавлении записи (посредством INSERT) можно получить идентификатор добавленной записи и использовать его при добавлении других сущностей. Например, мы добавили компанию, получили в результате выполнения операции INSERT идентификатор и сохранили его в памяти. Затем, когда мы будем делать INSERT для добавления счёта, мы можем использовать в нём ID полученный при добавлении компании и операция завершиться успешно. Транзакция также успешно завершена.
