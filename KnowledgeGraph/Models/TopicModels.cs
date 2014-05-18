﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI.WebControls;

namespace KnowledgeGraph.Models
{
	public class TopicModels
	{
		public int Id { get; set; }
		public int ParentId { get; set; }
		
		public DateTime Created { get; set; }
		public DateTime Modified { get; set; }

		public string Title { get; set; }
		public string Value { get; set; }
		public string Category { get; set; }

		public List<string> Tags { get; set; }
	}
}