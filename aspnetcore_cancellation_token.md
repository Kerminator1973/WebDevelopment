# CancellationToken

**CancellationToken** в .NET Core — это механизм для кооперативной отмены асинхронных и длительных операций.

CancellationToken сигнализирует, что операцию желательно прекратить, и сама операция должна корректно отреагировать на этот сигнал.

- CancellationTokenSource — источник токена. Через него инициируют отмену (метод Cancel()). Один источник может управлять множеством токенов
- CancellationToken — сам токен, который передают в методы. Он содержит состояние "запрошена ли отмена" и позволяет регистрировать обработчики отмены

## Отправка отмены

```csharp
var cts = new CancellationTokenSource();
CancellationToken token = cts.Token;

// Где-то позже:
cts.Cancel(); // Теперь token.IsCancellationRequested == true
```

## Кто инициирует отмену в реальных приложениях

В приложениях ASP.NET Core отмену операции через токен осуществляет либо само серверное приложение, которое может установить предельное время выполнения операции (например - не более 30 секунд), либо клиент, инициировав явным образом разрыв соединения. Разрыв соединения со стороны клиента часто сопряжёт с созданием специализированного пользовательского интерфейса, например, кнопки "Отмена".

Важно понимать, что отмена не возникает сама по себе - её кто-то должен запустить. Также важно принимать во внимание реальную продолжительность отменяемой задачи - если она выполняется 100-200 мс, то человек не успеет нажать кнопку "Отмена" до фактического завершения операции. Другими словами, добавление CancellationToken влияет на расход вычислительных ресурсов сервера и не является механизмом, который следует добавлять безусловно - во многих случаях, использование CancellationToken является **переусложнением кода**.

## Пример реального кода, в котором используется CancellationToken

Пример из кода, находящегося в промышленной эксплуатации:

```csharp
private async Task<List<Cashier>> PrepareAdmCashier(string cashiersList, CancellationToken ct)
{
    // ...
    var persons = await _db.Persons
        .AsNoTracking()
        .Where(p => uins.Contains(p.UIN) && !p.IsDeleted && !p.IsUINBlocked)
        .Select(p => new { p.UIN, p.PasswordRequired, p.AccountsList, p.CompanyId })
        .ToListAsync(ct);
    // ...
    var companies = await _db.Companies
        .AsNoTracking()
        .Where(c => companyIds.Contains(c.Id) && !c.IsDeleted)
        .ToDictionaryAsync(c => c.Id,
            c => new Customer { IdCustomer = c.CompanyNumber, Inn = c.INNOrKIO, Kpp = c.KPP, Name = c.Name }, ct);
```
