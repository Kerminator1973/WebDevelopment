

using System.Threading.Tasks;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    // The Repository Interface: интерфейс для работы с пользователями системы
    public interface IAuthRepository
    {
        // Метод позволяет зарегистрировать нового пользователя
        Task<User> Register(User user, string password);

        // Метод позволяет выполнить аутентификацию пользователя
        Task<User> Login(string username, string password);

        // Метод возвращает true, если пользователь уже зарегистрирован в базе данных
        Task<bool> UserExists(string username);
    }
}