using System;
using System.Collections.Generic;
using System.Linq;
using aspnetDatingApp.Models;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;

namespace DatingApp.API.Data
{
    public class Seed
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;

        public Seed(UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public UserManager<User> UserManager { get; }

        // Метод позволяет проинициализировать базу данных случайной информацией
        // из внешнего JSON-файла. Это значительно упрощает разработку приложения,
        // т.к. позволяет не выполнять подготовку данных каждый раз, когда, 
        // по каким-то причинам, базу данных пришлось очистить
        public void SeedUsers()
        {
            if (!_userManager.Users.Any()) {

                // Очищаем данные о пользователях в базе данных
                //_context.Users.RemoveRange(_context.Users);
                //_context.SaveChanges();

                // Считываем Seed Date из внешнего json-файла (Seed users)
                var userData = System.IO.File.ReadAllText("Data/UserSeedData.json");
                var users = JsonConvert.DeserializeObject<List<User>>(userData);

                // Создаём пользовательские роли
                var roles = new List<Role> {
                    new Role {Name = "Member"},
                    new Role {Name = "Admin"},
                    new Role {Name = "Moderator"},
                    new Role {Name = "VIP"}
                };

                foreach (var role in roles) {

                    // В случае, если в API отсутствует синхронный метод, но
                    // нам нужен именно он, то можно использовать
                    // асинхронный и вызывать метод Wait() для возвращаемого
                    // объекта
                    _roleManager.CreateAsync(role).Wait();
                }

                // Создаём фиктивных пользователей с простым паролем,
                // что удобно для отладки кода приложения.
                foreach (var user in users)
                {
                    _userManager.CreateAsync(user, "password").Wait();

                    // Привязываем к каждому новому пользователю роль 
                    // "Обычный пользователь"
                    _userManager.AddToRoleAsync(user, "Member").Wait();
                }

                // Создаём пользователя с ролью "Администратор"
                var adminUser = new User 
                {
                    UserName = "Admin"
                };

                IdentityResult result = _userManager.CreateAsync(adminUser, "password").Result;

                if (result.Succeeded)
                {
                    var admin = _userManager.FindByNameAsync("Admin").Result;
                    _userManager.AddToRolesAsync(admin, new[] {"Admin", "Moderator"}).Wait();
                }
            }
        }
    }
}