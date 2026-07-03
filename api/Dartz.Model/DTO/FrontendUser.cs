using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dartz.Model
{
    public class FrontendUser
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Initial { get; set; }
        public string? DartColor { get; set; }
        public string? ProfilePicture { get; set; }
        public string? Bio { get; set; }
        public DateOnly? MemberSince { get; set; }
        public bool AllowNoAuth { get; set; }

        /// <summary>
        /// JWT access token. Also set as an HttpOnly cookie for REST calls; this copy
        /// is for the SignalR client, which must pass the token via accessTokenFactory
        /// because browsers cannot attach it to the WebSocket handshake. Kept in memory
        /// on the client (never localStorage).
        /// </summary>
        public string? Token { get; set; }
    }
}
