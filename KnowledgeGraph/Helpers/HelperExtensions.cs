using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;

public static class HelperExtensions
{
	#region Dynamic
	public static Object GetValue(this Object obj, String name)
	{
		foreach (String part in name.Split('.'))
		{
			if (obj == null) { return null; }

			Type type = obj.GetType();
			PropertyInfo info = type.GetProperty(part);
			if (info == null) { return null; }

			obj = info.GetValue(obj, null);
		}
		return obj;
	}

	public static T GetPropValue<T>(this Object obj, String name)
	{
		Object retval = GetValue(obj, name);
		if (retval == null) { return default(T); }

		// throws InvalidCastException if types are incompatible
		return (T)retval;
	}

	public static ExpandoObject ToPartialView<T>(this T obj, string[] properties) where T : class
	{
		var result = new ExpandoObject();
		var d = result as IDictionary<string, object>;

		foreach (var p in properties)
		{
			var val = obj.GetValue(p);
			d.Add(p, val);
		}

		return result;
	}
	#endregion Dynamic

	public static string ToJson(this ExpandoObject expando)
	{
		var serializer = new JavaScriptSerializer();
		var json = new StringBuilder();
		var keyPairs = new List<string>();
		var dictionary = expando as IDictionary<string, object>;
		json.Append("{");

		foreach (KeyValuePair<string, object> pair in dictionary)
		{
			if (pair.Value is ExpandoObject)
			{
				keyPairs.Add(String.Format(@"""{0}"": {1}", pair.Key, (pair.Value as ExpandoObject).ToJson()));
			}
			else
			{
				keyPairs.Add(String.Format(@"""{0}"": {1}", pair.Key, serializer.Serialize(pair.Value)));
			}
		}

		json.Append(String.Join(",", keyPairs.ToArray()));
		json.Append("}");

		return json.ToString();
	}
}