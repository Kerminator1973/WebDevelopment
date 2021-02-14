using System;
using System.Threading.Tasks;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class AuthRepository : IAuthRepository
    {
        private readonly DataContext _context;

        public AuthRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<User> Login(string username, string password)
        {
            // Метод Include() позволяет указать, что в загружаемые
            // объекты необходимо также включить и данные поля Photos
            var user = await _context.Users.Include(p => p.Photos)
                .FirstOrDefaultAsync(x => x.UserName == username);

            // Если пользователь не был найден, возвращаем null
            if(null == user)
                return null;

            // УСТАРЕВШИЙ КОД: использовался до перехода на ASP.NET Core 2 Idenitity
            // Если ранее подсчитанный Hash-код не соответствует вычисленному прямо сейчас,
            // считаем, что пароль указан не корректно и проваливаем аутентификацию
            //if(!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
            //    return null;

            // Успешная аутентификация
            return user;
        }

        public async Task<User> Register(User user, string password)
        {
            // Вычисляем Hash-код пароля вместе с "солью". "Соль" будет сгенерирована
            // в вызове метода CreatePasswordHash()
            byte[] passwordHash, passwordSalt;
            CreatePasswordHash(password, out passwordHash, out passwordSalt);

            // УСТАРЕВШИЙ КОД
            //user.PasswordHash = passwordHash;
            //user.PasswordSalt = passwordSalt;

            // Добавляем запись в таблицу
            _context.Add(user);

            // Сохраняем результат в базу данных
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task<bool> UserExists(string username)
        {
            // Проверяем, если ли в базе данных хотя бы один пользователь с
            // указанным именем
            if(await _context.Users.AnyAsync(x => x.UserName == username))
                return true;

            return false;
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            // Если вызвать метод HMACSHA512() без параметра, то он сгенерирует случайный ключ - "Соль"
            using(var hmac = new System.Security.Cryptography.HMACSHA512()) {

                passwordSalt = hmac.Key;

                // При вызове ComputeHash() будет рассчитан Hash-код переданной в качестве
                // параметра строки. Вычисление будет осуществляться с использованием "соли"
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            // Инициализируем объект класса HMACSHA512 "солью", взятой из базы данных. После
            // этого можно будет рассчитать Hash-код с использованием этой "соли" и по-байтово
            // сравнить 
            using(var hmac = new System.Security.Cryptography.HMACSHA512(passwordSalt)) {

                var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                for(int i = 0; i < computedHash.Length; i++) {
                    if(computedHash[i] != passwordHash[i])
                    return false;
                }
            }
            
            return true;
        }
    }
}