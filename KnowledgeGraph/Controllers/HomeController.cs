using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace KnowledgeGraph.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index(string category)
		{
			ViewBag.Category = category;

			return View();
		}

		public ActionResult Topic(string id)
		{
			if (string.IsNullOrEmpty(id))
				return RedirectToAction("Index");

			ViewBag.Id = id;

			return View();
		}
	}
}
