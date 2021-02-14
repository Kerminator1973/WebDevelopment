using System;

namespace DatingApp.API.Models
{
    public class Photo
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string Discription { get; set; }
        public DateTime DateAdded { get; set; }
        public bool IsMain { get; set; }

        public string PublicId { get; set; }

        // Следующие свойства, указывают на наличие связи между
        // таблицами User и Photo, что в соответствии с conventions,
        // создаст FOREIGN KEY и, соответственно, операция DELETE
        // будет каскадной, т.е. при удалении записи в таблице User,
        // будут каскадно удаляться и связанные записи в таблице Photos
        public User User { get; set; }
        public int UserId { get; set; }
    }
}