# Информационная безопасность - Best Practices

Рекомендуется к прочтению [бонусные главы](https://github.com/markjprice/cs10dotnet6/blob/main/9781801077361_Bonus_Content.pdf) книги Mark J. Price, в которых содержится информация об информационной безопасности в .NET Core.

Начиная с .NET Core 2.1 используется `Span<T>`-based cryptography API. Криптографические операции выполняются на уровне ядра ОС, что означает, что при появлении патча безопасности ОС приложения .NET получают выгоду от этого.

Для вычисления hash-ей должны использоваться: **PBKDF2**, или **bcrypt**.

The initialization vector (IV):

- Генерируется случайный образом для каждого передаваемого сообщения
- Передаётся вместе с зашифрованным сообщением
- Сам не является секретным

Можно надёжно генерировать ключ, или стартовый вектор (IV) используя derivation function с ключём, базирующийся на пароле (PBKDF2). Например, можно использовать класс Rfc2898DeriveBytes.

В уже устаревшем .NET Framework, некотрые алгоритмы были реализованы на уровне ОС и их имена имели суффиксы **CryptoServiceProvider**, или **Cng**. Такие функции использовать уже не нужно.

Некоторые алгоритмы, реализованные в .NET BCL имеют суффикс **Managed**. Их тоже использовать не нужно.

В современном .NET, все алгоритмы реализуются операционной системой. Если операционная система сертифицирована the **Federal Information Processing Standards** (FIPS), тогда .NET использует FIPS-certified algorithms.

В общем случае вы всегда используется абстрактрный класс похожий на Aes и фабричный метод Create(), для того, чтобы получить экземпляр алгоритма.

Пример шифрования данных (plainText) на пароле (password) в .NET с использованием алгоритма AES:

```csharp
byte[] encryptedBytes;
byte[] plainBytes = Encoding.Unicode.GetBytes(plainText);
using (Aes aes = Aes.Create()) // abstract class factory method
{
    using (Rfc2898DeriveBytes pbkdf2 = new(
        password, salt, iterations))
    {
        aes.Key = pbkdf2.GetBytes(32); // set a 256-bit key
        aes.IV = pbkdf2.GetBytes(16); // set a 128-bit IV
    }
 
    using (MemoryStream ms = new()) {
        using (ICryptoTransform transformer = aes.CreateEncryptor()) {
            using (CryptoStream cs = new(
                ms, transformer, CryptoStreamMode.Write))
            {
                cs.Write(plainBytes, 0, plainBytes.Length);
            }
        }
        encryptedBytes = ms.ToArray();
    }
 }
 return ToBase64String(encryptedBytes);
 ```
