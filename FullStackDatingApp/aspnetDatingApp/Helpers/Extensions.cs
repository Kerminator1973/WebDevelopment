using System;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace DatingApp.API.Helpers
{
    public static class Extensions
    {
        // Метод-расширение, позволяет добавить в ответ на http-запрос дополнительные
        // заголовки, позволяющие лучше структурировать ответ клиенту
        public static void AddApplicationError(this HttpResponse response, string message)
        {
            response.Headers.Add("Application-Error", message);
            response.Headers.Add("Access-Control-Expose-Headers", "Application-Error");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
        }

        // Включаем в заголовок Http-ответа дополнительное поле "Pagination",
        // внутри которого будут находится дополнительные параметры, описывающие
        // pagination конкретной страницы. Кроме этого, поле "Pagination"
        // необходимо добавить в заголовок "Access-Control-Expose-Headers" -
        // если этого не сделать, то поле "Pagination" может быть отфильтровано
        public static void AddPagination(this HttpResponse response, 
            int currentPage, int itemsPerPage, int totalItems, int totalPages)
        {
            var paginationHeader = new PaginationHeader(currentPage, 
                itemsPerPage, totalItems, totalPages);
            var camelCaseFormatter = new JsonSerializerSettings();
            camelCaseFormatter.ContractResolver = new
                CamelCasePropertyNamesContractResolver();
            response.Headers.Add("Pagination", 
                JsonConvert.SerializeObject(paginationHeader, camelCaseFormatter));
            response.Headers.Add("Access-Control-Expose-Headers", "Pagination");
        }

        // Метод-расширение, вычисляет количество полных лет пользователя
        public static int CalculateAge(this DateTime theDateTime)
        {
            var age = DateTime.Today.Year - theDateTime.Year;
            if(theDateTime.AddYears(age) > DateTime.Today)
                age--;

            return age;
        }
    }
}
