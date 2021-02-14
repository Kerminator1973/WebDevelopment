using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using aspnetDatingApp.API.Helpers;
using aspnetDatingApp.Models;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _context;
        public DatingRepository(DataContext context)
        {
            _context = context;
        }

        public void Add<T>(T entity) where T : class
        {
            _context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }
        
        public async Task<User> GetUser(int id)
        {
            var user = await _context.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.Id == id);
            return user;
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            // Получаем объект IQueryable, к которому можно применять операции
            // Skip() и Take() для реализации функционала paginator.
            // Вызов AsQueryable() в цепочке нужен для того, чтобы иметь
            // возможность указать встроить в цепочку вызов Where()
            var users = _context.Users.Include(p => p.Photos)
                .OrderByDescending(u => u.LastActive).AsQueryable();
            users = users.Where(u => u.Id != userParams.UserId);
            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikers.Contains(u.Id));
            }

            if (userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikees.Contains(u.Id));
            }

            // Добавляем фильтрацию по возрасту
            if(userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                // Dob = Date of Birth
                var minDob = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDob = DateTime.Today.AddYears(-userParams.MinAge);

                users = users.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);
            }

            if (!string.IsNullOrEmpty(userParams.OrderBy)) {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created);
                        break;
                    default:
                        users = users.OrderByDescending(u => u.LastActive);
                        break;
                }
            }

            // Используем номер страницы и количество элементов на странице,
            // для ограничения количества данных запрашиваемых из базы данных
            return await PagedList<User>.CreateAsync(users,
                userParams.PageNumber, userParams.PageSize);
        }

        // Вспомогательный метод, который позволяет получить список идентификаторов
        // всех пользователей, которые поставили Like пользователю с id, либо
        // всех пользователей, которым пользователь с id поставил Like. Параметр
        // likers определяет отношение id к пользователям при поиске (кто, или кому)
        private async Task<IEnumerable<int>> GetUserLikes(int id, bool likers)
        {
            var user = await _context.Users
                .Include(x => x.Likers)
                .Include(x => x.Likees)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (likers)
            {
                return user.Likers.Where(u => u.LikeeId == id).Select(i => i.LikerId);
            }
            else
            {
                return user.Likees.Where(u => u.LikerId == id).Select(i => i.LikeeId);
            }
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            return await _context.Photos.Where(u => u.UserId == userId)
                .FirstOrDefaultAsync(p => p.IsMain);
        }

        public async Task<Photo> GetPhoto(int id) 
        {
            var photo = await _context.Photos.FirstOrDefaultAsync(p => p.Id == id);

            return photo;
        }

        public async Task<bool> SaveAll()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            return await _context.Likes.FirstOrDefaultAsync(u => 
                u.LikerId == userId && u.LikeeId == recipientId);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        }
        
        public async Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams)
        {
            // Указываем, какие данные из связанных таблиц нужно извлекать
            // (в нашем случае, это фотографии отправителей и получателей сообщений)
            var messages = _context.Messages
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .AsQueryable();

            // Указываем правила фильтрации данных
            switch (messageParams.MessageContainer) 
            {
                case "Inbox":
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId 
                        && u.RecipientDeleted == false);
                    break;
                
                case "Outbox":
                    messages = messages.Where(u => u.SenderId == messageParams.UserId 
                        && u.SenderDeleted == false);
                    break;

                default:
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId 
                        && u.RecipientDeleted == false && u.IsRead == false);
                    break;
            }

            // Сортировка осуществляется по дате отправки сообщения - самые
            // свежие сообщения отображаются в первую очередь
            messages = messages.OrderByDescending(d => d.MessageSent);

            // Отбирать следует только сообщения, попадающие в определённое
            // информационное окно
            return await PagedList<Message>.CreateAsync(messages, 
                messageParams.PageNumber, messageParams.PageSize);
        }
        
        public async Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId)
        {
            var messages = await _context.Messages
                .Include(u => u.Sender).ThenInclude(p => p.Photos)
                .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .Where(m => m.RecipientId == userId && m.RecipientDeleted == false 
                    && m.SenderId == recipientId 
                    || m.RecipientId == recipientId && m.SenderId == userId 
                    && m.SenderDeleted == false)
                .OrderByDescending(m => m.MessageSent)
                .ToListAsync();

            return messages;
        }
    }
}