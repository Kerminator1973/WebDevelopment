namespace DatingApp.API.Helpers
{
    public class UserParams
    {
        private const int MaxPageSize = 50;
        public int PageNumber { get; set; } = 1;
        private int pageSize = 10;
        public int PageSize
        {
            get { return pageSize;}
            set { pageSize = (value > MaxPageSize) ? MaxPageSize : value;}
        }
        
        // Свойство использует для исключение из выборки (отображение на экране)
        // своей собственной записи
        public int UserId { get; set; }

        // Свойство Gender используется для фильтрации данных на форме
        public string Gender { get; set; }

        // Свойства MinAge и MaxAge используется для фильтрации по возрасту
        public int MinAge { get; set; } = 18;

        public int MaxAge { get; set; } = 99;

        // Поле содержит имя свойства, по которому следует сортировать данные
        public string OrderBy { get; set; }

        // 
        public bool Likees { get; set; } = false;

        public bool Likers { get; set; } = false;
    }
}