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
using Newtonsoft.Json.Linq;
using Raven.Client;
using Raven.Client.Document;
using System.Linq.Expressions;

namespace KnowledgeGraph.Controllers
{
	public class TopicController : BaseApiController
	{
		[HttpGet]
		public HttpResponseMessage GetAll(int count = 25, int offset = 0, string category = "", string partial = "")
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
					data = _data.AsPartial(partial),
					count = count,
					offset = offset,
					all = _allCount
				};

				return Good(_result);
			});
		}

		[HttpGet]
		public HttpResponseMessage GetById(int id)
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

		[HttpPost]
		public HttpResponseMessage AddTopic(JObject data)
		{
			var _newTopic = data.As<Topic>("topic");

			if (!CheckModel(_newTopic))
				return Bad("Not correct topic structure");

			return Open(session =>
			{
				_newTopic.Created = DateTime.UtcNow;
				_newTopic.Modified = DateTime.UtcNow;

				session.Store(_newTopic);
				session.SaveChanges();

				return Good(_newTopic.Id, HttpStatusCode.Created);
			});
		}

		[HttpPost]
		public HttpResponseMessage UpdateTopic(JObject data)
		{
			var _id = data.As<int>("id");
			var _oldTopic = data.As<Topic>("topic");

			if (_id <= 0 && !CheckModel(_oldTopic))
				return Bad("Wrong parameters");

			return Open(session =>
			{
				var _result = session.Load<Topic>("topics/" + _id);

				_result.Modified = DateTime.UtcNow;

				_result.Title = _oldTopic.Title;
				_result.Value = _oldTopic.Value;
				_result.Category = _oldTopic.Category;
				_result.Status = _oldTopic.Status;

				_result.Connections = _oldTopic.Connections;
				_result.Links = _oldTopic.Links;

				session.SaveChanges();

				return Good(true);
			});
		}

		[HttpPost]
		public HttpResponseMessage DeleteTopic(JObject data)
		{
			int _id = data.As<int>("id");;

			if (_id <= 0)
				return Bad("Id should be more than 0");

			return Open(session =>
			{
				var _result = session.Load<Topic>("topics/" + _id);

				if (_result == null)
					return Bad("This ID doesn't exists.", HttpStatusCode.NotFound);

				if (_result.Connections != null)
				{
					foreach (var _link in _result.Connections)
					{
						session.Load<Topic>("topics/" + _link)
							.IfNotNull(x => x.Connections.Remove(_id));
					}
				}

				session.Delete(_result);
				session.SaveChanges();

				return Good(true);
			});
		}

		[HttpPost]
		public HttpResponseMessage GetTitles(JObject data)
		{
			int[] _arrayId = data.As<int[]>("arrayId");

			if (_arrayId.Length == 0)
				return Bad("Length should be more than 0");

			return Open(session =>
			{
				var _result = new List<Object>();
				foreach (var _topicId in _arrayId)
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
		public HttpResponseMessage DeleteConnections(JObject data)
		{
			var _id = data.As<int>("id");
			int _conId = data.As<int>("conId");

			if (_id <= 0 || _conId <= 0)
				return Bad("ID and ConID should be more than 0");

			return Open(session =>
			{
				var _firstTopic = session.Load<Topic>("topics/" + _id);
				_firstTopic.IfNotNull(x => x.Connections.Remove(_conId));

				var _secondTopic = session.Load<Topic>("topics/" + _conId);
				_secondTopic.IfNotNull(x => x.Connections.Remove(_id));

				session.SaveChanges();

				return Good(true);
			});
		}

		[HttpPost]
		public HttpResponseMessage AddConnection(JObject data)
		{
			var _id = data.As<int>("id");
			var _conId = data.As<int>("conId");

			if (_id <= 0 || _conId <= 0)
				return Bad("ID and ConID should be more than 0");

			return Open(s =>
			{
				var _firstTopic = s.Load<Topic>("topics/" + _id);
				_firstTopic.IfNotNull(x => x.Connections.Add(_conId));

				var _secondTopic = s.Load<Topic>("topics/" + _conId);
				_secondTopic.IfNotNull(x => x.Connections.Add(_id));

				s.SaveChanges();

				return Good(true);
			});
		}
		#endregion Connections


		#region Links
		[HttpPost]
		public HttpResponseMessage DeleteLink(JObject data)
		{
			var _id = data.As<int>("id");
			var _link = data.As<Link>("link");

			if (_id <= 0 || _link == null)
				return Bad("ID and Links should be more than 0");

			return Open(session =>
			{
				var _firstTopic = session.Load<Topic>("topics/" + _id);
				_firstTopic.IfNotNull(x =>
				{
					var _fLink = x.Links.First(l => l.Url == _link.Url && l.Title == _link.Title);
					x.Links.Remove(_fLink);
				});

				session.SaveChanges();

				return Good(true);
			});
		}

		[HttpPost]
		public HttpResponseMessage AddLink(JObject data)
		{
			var _id = data.As<int>("id");
			var _link = data.As<Link>("link");

			if (_id <= 0 || _link == null)
				return Bad("ID and Links should be more than 0");

			return Open(session =>
			{
				var _firstTopic = session.Load<Topic>("topics/" + _id);
				_firstTopic.IfNotNull(x =>
				{
					if (x.Links == null)
						x.Links = new List<Link>();

					x.Links.Add(_link);
				});

				session.SaveChanges();

				return Good(true);
			});
		}
		#endregion Links

		[HttpPost]
		public HttpResponseMessage Search(JObject data)
		{
			return Open(session =>
			{
				var _titleSubstring = data.As<string>("search");
				var _count = data.As<int>("count");
				var _offset = data.As<int>("offset");
				var _partial = data.As<string>("partial");

				var _result = session.Query<Topic>()
					.Search(x => x.Title, string.Format("*{0}*", _titleSubstring), escapeQueryOptions: EscapeQueryOptions.RawQuery)
					.OrderByDescending(x => x.Created)
					.Skip(_offset)
					.Take(_count);

				return Good(_result.AsPartial(_partial));
			});
		}

		#region Support
		private bool CheckModel(Topic topic)
		{
			return topic != null && !String.IsNullOrEmpty(topic.Title) && !String.IsNullOrEmpty(topic.Value);
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
