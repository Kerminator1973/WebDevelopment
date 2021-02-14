using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Controllers
{
    // Указываем, что все методы контроллера должны быть
    // доступны только после аутентификации. Исключение
    // составляют только те методы, которые явно помечены,
    // как допускающие анонимное использование, см.
    // атрибут [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : Controller
    {
        private readonly DataContext _context;
        public ValuesController(DataContext context)
        {
            _context = context;
        }

        // GET api/values
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetValues()
        {
            var values = await _context.Values.ToListAsync();
            return Ok(values);
        }

        // GET api/values/5
        [Authorize(Roles = "Member")]
        [HttpGet("{_id}")]
        public async Task<IActionResult> GetValue(int _id)
        {
            var value = await _context.Values.FirstOrDefaultAsync(x => x.id == _id);
            return Ok(value);
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
