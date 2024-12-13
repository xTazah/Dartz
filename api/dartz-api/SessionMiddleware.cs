using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

public class SessionMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly Dictionary<string, string> Sessions = new();

    public SessionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        //if (context.Request.Cookies.TryGetValue("SessionId", out var sessionId) && Sessions.ContainsKey(sessionId))
        //{
        //    context.Items["User"] = Sessions[sessionId];
        //}

        await _next(context);
    }

    public static string CreateSession(string username)
    {
        var sessionId = Guid.NewGuid().ToString();
        Sessions[sessionId] = username;
        return sessionId;
    }
    public static void RemoveSession(string sessionId)
    {
        Sessions.Remove(sessionId);
    }


    public static string GetUsernameFromSession(string sessionId)
    {
        Sessions.TryGetValue(sessionId, out var username);

        if(string.IsNullOrEmpty(username))
        {
            return null;
        }

        return username;
    }
}
