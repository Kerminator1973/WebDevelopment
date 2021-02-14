using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Helpers
{
    public class PagedList<T> : List<T>
    {
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }

        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            // Инициализируем свойства объекта
            TotalCount = count;
            PageSize = pageSize;
            CurrentPage = pageNumber;
            TotalPages = (int)Math.Ceiling(count / (double)pageSize);

            // Добавляем указанные элементы (items) в конец текущей коллекции
            this.AddRange(items);
        }

        public static async Task<PagedList<T>> CreateAsync(IQueryable<T> source,
            int pageNumber, int pageSize ) 
        {
            // Используя источник данных (source) сначала вычисляем общее количество
            // элементов данных
            var count = await source.CountAsync();

            // Вычисляем с какого элемента следует начать выборку и применяем Skip(),
            // отсекая те элементы, которые находятся до интересующего нас диапазона.
            // Используем Take() для того, чтобы указать, сколько элементов нам требуется.
            // Получаем только те элементы, которые находятся в искомом диапазоне -
            // именно это позволяет осуществить вызов ToListAsync()
            var items = await source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

            // Создаём новый объект класса PagedList, который является списком с рядом
            // дополнительных удобных свойств (CurrentPage, TotalPages, и т.д.)
            return new PagedList<T>(items, count, pageNumber, pageSize);
        }
    }
}