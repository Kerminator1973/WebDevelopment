using Application.Activities;
using Application.Core;
using Application.Interfaces;
using Infrastructure.Photos;
using Infrastructure.Security;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Persistence;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config) {

            // Указываем, что движком СУБД будет Sqlite с указанными параметрами подключения
            services.AddDbContext<DataContext>(opt => {
                opt.UseSqlite(config.GetConnectionString("DefaultConnection"));
            });

            // Определяем CORS policy, в которой мы принимаем все заголовки в
            // любых методах, если запрос пришёл от http://localhost:3000
            services.AddCors(opt => {
                opt.AddPolicy("CorsPolicy", policy => {
                    policy
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .WithOrigins("http://localhost:3000");
                });
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "API", Version = "v1" });
            });

            // Подключаем сервис MediatR
            services.AddMediatR(typeof(List.Handler).Assembly);

            // Подключаем сервис AutoMapper
            services.AddAutoMapper(typeof(MappingProfiles).Assembly);

            // Подключаем сервис поиска имени пользователя из HttpContext-а
            services.AddScoped<IUserAccessor, UserAccessor>();

            // Подключаем сервис для обераций с облачным хранилищем Cloudinary
            services.AddScoped<IPhotoAccessor, PhotoAccessor>();

            // Подключаем сервис для считывания настроек Cloudinary
            services.Configure<CloudinarySettings>(config.GetSection("Cloudinary"));

            // Подключаем сервис SignalR
            services.AddSignalR();

            return services;
        }
    }
}