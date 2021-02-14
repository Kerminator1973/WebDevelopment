using System;
using Microsoft.AspNetCore.Http;

namespace DatingApp.API.DTOs
{
    public class PhotoForCreationDto
    {
        public string Url { get; set; }

        // IFormFile - интерфейс, который используется для передачи
        // по сети файлов, например, изображений
        public IFormFile File { get; set; }

        public string Description { get; set; }

        public DateTime DateAdded { get; set; }

        public string PublicId { get; set; }

        public PhotoForCreationDto()
        {
            DateAdded = DateTime.Now;
        }
    }
}