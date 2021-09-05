using System.Threading.Tasks;
using Application.Photos;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces
{
    public interface IPhotoAccessor
    {
        // Определяем для метода интерфейса, которые отвечают за загрузку
        // файла в облако Cloudinary, а также за удаление файлов в облаке
        Task<PhotoUploadResult> AddPhoto(IFormFile file);
        Task<string> deletePhoto(string publicId);
    }
}