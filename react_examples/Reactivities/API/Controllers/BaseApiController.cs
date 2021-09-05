using Microsoft.AspNetCore.Mvc;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Application.Core;
using API.Extensions;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseApiController : ControllerBase
    {
        // Базовый класс BaseApiController создан для того, чтобы исключить
        // из кода всех контроллеров конструктор, необходимый лишь для
        // инициализации медиатора.
        
        private IMediator _mediator;
        
        // Используем конструкцию похожую на Singleton: если член класса нулевой,
        // то он инициализируется (см. ??=) ссылкой на экземпляр сервиса IMediator
        protected IMediator Mediator => _mediator ??= HttpContext.RequestServices
            .GetService<IMediator>();

        protected ActionResult HandleResult<T>(Result<T> result) 
        {
            if (result == null)
                return NotFound();

            if (result.IsSuccess && result.Value != null)
                return Ok(result.Value);

            if (result.IsSuccess && result.Value == null)
                return NotFound();

            return BadRequest(result.Value);
        }

        // Метод позволяет добавить в HTTP-ответ дополнительное поле с описанием
        // информации о текущей странице, переданной браузеру. См. AddPaginationHeader()
        protected ActionResult HandlePagedResult<T>(Result<PagedList<T>> result) 
        {
            if (result == null)
                return NotFound();

            if (result.IsSuccess && result.Value != null) {

                Response.AddPaginationHeader(result.Value.CurrentPage,
                    result.Value.PageSize, result.Value.TotalCount, 
                    result.Value.TotalPages );

                return Ok(result.Value);
            }

            if (result.IsSuccess && result.Value == null)
                return NotFound();

            return BadRequest(result.Value);
        }
    }
}