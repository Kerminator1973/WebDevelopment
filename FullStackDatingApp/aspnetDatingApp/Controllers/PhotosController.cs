using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.DTOs;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Route("api/users/{userId}/photos")]
    public class PhotosController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IDatingRepository _repo;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        
        // Объект, через который можно взаимодействовать с облаком.
        // Процесс взаимодействия подробно описан на сайте проекта:
        // https://cloudinary.com/documentation/dotnet_integration
        private Cloudinary _cloudinary;

        public PhotosController(IDatingRepository repo, IMapper mapper,
        IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _cloudinaryConfig = cloudinaryConfig;
            _repo = repo;
            _mapper = mapper;

            // Считываем из конфигурационного файла, параметры доступа к
            // облаку Cloudinary.
            Account acc = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(acc);
        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photoFromRepo = await _repo.GetPhoto(id);

            var photo = _mapper.Map<PhotoForReturnDto>(photoFromRepo);

            return Ok(photo);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, 
            [FromForm]PhotoForCreationDto photoForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            // Считываем данные пользователя из базы данных
            var userFromRepo = await _repo.GetUser(userId);
            var file = photoForCreationDto.File;
            var uploadResult = new ImageUploadResult();

            if(file.Length > 0) 
            {
                // Всегда, когда мы работаем с большими объёмами данных, что
                // часто происходит при использовании stream, следует использовать
                // using, чтобы данные были максимально быстро выгружены из
                // оперативной памяти
                using (var stream = file.OpenReadStream()) 
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation()
                            .Width(500).Height(500).Crop("fill").Gravity("face")
                    };

                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }

            // Сохраняем в базу данных информацию об изображении, которую
            // нам вернул сервис Cloudinary: публичный Url, публичный
            // идентификатор файла, и т.д.
            photoForCreationDto.Url = uploadResult.Uri.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;

            // На основании полученных данных от Angular-приложения и от сервиса
            // Cloudinary, формируем объект типа Photo
            var photo = _mapper.Map<Photo>(photoForCreationDto);

            // Если у пользователя ещё не назначен основной файл, то назначаем
            // загруженный на сервис Cloudinary
            if (!userFromRepo.Photos.Any(u => u.IsMain))
                photo.IsMain = true;

            // Сохраняем данные об изображении в базу данных
            userFromRepo.Photos.Add(photo);
            if (await _repo.SaveAll())
            {
                // Метод CreatedAtRoute() генерирует код ответа HTTP Status 201,
                // который означает "Ресурс был успешно создан". Этот код ответа
                // отличается от 200 тем, что содержит поле "Location" - указывающее
                // на URL созданного документа. Чтобы корректно создать URL,
                // методу нужно знать фактическое имя обработчика адреса из
                // "Location", который указывается в первом параметре вызова
                // "GetPhoto". Второй параметр указывает на значение дополнительного
                // параметра обработчика GetPhoto(id). Третий параметр - объект,
                // который должен быть возвращён как JSON-Документ
                var photoToReturn = _mapper.Map<PhotoForReturnDto>(photo);
                return CreatedAtRoute("GetPhoto", new { id = photo.Id}, photoToReturn);
            }

            return BadRequest("Could not add the photo");
        }

        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int id)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var user = await _repo.GetUser(userId);

            // ПРоверяем, есть ли изображение с указанным Id в коллекции фотографий
            // пользователя, или нет
            if (!user.Photos.Any(p => p.Id == id))
                return Unauthorized();

            var photoFromRepo = await _repo.GetPhoto(id);

            if (photoFromRepo.IsMain)
                return BadRequest("This is already the main photo");

            // Убираем флаг "главная фотография" у той фотографии, которая была
            // главной раньше и устанавливаем у той, идентификатор которым был
            // передан нам в вызове WebAPI
            var currentMainPhoto = await _repo.GetMainPhotoForUser(userId);
            currentMainPhoto.IsMain = false;
            photoFromRepo.IsMain = true;

            if (await _repo.SaveAll())
                return NoContent();

            return BadRequest("Could not set photo to main");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id)
        {
            // Выполняем тот же набор проверочных действий, что и для
            // обработчика SetMainPhoto()
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var user = await _repo.GetUser(userId);

            if (!user.Photos.Any(p => p.Id == id))
                return Unauthorized();

            var photoFromRepo = await _repo.GetPhoto(id);

            // Запрещаем удалять "главное изображение"
            if (photoFromRepo.IsMain)
                return BadRequest("You cannot delete your main photo");

            if (photoFromRepo.PublicId != null) {

                // Удаляем изображение из публичного облака
                var deleteParams = new DeletionParams(photoFromRepo.PublicId);

                var result = _cloudinary.Destroy(deleteParams);

                // Если удалось удалить изображение из облака, удаляем его
                // и из базы данных
                if (result.Result == "ok") {
                    _repo.Delete(photoFromRepo);
                }
            }

            if(photoFromRepo.PublicId == null) {
                _repo.Delete(photoFromRepo);
            }

            if (await _repo.SaveAll())
                return Ok();

            return BadRequest("Failed to delete the photo");
        }
    }
}