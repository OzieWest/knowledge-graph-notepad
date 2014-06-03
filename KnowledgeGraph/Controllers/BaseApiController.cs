using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Raven.Client;
using Raven.Client.Document;

namespace KnowledgeGraph.Controllers
{
	public class BaseApiController : ApiController
	{
		protected string dbHost;
		protected string dbBase;

		public BaseApiController()
		{
			dbHost = ConfigurationSettings.AppSettings["RavenDbHost"];
			dbBase = ConfigurationSettings.AppSettings["RavenDbBase"];
		}

		protected HttpResponseMessage Good(object response, HttpStatusCode status = HttpStatusCode.OK)
		{
			return Request.CreateResponse(status, response);
		}

		protected HttpResponseMessage Bad(string message, HttpStatusCode status = HttpStatusCode.BadRequest)
		{
			return Request.CreateErrorResponse(status, message);
		}

		protected HttpResponseMessage Open(Func<IDocumentSession, HttpResponseMessage> action)
		{
			using (var _store = new DocumentStore { Url = this.dbHost, DefaultDatabase = this.dbBase }.Initialize())
			{
				using (var _session = _store.OpenSession())
				{
					return action(_session);
				}
			}
		}

		protected Func<T, T> AsProjection<T>(string fields) where T : class
		{
			var _xParameter = Expression.Parameter(typeof(T), "o");
			var _xNew = Expression.New(typeof(T));

			var _bindings = fields
				.Split('.')
				.Select(o => o.Trim())
				.Select(o =>
				{
					var _mi = typeof(T).GetProperty(o);
					var _xOriginal = Expression.Property(_xParameter, _mi);
					return Expression.Bind(_mi, _xOriginal);
				});

			var _xInit = Expression.MemberInit(_xNew, _bindings);
			var _lambda = Expression.Lambda<Func<T, T>>(_xInit, _xParameter);
			return _lambda.Compile();
		}
	}
}