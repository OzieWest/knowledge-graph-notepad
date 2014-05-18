using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using KnowledgeGraph.Models;
using Raven.Client.Document;

namespace KnowledgeGraph.Controllers
{
	public class TopicController : ApiController
	{
		private string dbHost;
		private string dbBase;

		public TopicController()
		{
			dbHost = ConfigurationSettings.AppSettings["RavenDbHost"];
			dbBase = ConfigurationSettings.AppSettings["RavenDbBase"];
		}

		// GET api/topic
		public IEnumerable<TopicModels> Get(int count = 10, int offset = 0)
		{
			using (var _store = new DocumentStore { Url = dbHost, DefaultDatabase = dbBase }.Initialize())
			{
				using (var _session = _store.OpenSession())
				{
					var _result = _session.Query<TopicModels>()
											.OrderBy(x => x.Created)
											.Skip(offset)
											.Take(count)
											.ToList();

					return _result;
				}
			}
		}

		// GET api/topic/5
		public TopicModels Get(int id)
		{
			using (var _store = new DocumentStore { Url = dbHost, DefaultDatabase = dbBase }.Initialize())
			{
				using (var _session = _store.OpenSession())
				{
					var _result = _session.Load<TopicModels>("TopicModels/" + id);

					return _result;
				}
			}
		}

		// POST api/topic
		public int Post(TopicModels newTopic)
		{
			if (CheckModel(newTopic))
			{
				using (var _store = new DocumentStore { Url = dbHost, DefaultDatabase = dbBase }.Initialize())
				{
					using (var _session = _store.OpenSession())
					{
						newTopic.Created = DateTime.UtcNow;
						newTopic.Modified = DateTime.UtcNow;

						_session.Store(newTopic);
						_session.SaveChanges();

						return newTopic.Id;
					}
				}
			}
			return 0;
		}

		// PUT api/topic/5
		public void Put(int id, [FromBody]string value)
		{
		}

		// DELETE api/topic/5
		public void Delete(int id)
		{
		}

		private bool CheckModel(TopicModels topic)
		{
			return !String.IsNullOrEmpty(topic.Title) && !String.IsNullOrEmpty(topic.Value);
		}
	}
}
