using DatingApp.API.Models;
using Microsoft.AspNetCore.Identity;

namespace aspnetDatingApp.Models
{
    public class UserRole : IdentityUserRole<int>
    {
        public User User { get; set; }

        public Role Role { get; set; }
    }
}