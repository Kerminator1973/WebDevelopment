namespace Application.Core
{
    // Вспомогательный класс, посредством которого мы возвращаем результат выполнения
    // операции с уровня бизнес-логики на уровень RESTful API, без использования
    // исключений
    public class Result<T>
    {
        public bool IsSuccess { get; set; }

        public T Value { get; set; }
        public string Error { get; set; }

        public static Result<T> Success(T value) => new Result<T> {IsSuccess = true, Value = value};
        public static Result<T> Failure(string error) => new Result<T> {IsSuccess = false, Error = error};
    }
}
