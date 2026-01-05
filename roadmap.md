# Ключевой вопрос - что изучать

По мнению Ed Andersen, озвученном в видео ".NET Web Developer 2026 Roadmap - Brutally Honest Edition", наиболее значимыми технологиями, связанными с .NET будут следующие:

- TypeScript
- для Desktop-приложений: Avalonia и Uno Platform
- CSS
- React
- ASP.NET MVC для REST APIs
- Minimal APIs
- EF и LINQ

Не стоит тратить время на:

- Избегайте ".NET silo" (фундаментальная единица инфраструктуры Orleans, обеспечивающая надёжную и масштабируемую работу распределённых приложений на .NET)
- .NET ниже Core 5
- Blazor (dead end)
- MAUI (dead end)
- Aspire (.NET silo)

Red Flags:

- WSDL
- SOAP
- WCF
- Web Forms
- MSMQ
- Хранимые процедуры

По словам Эда, разработчики Microsoft пишут свой код на React с TypeScript в части frontend и .NET MVC в части backend. Если программисты Microsoft не пишут на Blazor и MAUI, то и вам не нужно.

Также в Microsoft произошёл сдвиг в выборе базы данных - теперь №1 это **PostgreSQL**, а не Microsoft SQL Server, поскольку первый - бесплатный.

Ed Andersen делал схожий [roadmap в 2025](https://github.com/Kerminator1973/MobileDevelopment/blob/master/maui.md). Основные выводы для 2025: не связываться с MAUI и Blazor.

Рекомендации по YouTuber-ам:

- Nick Chapsas
- Milan Jovanovic
- James Montemagno
