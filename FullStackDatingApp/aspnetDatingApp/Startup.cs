using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using aspnetDatingApp.Models;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;


namespace DatingApp.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Подключаем provider доступа к системе управления базами данных,
            // рассчитанный на работу с SQLite. Если нужен будет другой движок,
            // то в этом месте нужно будет указать другой provider class
            services.AddDbContext<DataContext>(x => x.UseSqlite(Configuration.GetConnectionString("DefaultConnection")));

            // Настраиваем сервис ASP.NET Core 2 Identity. Одна из причин,
            // по которым мы должны это сделать - ввод паролей осуществляется
            // не Razor Pages, а Angular. В простом случае, мы могли бы
            // добавить сервис посредством AddIdentity
            IdentityBuilder builder = services.AddIdentityCore<User>(opt => {

                // Для целей упрощения отладки, устанавливаются простые, но
                // не приемлемые в промышленной эксплуатации требования к паролю
                opt.Password.RequireDigit = false;
                opt.Password.RequiredLength = 4;
                opt.Password.RequireNonAlphanumeric = false;
                opt.Password.RequireUppercase = false;
            });

            // Довольно странный код, в котором создаётся ещё один экземпляр
            // Identity Builder-a. Это выглядит весьма странно, но такое поведени
            // связано с тем, что мы отошли от настроек Identity "по умолчанию" и,
            // в частности, выбрали тип int для хранения идентификатора пользователя
            builder = new IdentityBuilder(builder.UserType, typeof(Role), builder.Services);
            builder.AddEntityFrameworkStores<DataContext>();

            // Добавляем валидатор ролей, role manager и SignIn manager
            builder.AddRoleValidator<RoleValidator<Role>>();
            builder.AddRoleManager<RoleManager<Role>>();
            builder.AddSignInManager<SignInManager<User>>();

            // Конфигурируем сервис аутентификации. Секретное слово загружаем из "appsettings.json"
            var key = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(Configuration.GetSection("AppSettings:Token").Value));

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options => {
                    options.TokenValidationParameters = new TokenValidationParameters {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = key,
                        ValidateIssuer = false,
                        ValidateAudience = false
                    };
                });

            // Определяем, какие роли могут выполнять некоторые специальные действия
            services.AddAuthorization(options => 
            {
                options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
                options.AddPolicy("ModeratePhotoRole", policy => policy.RequireRole("Admin", "Moderator"));
                options.AddPolicy("VipOnly", policy => policy.RequireRole("VIP"));
            });

            // Настраиваем JSON-parser (NewtonSoft) таким образом, чтобы он отрабатывал
            // циклически ссылки удобным для нас образом
            services.AddMvc(options => 
            {
                var policy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
                options.Filters.Add(new AuthorizeFilter(policy));
            })
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                .AddJsonOptions(opt => {
                    opt.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
                });

            // В коллекцию сервисов добавляем сервис Seed, копия которого будет создаваться
            // каждый раз, когда у потребителя возникнет потребность в сервисе. Этот тип
            // Dependency Injection подходит для легковесных сервисов, которые не хранят
            // данные о состоянии
            services.AddTransient<Seed>();

            // Добавляем сервис, который позволит решить проблему Cross-origin Resource Sharing
            services.AddCors();

            // Обеспечиваем доступ к параметрам облака Cloudinary через сервис
            services.Configure<CloudinarySettings>(Configuration.GetSection("CloudinarySettings"));

            // Добавляем сервис, который позволяет выполнять автоматический mapping
            // полей между разными классами, ориентируюсь на одноименные поля классов
            Mapper.Reset();
            services.AddAutoMapper();

            // Регистрируем сервис для выполнения операций с данными пользователей.
            // Первый тип шаблонного метода AddScoped<> - токен, по которому движок
            // Dependency Injection понимает, какую зависимость нужно создать. 
            // Второй тип - имя конкретного класса, экземпляр которого следует создавать.
            // Метод AddScoped<> гарантирует, что новая зависимость (экземпляр класса) будет
            // создаваться на каждый http-запрос
            services.AddScoped<IDatingRepository, DatingRepository>();

            services.AddScoped<LogUserActivity>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, Seed seeder)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // Используем глобальный обработчик исключений
                app.UseExceptionHandler(builder => {
                    builder.Run(async context => {
                        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        var error = context.Features.Get<IExceptionHandlerFeature>();
                        if(null != error) {

                            // Вызываем метод-расширение из "Helpers/Extensions.cs"
                            // в котором добавляем дополнительные заголовки в ответ
                            // сервера, связанные с "Access-Control-"
                            context.Response.AddApplicationError(error.Error.Message);

                            // Возвращаем Http-запрос со StatusCode 500,
                            // дополнительными полями в заголовке, а так же 
                            // с текстовым описанием ошибки
                            await context.Response.WriteAsync(error.Error.Message);
                        }
                    });
                });
            }

            // Заполняем базу данных случайными данными для тестирования
            seeder.SeedUsers();

            // Разрешаем использование заголовков "Access-Control-Allow-*" в ответе на http-запрос,
            // благодаря которым можно использовать Cross-origin Resource Sharing. Для промышленных
            // решений, следует разработать политику информационной безопасности.
            // Приведённый ниже код, исключительно для "The Walking Skeleton" - демонстрации
            // принципов работы web-приложения
            app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().AllowCredentials());
            app.UseAuthentication();
            app.UseMvc();
        }
    }
}
