using Dartz.Service.Interfaces;
using Dartz.Model;
using Microsoft.AspNetCore.Mvc;

namespace Dartz_API.Controllers
{
    [ApiController]
    [Route("friends")]
    public class FriendsController : ControllerBase
    {

        private readonly ILogger<FriendsController> _logger;
        private readonly IFriendsService _friendsService;

        public FriendsController(ILogger<FriendsController> logger, IFriendsService friendsService)
        {
            _logger = logger;
            _friendsService = friendsService;
        }

        [HttpGet("{id}")]
        public ActionResult GetFriends(int id)
        {
            return Ok(_friendsService.GetFriends(id));
        }

        [HttpPost("")]
        public ActionResult AddFriend([FromForm] Relationship rs)
        {
            var isFriend = _friendsService.CheckFriendship(rs.userId1, rs.userId2);
            if (!isFriend)
            {
                _friendsService.AddFriend(rs.userId1, rs.userId2);
                return Ok();
            }
             
            return StatusCode(StatusCodes.Status406NotAcceptable);
            
        }

        [HttpPost("isFriend")]
        public ActionResult IsFriend([FromForm] Relationship rs)
        {    
            var isFriend = _friendsService.CheckFriendship(rs.userId1, rs.userId2);
            if (!isFriend)
                return Ok();

            return StatusCode(StatusCodes.Status406NotAcceptable, isFriend);
        }

        [HttpDelete("")]
        public ActionResult DeleteFriend([FromForm] Relationship rs)
        {

            var isFriend = _friendsService.CheckFriendship(rs.userId1, rs.userId2);
            if (isFriend)
            {
                _friendsService.DeleteFriend(rs.userId1, rs.userId2);
                return Ok();
            }

            return Ok();

        }
    }

    public class Relationship()
    {
        public int userId1 { get; set; }
        public int userId2 { get; set; }
    }
}
