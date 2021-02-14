using aspnetDatingApp.DTOs;
using DatingApp.API.Data;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace aspnetDatingApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly UserManager<User> _userManager;
        public AdminController(DataContext context, UserManager<User> userManager)
        {
            _userManager = userManager;
            _context = context;
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("usersWithRoles")]
        public async Task<IActionResult> GetUsersWithRoles()
        {
            var userList = await (from user in _context.Users
                                  orderby user.UserName
                                  select new
                                  {
                                      Id = user.Id,
                                      UserName = user.UserName,
                                      Roles = (from userRole in user.UserRoles
                                               join role in _context.Roles
                                               on userRole.RoleId equals role.Id
                                               select role.Name).ToList()
                                  }).ToListAsync();

            return Ok(userList);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("editRoles/{userName}")]
        public async Task<IActionResult> EditRoles(string userName, RoleEditDto roleEditDto)
        {
            // Формируем список доступных пользовательских ролей и ролей,
            // установленных для конкретного пользователя. Это нужно для того,
            // чтобы вывести полный список ролей в виде checkbox-ов и предоставить
            // возможность выставлять пользователю любые роли
            var user = await _userManager.FindByNameAsync(userName);
            
            var userRoles = await _userManager.GetRolesAsync(user);
            
            var selectedRoles = roleEditDto.RoleNames;

            // Null coalescing operator: если selectedRoles будет равен null,
            // то присвоим ему пустой массив строк. В противном случае, не будем
            // делать ничего, присвоив ему его же самого
            selectedRoles = selectedRoles ?? new string[] {};

            // Довольно сложная схема добавления/удаления ролей нужна для того,
            // чтобы уменьшить количество записей, которые должны быть модифицированы
            // в базе данных Identity. Вместо того, чтобы сбрасывать все роли и
            // и добавлять назначенные, мы удаляем только те, которые были назначены 
            // ранее помечены, но потом помечены, как необходимые к удалению, а также
            // добавляем только те роли, которые не были назначены пользователю раньше.
            // Ещё один довод в пользу подобного подхода - нет необходимости использовать
            // транзакционный механизм, чтобы гарантировать, сохранение настроек
            // пользователя в том случае, если какой-то из вызовов закончится неудачей
            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));

            if (!result.Succeeded)
                return BadRequest("Failed to add to roles");

            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

            if (!result.Succeeded)
                return BadRequest("Failed to remove to roles");

            return Ok(await _userManager.GetRolesAsync(user));

        }

        [Authorize(Policy = "ModeratePhotoRole")]
        [HttpGet("photosForModeration")]
        public IActionResult GetPhotosForModeration()
        {
            return Ok("Admins or moderatores can see this");
        }
    }
}