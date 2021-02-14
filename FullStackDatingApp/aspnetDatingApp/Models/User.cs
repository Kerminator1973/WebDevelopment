using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using aspnetDatingApp.Models;
using Microsoft.AspNetCore.Identity;

namespace DatingApp.API.Models
{
    public class User : IdentityUser<int>
    {
        // УСТАРЕВШИЕ СВОЙСТВА PasswordHash и PasswordSalt использовались
        // в Custom-ной модели управления пользователями и стали не нужны
        // после перехода на ASP.NET Core Identity. Тем не менее, идеи 
        // использования Hash-кода пароля и Salt являются очень грамотными 
        // и комментарии для их использования сохранены для иллюстрации
        // возможных альтернативных подходов

        // Вместо пароля следует хранить результат трансформация  пароля,
        // посредством Hash-функции. Соответственно, при каждой аутентификации
        // Hash рассчитывается заново и сравнивается с тем, что хранится
        // в базе данных
        // public byte[] PasswordHash { get; set; }

        // Существуют огромные базы данных результатов рассчёта Hash-функции
        // для конкретных паролей, которые злоумышленники используют для
        // восстановления пароля. Чтобы лишить злооумышленников подобной
        // возможности, к паролю нужно подмешивать Salt - случайные значения,
        // динамически генерируемые для каждого пользователя
        // public byte[] PasswordSalt { get; set; }

        // Далее определены свойства пользователя сайта знакомств
        public string Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string KnownAs { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastActive { get; set; }
        public string Introduction { get; set; }
        public string LookingFor { get; set; }
        public string Interests { get; set; }

        public string City { get; set; }
        public string Country { get; set; }

        // Типовой подход в .NET: когда определяется некоторая коллекция,
        // указывается не конкретный, а базовый тип, которым, в общем случае,
        // является интерфейс. При этом, при создании конкретного экземпляра
        // коллекции, указывается уже конкретный тип. Схожий подход часто
        // используется и в C++, но в C++ используется другая нотация наименования
        // файлов. В C# имя интерфейса, который почти всегда является базовым
        // классом, начинается с символа [I]nterface
        public ICollection<Photo> Photos { get; set; }

        // Коллекция ссылок на пользователей, профили которых нравятся нам
        // и пользователей, которым нравится нам профиль
        public ICollection<Like> Likers { get; set; }
        public ICollection<Like> Likees { get; set; }

        // Коллекция сообщений отправленных и полученных пользователем
        public ICollection<Message> MessagesSent { get; set; }
        public ICollection<Message> MessagesReceived { get; set; }

        public User()
        {
            Photos = new Collection<Photo>();
        }

        public ICollection<UserRole> UserRoles { get; set; }
    }
}