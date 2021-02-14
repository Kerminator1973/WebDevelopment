using System.Collections.Generic;
using System.Threading.Tasks;
using aspnetDatingApp.API.Helpers;
using aspnetDatingApp.Models;
using DatingApp.API.Helpers;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    // Определяем основной интерфейс для работы с объектами
    // в базе данных через Dating.API
    public interface IDatingRepository
    {
        // Метод позволяет добавить некоторую сущность
         void Add<T>(T entity) where T: class;

        // Метод позволяет удалить сущность
         void Delete<T>(T entity) where T: class;

        // Метод сохраняет изменения в базе данных
         Task<bool> SaveAll();

        // Метод позволяет получить список пользователей
         Task<PagedList<User>> GetUsers(UserParams userParams);

        // Метод позволяет получить описание пользователя по идентификатору
         Task<User> GetUser(int id);

        // Метод позволяет получить описание фотографии из пользовательской коллекции
         Task<Photo> GetPhoto(int id);

        // Метод позволяет получить идентификатор основной фотографии пользователя
        // из базы данных
        Task<Photo> GetMainPhotoForUser(int userId);

        // Метод возвращает информацию о том, установлен ли пользователем с userId
        // флаг "Like" для пользователя с идентификатором recipientId
        Task<Like> GetLike(int userId, int recipientId);

        // Метод позволяет получить сообщение по идентификатору
        Task<Message> GetMessage(int id);
        
        // Метод позволяет получить все сообщения пользователя
        Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams);
        
        // Метод возвращает список сообщений, которыми обменивались текущий
        // пользователь и получатель его/её сообщений
        Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId);
    }
}