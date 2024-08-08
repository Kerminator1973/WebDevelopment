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

## Вычисление HASH-кода

Следует избегать использовать алгоритмов MD5 и SHA1 из-за их известных уязвимостей (weaknesses).

Чтобы уменьшить вероятность совпадения (collision) hash-ей следует выбирать больший размер хэша.

Первая известная ситуация с сопавдением хэн-кода для MD5 произошла в 2010 году, в для SHA1 - в 2017 году.

Пример кода, который генерирует "соль" и вычисляет hash-код пароля с солью:

```csharp
private static Dictionary<string, User> Users = new();

public static User Register(string username, string password)
{
    // Генерируем случайную "соль"
    RandomNumberGenerator rng = RandomNumberGenerator.Create();
    byte[] saltBytes = new byte[16];
    rng.GetBytes(saltBytes);
    string saltText = ToBase64String(saltBytes);

    // Генерируем "засолёный" (salted) и захэшированный пароль пользователя
    string saltedhashedPassword = SaltAndHashPassword(password, saltText);
    User user = new(username, saltText, saltedhashedPassword);
    Users.Add(user.Name, user);
    return user;
}

private static string SaltAndHashPassword(string password, string salt)
{
    using (SHA256 sha = SHA256.Create()) {
        string saltedPassword = password + salt;
        return ToBase64String(sha.ComputeHash(Encoding.Unicode.GetBytes(saltedPassword)));
    }
}
```

## Формирование электронной подписи

Многие разработчики идёт по следующуему пути: создают hash с помощью SHA256, а затем используют алгоритм RSA для его формирования цифровой подписи hash-а.

Также некоторые разработчики используют DSA для хэширования и формирования подписи. DSA быстрее, чем RSA для формирования ЭЦП, но медленнее, чем RSA при проверке подписи. Поскольку, в общем случае, ЭЦП генерируется только один раз, а проверяет множество раз, то следует выбирать алгоритм, который быстрее проверяет, чем формирует подпись.

Основная рекомендация: следует использовать **Elliptic Curve DSA**. Это улучшенный вариант DSA. Хотя ECDSA медленнее, чем RSA, он генерирует подпись меньшего размера, при том же уровне информационной беззопасности.

Ниже приведены примеры кода для создания и проверки ЭЦП:

```csharp
public static string? PublicKey;

public static string GenerateSignature(string data)
{
    byte[] dataBytes = Encoding.Unicode.GetBytes(data);
    SHA256 sha = SHA256.Create();
    byte[] hashedData = sha.ComputeHash(dataBytes);

    RSA rsa = RSA.Create();
    PublicKey = rsa.ToXmlString(false); // Исключаем из подписи приватный ключ
    return ToBase64String(rsa.SignHash(hashedData, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1));
}

public static bool ValidateSignature(string data, string signature)
{
    if (PublicKey is null) return false;
    byte[] dataBytes = Encoding.Unicode.GetBytes(data);
    SHA256 sha = SHA256.Create();
    byte[] hashedData = sha.ComputeHash(dataBytes);
    byte[] signatureBytes = FromBase64String(signature);
    
    RSA rsa = RSA.Create();
    rsa.FromXmlString(PublicKey);
    return rsa.VerifyHash(hashedData, signatureBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
}
```
