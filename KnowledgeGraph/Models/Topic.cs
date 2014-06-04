using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI.WebControls;

namespace KnowledgeGraph.Models
{
	public class Link
	{
		public String Title { get; set; }
		public String Type { get; set; }
		public String Url { get; set; }
	}

	public class Topic
	{
		public int Id { get; set; }
		
		public DateTime Created { get; set; }
		public DateTime Modified { get; set; }

		public string Title { get; set; }
		public string Value { get; set; }
		public string Category { get; set; }
		public string Status { get; set; }

		public List<int> Connections { get; set; }
		public List<Link> Links { get; set; }
	}
}