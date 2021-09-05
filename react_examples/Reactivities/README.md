## Наиболее важные нетиповые идеи курса

По результатам деятельности активистов BLM мы отказываемся от использования слова master и теперь наш главный branch называется **main**.

Рекомендуется сразу же поместить файл "appsettings.json" в ".gitignore". Причин две: опасно хранить строку соединения с базой данных в публичных репозитариях. Во-вторых, люди очень часто ошибаются, перезаписывая эти файлы при обновлении ПО. Лучше избежать потенциальной ошибки и создать «appsettings.json» один раз в проекте.

Поскольку в данном проекте используется Sqlite, содержимое "appsettings.json" публикую в документации, как пример:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data source=reactivities.db"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*"
}
```
