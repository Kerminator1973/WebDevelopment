# Использование библиотеки BCrypt в JavaScript

Библиотека [bcrypt](https://www.npmjs.com/package/bcrypt) является одной из наболее популярных при разработке функций вычисления хэш-кода пароля при регистрации пользователя и при проверке пароля при повторной аутентификации.

Альтернативные функции/библиотеки для вычисленя Hash-кода: [scrypt](https://nodejs.org/api/crypto.html#crypto_crypto_scrypt_password_salt_keylen_options_callback) - API Node.js, [PBKDF2](https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback) - API Node.js, [Argon2](https://www.npmjs.com/package/argon2).

Схема защиты состоит в том, что в базе данных, в таблице "информация о пользователях" хранится не пароль, а хэш-код, вычисляемый посредством односторонней криптографической функции. В случае утечки данных из базы, злоумышленники не пароль, и hash-код, для которого не существует алгоритма обратного преобразования.

Существуют виды атак, в которых злоумышленники используют заранее подготовленные базы hash-кодов, рассчитанных для наиболее популярных паролей. Чаще всего такие атаки были успешными в случае использования защищающиейся стороной алгоритма MD5. Чтобы защититься от подобных атак, используется **HMAC** (Hash-based Message Authentication Code) который добавляет дополнительный уровень безопасности для хранения паролей. HMAC использует секретный ключ. Чтобы повысить степень защиты, секретный ключ устанавливается для каждой записи - он называется *salt* (соль) и подмешивается к входным данным. Salt - случайный набор данных, генерируемый при регистрации пароля. 

Для замедления атак, связанных с перебором возможных входных вариантов паролей, критографические операции повторяются некоторое количество раз. Чаще всего, количество повторнов указывается как двойка возведённая в некоторую степень. Степень двойки называется **saltRounds**. В промышленных приложениях используются значения от 8 до 12.

Результатом вычисления hash-а является некоторая строка текста. В случае использования bcrypt, строка содержит несколько блоков, разделяемых символом $. Допустим, что у нас есть строка:

```
$2b$10$uuIKmW3Pvme9tH8qOn/H7uZqlv9ENS7zlIbkMvCSDIv7aup3WNH9W
```

Техническими блока в этой строке являются:

```
$2b -> bcrypt version
$10 -> salt rounds
First 22 remaining characters (uuIKmW3Pvme9tH8qOn/H7u) -> generated salt.
```

Длина строки составляет 61 байт - именно такой длины должно быть поле для хранения hash-кода в базе данных.

## Популярные описания применения bcrypt

Статья №1: https://dev.to/aditya278/understanding-and-implementing-password-hashing-in-nodejs-2m84

Статья №2 (snippet): https://www.codegrepper.com/code-examples/javascript/node+password+hash+and+salt+npm

Статья №3: https://coderrocketfuel.com/article/using-bcrypt-to-hash-and-check-passwords-in-node-js

Подробное объяснение, что такое "соль": https://auth0.com/blog/hashing-in-action-understanding-bcrypt/

## Установка bcrypt

Установка bcrypt: `npm i bcrypt`

Нужна стабильная версия Node.js (а не экспериментальная), иначе может не сработать сборка компонента, которая зависит от [node-gyp](https://www.npmjs.com/package/node-gyp). node-gyp - это компонент, который добавляет native build tools для сборки компонентов, которые необходимо выполнять как native code для используемой процессорной архитектуры.

## Примеры кода

Вычисления hash-а пароля с использованием соли (используется async/await):

``` js
const bcrypt = require('bcrypt');
...
const saltRounds = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(user_pwd, saltRounds)
```

Проверка указанного пароля:

```
const passwordValid = await bcrypt.compare(plainTextPasswoed, passwordHashFromTheDatabase);
```


### Совмещение асинхронного и синхронного кода

Функция isPasswordValid() является асинхронной и возвращает Promise. Чтобы обработать результат работы, нам необходимо использовать **then**().

Т.к. функция, внутри которой мы работаем является синхронной (Middleware Passport.js), то мы не можем использовать внутри неё await:

``` js
passport.use(new LocalStrategy(
	function(username, password, done) {
		user.isPasswordValid(username, password).then(error => {
		
			// В случае ошибки, возвращаем её описание коду-обработчику
			if (error)
				return done(null, false, { message: error });
			return done(null, {
				username: 'admin'
			});
		});
	}
));
```
