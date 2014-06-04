using System;
using System.Collections.Generic;
using System.Configuration;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.ModelBinding;
using KnowledgeGraph.Models;
using Raven.Client;
using Raven.Client.Document;
using System.Linq.Expressions;

namespace KnowledgeGraph.Controllers
{
	public class TopicController : BaseApiController
	{
		// GET api/topic
		[ActionName("DefaultAction")]
		public HttpResponseMessage Get(int count = 25, int offset = 0, string category = "", string partial = "")
		{
			return Open(session =>
			{
				IQueryable<Topic> _data = null;

				var _query = session.Query<Topic>();
				var _allCount = 0;
				
				if (!String.IsNullOrEmpty(category))
				{
					_data = _query.Where(x => x.Category == category)
						.OrderByDescending(x => x.Created);

					_allCount = session.Query<Topic>().Count(x => x.Category == category);
				}
				else
				{
					_data = _query.OrderByDescending(x => x.Created);
					_allCount = session.Query<Topic>().Count();
				}

				_data = _data.Skip(offset).Take(count);

				var _result = new
				{
					data = CheckResult(_data, partial),
					count = count,
					offset = offset,
					all = _allCount
				};

				return Good(_result);
			});
		}

		// GET api/topic/5
		[ActionName("DefaultAction")]
		public HttpResponseMessage Get(int id)
		{
			if (id <= 0)
				return Bad("Id should be more than 0");

			return Open(session =>
			{
				var _result = session.Load<Topic>("topics/" + id);

				if (_result != null)
					return Good(_result);

				return Bad("This ID doesn't exists.", HttpStatusCode.NotFound);
			});
		}

		// POST api/topic
		[ActionName("DefaultAction")]
		public HttpResponseMessage Post(Topic newTopic)
		{
			if (!CheckModel(newTopic))
				return Bad("Not correct topic structure");

			return Open(session =>
			{
				newTopic.Created = DateTime.UtcNow;
				newTopic.Modified = DateTime.UtcNow;

				session.Store(newTopic);
				session.SaveChanges();

				return Good(newTopic.Id, HttpStatusCode.Created);
			});
		}

		// PUT api/topic/5
		[ActionName("DefaultAction")]
		public HttpResponseMessage Put(int id, Topic oldTopic)
		{
			if (id <= 0 && !CheckModel(oldTopic))
				return Bad("Wrong parameters");

			return Open(session =>
			{
				var _result = session.Load<Topic>("topics/" + id);

				_result.Modified = DateTime.UtcNow;

				_result.Title = oldTopic.Title;
				_result.Value = oldTopic.Value;
				_result.Category = oldTopic.Category;
				_result.Status = oldTopic.Status;

				_result.Connections = oldTopic.Connections;
				_result.Links = oldTopic.Links;

				session.SaveChanges();

				return Good(true);
			});
		}

		// DELETE api/topic/5
		[ActionName("DefaultAction")]
		public HttpResponseMessage Delete(int id)
		{
			if (id <= 0)
				return Bad("Id should be more than 0");

			return Open(session =>
			{
				var _result = session.Load<Topic>("topics/" + id);

				if (_result == null)
					return Bad("This ID doesn't exists.", HttpStatusCode.NotFound);

				if (_result.Connections != null)
				{
					foreach (var _link in _result.Connections)
					{
						session.Load<Topic>("topics/" + _link)
							.IfNotNull(x => x.Connections.Remove(id));
					}
				}

				session.Delete(_result);
				session.SaveChanges();

				return Good(true);
			});
		}

		[HttpPost]
		public HttpResponseMessage Titles(int id, int[] arrayId)
		{
			if (id <= 0 && arrayId.Length != 0)
				return Bad("ID should be more than 0");

			return Open(session =>
			{
				var _result = new List<Object>();
				foreach (var _topicId in arrayId)
				{
					var _topic = session.Load<Topic>("topics/" + _topicId);
					_result.Add(new
					{
						Id = _topic.Id,
						Title = _topic.Title
					});
				}

				return Good(_result);
			});
		}

		#region Connections
		[HttpPost]
		public HttpResponseMessage DeleteConnections(int id, dynamic data)
		{
			int _conId = data.conId;
			if (id <= 0 || _conId <= 0)
				return Bad("ID and ConID should be more than 0");

			return Open(session =>
			{
				var _firstTopic = session.Load<Topic>("topics/" + id);
				_firstTopic.IfNotNull(x => x.Connections.Remove(_conId));

				var _secondTopic = session.Load<Topic>("topics/" + _conId);
				_secondTopic.IfNotNull(x => x.Connections.Remove(id));

				session.SaveChanges();

				return Good(true);
			});
		}

		[HttpPost]
		public HttpResponseMessage AddConnection(int id, dynamic data)
		{
			int _conId = data.conId;
			if (id <= 0 || _conId <= 0)
				return Bad("ID and ConID should be more than 0");

			return Open(s =>
			{
				var _firstTopic = s.Load<Topic>("topics/" + id);
				_firstTopic.IfNotNull(x => x.Connections.Add(_conId));

				var _secondTopic = s.Load<Topic>("topics/" + _conId);
				_secondTopic.IfNotNull(x => x.Connections.Add(id));

				s.SaveChanges();

				return Good(true);
			});
		}
		#endregion Connections


		#region Links
		[HttpPost]
		public HttpResponseMessage DeleteLink(int id, Link link)
		{
			if (id <= 0 || link == null)
				return Bad("ID and Links should be more than 0");

			return Open(session =>
			{
				var _firstTopic = session.Load<Topic>("topics/" + id);
				_firstTopic.IfNotNull(x =>
				{
					var _fLink = x.Links.First(l => l.Url == link.Url && l.Title == link.Title);
					x.Links.Remove(_fLink);
				});

				session.SaveChanges();

				return Good(true);
			});
		}

		[HttpPost]
		public HttpResponseMessage AddLink(int id, Link link)
		{
			if (id <= 0 || link == null)
				return Bad("ID and Links should be more than 0");

			return Open(session =>
			{
				var _firstTopic = session.Load<Topic>("topics/" + id);
				_firstTopic.IfNotNull(x =>
				{
					if (x.Links == null)
						x.Links = new List<Link>();

					x.Links.Add(link);
				});

				session.SaveChanges();

				return Good(true);
			});
		}
		#endregion Links

		[HttpPost]
		public HttpResponseMessage Search(int id, dynamic data)
		{
			return Open(session =>
			{
				string _titleSubstring = data.search;
				int _count = data.count;
				int _offset = data.offset;
				string _partial = data.partial;

				var _result = session.Query<Topic>()
					.Search(x => x.Title, string.Format("*{0}*", _titleSubstring), escapeQueryOptions: EscapeQueryOptions.RawQuery)
					.OrderByDescending(x => x.Created)
					.Skip(_offset)
					.Take(_count);

				return Good(CheckResult(_result, _partial));
			});
		}

		#region Support
		private bool CheckModel(Topic topic)
		{
			return topic != null && !String.IsNullOrEmpty(topic.Title) && !String.IsNullOrEmpty(topic.Value);
		}

		private List<Topic> CheckResult(IQueryable<Topic> list, string partial)
		{
			if (String.IsNullOrEmpty(partial))
				return list.ToList();

			return list.Select(AsProjection<Topic>(partial)).ToList();
		}
		#endregion Support
	}

	public class TitleResponse
	{
		public int Id;
		public string Title;
	}

	public static class Ext
	{
		public static void IfNotNull<T>(this T obj, Action<T> action) where T : class
		{
			if (obj != null)
				action(obj);
		}
	}
}
