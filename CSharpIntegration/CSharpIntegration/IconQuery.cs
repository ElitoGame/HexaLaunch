using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.IO;

namespace CSharpIntegration
{
  class IconQuery
  {
    static void Main(string[] args)
    {
      for (int i = 0; i < args.Length; i++)
      {
        Console.WriteLine(GetIconBase64(args[i]));
      }
    }

    private static string GetIconBase64(string exe)
    {
      if (File.Exists(exe))
      {
        Icon icon = Icon.ExtractAssociatedIcon(exe);
        if (icon != null)
        {
          using (MemoryStream ms = new MemoryStream())
          {
            icon.ToBitmap().Save(ms, System.Drawing.Imaging.ImageFormat.Png);
            return exe + "?" + Convert.ToBase64String(ms.ToArray());
          }
        }
      }
      // I'm using ? as a separator since it's not allowed as a filename or foldername on windows!
      return "?";
    }
  }
}
