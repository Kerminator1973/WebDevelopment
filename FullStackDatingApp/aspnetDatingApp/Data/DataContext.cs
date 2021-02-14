using aspnetDatingApp.Models;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DataContext : IdentityDbContext<User, Role, int, 
        IdentityUserClaim<int>, UserRole, IdentityUserLogin<int>, 
        IdentityRoleClaim<int>, IdentityUserToken<int>>
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) {}

        public DbSet<Value> Values {get; set; }

        // Определяем DbSet, в котором будут хранится фотографии пользователя.
        public DbSet<Photo> Photos { get; set; }

        // Определяем DbSet (таблицу), в которой будет храниться информация
        // о том, кокому пользователю какой профиль нравится
        public DbSet<Like> Likes { get; set; }

        // Определяем DbSet (таблицу), в которой будут хранится сообщения
        // посылаемые пользователями друг другу
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Выполняем конфигурирование пользователей, ролей и
            // связи - ролей с пользователями, для создания соответствующих
            // таблиц в базе данных
            base.OnModelCreating(builder);

            builder.Entity<UserRole>(userRole => {
                userRole.HasKey(ur => new {ur.UserId, ur.RoleId});

                userRole.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .IsRequired();

                userRole.HasOne(ur => ur.User)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.UserId)
                    .IsRequired();
            });

            // Указываем, что у сущности типа Like будет основной ключ
            // состоящий из двух идентификаторов: LikerId и LikeeId
            builder.Entity<Like>()
                .HasKey(k => new {k.LikerId, k.LikeeId});

            // Определяем сущности, относящиеся к таблице Likes
            builder.Entity<Like>()
                .HasOne(u => u.Likee)
                .WithMany(u => u.Likers)
                .HasForeignKey(u => u.LikeeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Like>()
                .HasOne(u => u.Liker)
                .WithMany(u => u.Likees)
                .HasForeignKey(u => u.LikerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Определяем сущности, относящиеся к таблице Messages
            builder.Entity<Message>()
                .HasOne(u => u.Sender)
                .WithMany(m => m.MessagesSent)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Message>()
                .HasOne(u => u.Recipient)
                .WithMany(m => m.MessagesReceived)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}