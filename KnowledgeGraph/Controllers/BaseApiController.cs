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
	}
}