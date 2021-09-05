using Domain;                           // Определение структуры (объекта) Value
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;    // Определение DbContext

namespace Persistence
{
    // DbContext представляет интерфейс для доступа к базе данных
    public class DataContext : IdentityDbContext<AppUser>
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }

        // Указываем на необходимость включения в базу данных таблицы Values
        public DbSet<Activity> Activities { get; set; }

        public DbSet<ActivityAttendee> ActivityAttendees { get; set; }

        // У пользователя есть коллекция фотографий
        public DbSet<Photo> Photos { get; set; }

        public DbSet<Comment> Comments { get; set; }

        public DbSet<UserFollowing> UserFollowings { get; set; }

        // Добавляем Seed - стартовые данные, без которых нормальная работа
        // приложения может быть затруднена. Обычно Seed содержат редко
        // изменяемые справочникиd
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            /*
            // В первоначальной версии курса, SeedData добавлялись так:

            builder.Entity<Activity>()
                .HasData(
                    new Value {Id = 1, Name = "Value 101"},
                    new Value {Id = 2, Name = "Value 102"},
                    new Value {Id = 3, Name = "Value 103"}
                );
            */

            builder.Entity<ActivityAttendee>(x => x.HasKey(aa => new {aa.AppUserId, aa.ActivityId}));

            // Мы говорим: у нас есть сущность (ActivityAttendee), в которой есть
            // поле-объект (AppUser), которое связано с коллекцией сущностей
            // (AppUser) по внешнему ключу (AppUserId).
            // Мы можем увидеть, что в AppUser есть коллекция Activities,
            // а в сущности Activity есть коллекция Attendees. Когда мы указываем
            // ключи AppUserId и ActivityId мы загружаем в коллекцию соответствующие
            // записи по соответствующему идентификатору
            builder.Entity<ActivityAttendee>()
                .HasOne(u => u.AppUser)
                .WithMany(a => a.Activities)
                .HasForeignKey(aa => aa.AppUserId);

            builder.Entity<ActivityAttendee>()
                .HasOne(u => u.Activity)
                .WithMany(a => a.Attendees)
                .HasForeignKey(aa => aa.ActivityId);

            builder.Entity<Comment>()
                .HasOne(a => a.Activity)
                .WithMany(c => c.Comments)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserFollowing>(b => {
                b.HasKey(k => new {k.ObserverId, k.TargetId});

                b.HasOne(o => o.Observer)
                    .WithMany(f => f.Followings)
                    .HasForeignKey(o => o.ObserverId)
                    .OnDelete(DeleteBehavior.Cascade);

                b.HasOne(o => o.Target)
                    .WithMany(f => f.Followers)
                    .HasForeignKey(o => o.TargetId)
                    .OnDelete(DeleteBehavior.Cascade);                    
            });
        }
    }
}
