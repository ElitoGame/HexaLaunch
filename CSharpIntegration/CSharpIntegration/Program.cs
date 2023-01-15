using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Windows.Media.Control;
using IWshRuntimeLibrary;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Drawing;

namespace CSharpIntegration
{

  /*
   ****************************************************************
   *
   * This program is no longer used, as it's been implemented in Rust mostly! 
   * However Icon querying still happens in CSharp, see IconQuery.cs for this matter"
   * 
   ****************************************************************
  */

  class Program
  {
    private static String currentMediaTitle = "";
    private static bool currentPlayback = false;
    private static int notFoundCounter = 0;

    static void Main2(string[] args)
    {
      switch (args[0])
      {
        case "-toggleplay":
          toggleMedia().Wait();
          break;
        case "-next":
          nextMedia().Wait();
          break;
        case "-prev":
          prevMedia().Wait();
          break;
        case "-listenToMediaChanges":
          listenToMediaChanges().Wait();
          break;
        case "-queryApps":
          queryApps().Wait();
          break;
      }
    }

/*
 ██████   ██████                     ███                █████████                       █████                       ████         
░░██████ ██████                     ░░░                ███░░░░░███                     ░░███                       ░░███         
 ░███░█████░███  █████ ████  █████  ████   ██████     ███     ░░░   ██████  ████████   ███████   ████████   ██████  ░███   █████ 
 ░███░░███ ░███ ░░███ ░███  ███░░  ░░███  ███░░███   ░███          ███░░███░░███░░███ ░░░███░   ░░███░░███ ███░░███ ░███  ███░░  
 ░███ ░░░  ░███  ░███ ░███ ░░█████  ░███ ░███ ░░░    ░███         ░███ ░███ ░███ ░███   ░███     ░███ ░░░ ░███ ░███ ░███ ░░█████ 
 ░███      ░███  ░███ ░███  ░░░░███ ░███ ░███  ███   ░░███     ███░███ ░███ ░███ ░███   ░███ ███ ░███     ░███ ░███ ░███  ░░░░███
 █████     █████ ░░████████ ██████  █████░░██████     ░░█████████ ░░██████  ████ █████  ░░█████  █████    ░░██████  █████ ██████ 
░░░░░     ░░░░░   ░░░░░░░░ ░░░░░░  ░░░░░  ░░░░░░       ░░░░░░░░░   ░░░░░░  ░░░░ ░░░░░    ░░░░░  ░░░░░      ░░░░░░  ░░░░░ ░░░░░░  
*/
    private static async Task toggleMedia()
    {
      try
      {
        var manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
        var session = manager.GetCurrentSession();
        if (session != null)
        {
          await session.TryTogglePlayPauseAsync();
        }
      }
      catch (Exception e) { }
    }
    private static async Task nextMedia()
    {
      try
      {
        var manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
        var session = manager.GetCurrentSession();
        if (session != null)
        {
          await session.TrySkipNextAsync();
        }
      }
      catch (Exception e){}
    }
    private static async Task prevMedia()
    {
      try
      {
        var manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
        var session = manager.GetCurrentSession();
        if (session != null)
        {
          await session.TrySkipPreviousAsync();
        }
      }
      catch (Exception e) {
        Console.WriteLine(e);
      }
    }
    private static async Task listenToMediaChanges()
    {
      while (true)
      {
        await Task.Delay(1000);
        await runMediaTask();
      }
    }

    private static async Task runMediaTask()
    {
      try
      {
        var manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
        var session = manager.GetCurrentSession();
        if (session != null)
        {
          var media = await session.TryGetMediaPropertiesAsync();
          bool isPlaying = session.GetPlaybackInfo().PlaybackStatus == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing;
          if (!currentMediaTitle.Equals(media.Title) || currentPlayback != isPlaying)
          {
            currentMediaTitle = media.Title;
            currentPlayback = isPlaying;
            string thumb = null;
            if (media.Thumbnail != null)
            {
              var ras = await media.Thumbnail.OpenReadAsync();
              var stream = ras.AsStream();
              var ms = new MemoryStream();
              ms.Seek(0, SeekOrigin.Begin);
              stream.CopyTo(ms);
              var array = ms.ToArray();
              thumb = Convert.ToBase64String(array);
            }
            Console.WriteLine("{\"title\":\"" + media.Title + "\",\"thumbnail\":\"" + thumb + "\",\"artist\":\"" + media.Artist + "\",\"isPlaying\":\"" + isPlaying + "\"}");
          }
        }
      }
      catch (Exception e)
      {
        Console.WriteLine(e);
        currentMediaTitle = "";
      }
    }

/*
   █████████                             ██████                                              ███                     
  ███░░░░░███                          ███░░░░███                                           ░░░                      
 ░███    ░███  ████████  ████████     ███    ░░███ █████ ████  ██████  ████████  █████ ████ ████  ████████    ███████
 ░███████████ ░░███░░███░░███░░███   ░███     ░███░░███ ░███  ███░░███░░███░░███░░███ ░███ ░░███ ░░███░░███  ███░░███
 ░███░░░░░███  ░███ ░███ ░███ ░███   ░███   ██░███ ░███ ░███ ░███████  ░███ ░░░  ░███ ░███  ░███  ░███ ░███ ░███ ░███
 ░███    ░███  ░███ ░███ ░███ ░███   ░░███ ░░████  ░███ ░███ ░███░░░   ░███      ░███ ░███  ░███  ░███ ░███ ░███ ░███
 █████   █████ ░███████  ░███████     ░░░██████░██ ░░████████░░██████  █████     ░░███████  █████ ████ █████░░███████
░░░░░   ░░░░░  ░███░░░   ░███░░░        ░░░░░░ ░░   ░░░░░░░░  ░░░░░░  ░░░░░       ░░░░░███ ░░░░░ ░░░░ ░░░░░  ░░░░░███
               ░███      ░███                                                     ███ ░███                   ███ ░███
               █████     █████                                                   ░░██████                   ░░██████ 
              ░░░░░     ░░░░░                                                     ░░░░░░                     ░░░░░░  
*/

    private static async Task queryApps()
    {
      App[] relevantList = queryRelevantApps();
      App[] otherList = queryOtherApps();
      // get the icons
      Stopwatch stopWatch = new Stopwatch();
      stopWatch.Start();
      App[] appList = new App[relevantList.Length + otherList.Length];
      relevantList.CopyTo(appList, 0);
      otherList.CopyTo(appList, relevantList.Length);
      // remove duplicates, hopefully prioritizing the relevant files.
      appList = appList.Distinct(new AppComparer()).ToArray();

      // split the array into chunks of 100
      int chunkSize = 5;
      var chunks = otherList.Select((s, i) => new { Index = i, Value = s })
                           .GroupBy(x => x.Index / chunkSize)
                           .Select(x => x.Select(v => v.Value).ToArray())
                           .ToArray();

      // get the icons for each chunk in parallel and merge the results
      List<Task<App[]>> tasks = new List<Task<App[]>>();
      foreach (App[] chunk in chunks)
      {
        tasks.Add(Task.Run(() => chunk.Select(x => GetIconBase64(x)).ToArray()));
      }
      var results = await Task.WhenAll(tasks);
      // flatten the multidimensional array into a single array
      var modresults = results.SelectMany(x => x).ToArray();
      //var modresults = iconList.Where(x => !string.IsNullOrEmpty(x)).ToArray();
      Console.WriteLine("Resulting in " + modresults.Length + " icons.");

      foreach (App app in modresults)
      {
        Console.WriteLine(app.name + ": " + app.executable + " => " + (app.icon != null));
      }
      // distinct


      stopWatch.Stop();
      // Get the elapsed time as a TimeSpan value.
      TimeSpan ts = stopWatch.Elapsed;
      string elapsedTime = String.Format("{0:00}:{1:00}:{2:00}.{3:000}",
            ts.Hours, ts.Minutes, ts.Seconds,
            ts.Milliseconds);
      Console.WriteLine("RunTime " + elapsedTime + " for the icons!");
      Console.WriteLine("All files:" + modresults.Length); // the count of unique icons is ~ 1/5th of what it should be. Check if the threads are causing a problem.
    }


    private static App[] queryRelevantApps()
    {
      Stopwatch stopWatch = new Stopwatch();
      stopWatch.Start();
      App[] startMenuFiles = GetShortcutTargetExecutables(GetFiles(
        Environment.GetFolderPath(Environment.SpecialFolder.StartMenu),
        "*.lnk").ToArray());
      App[] commonStartMenuFiles = GetShortcutTargetExecutables(GetFiles(
        Environment.GetFolderPath(Environment.SpecialFolder.CommonStartMenu),
        "*.lnk").ToArray());
      App[] desktopFiles = GetShortcutTargetExecutables(GetFiles(
        Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
        "*.lnk").ToArray());
      App[] commonDesktopFiles = GetShortcutTargetExecutables(GetFiles(
        Environment.GetFolderPath(Environment.SpecialFolder.CommonDesktopDirectory),
        "*.lnk").ToArray());


      App[] allFiles = new App[desktopFiles.Length + commonDesktopFiles.Length + startMenuFiles.Length + commonStartMenuFiles.Length];
      desktopFiles.CopyTo(allFiles, 0);
      commonDesktopFiles.CopyTo(allFiles, desktopFiles.Length);
      startMenuFiles.CopyTo(allFiles, desktopFiles.Length + commonDesktopFiles.Length);
      commonStartMenuFiles.CopyTo(allFiles, desktopFiles.Length + commonDesktopFiles.Length + startMenuFiles.Length);

      // remove duplicates
      allFiles = allFiles.Distinct(new AppComparer()).ToArray();
      // remove empty strings
      allFiles = allFiles.Where(x => !string.IsNullOrEmpty(x.executable)).ToArray();
      // only keep executables
      allFiles = allFiles.Where(x => x.executable.EndsWith(".exe")).ToArray();
      // check if the file exists
      allFiles = allFiles.Where(x => System.IO.File.Exists(x.executable)).ToArray();

      //log all files


      stopWatch.Stop();
      // Get the elapsed time as a TimeSpan value.
      TimeSpan ts = stopWatch.Elapsed;
      string elapsedTime = String.Format("{0:00}:{1:00}:{2:00}.{3:000}",
            ts.Hours, ts.Minutes, ts.Seconds,
            ts.Milliseconds);
      Console.WriteLine("RunTime " + elapsedTime + " for " + allFiles.Length + " files!");
      return allFiles;
    }
    private static App[] queryOtherApps()
    {
      Stopwatch stopWatch = new Stopwatch();
      stopWatch.Start();
      Console.WriteLine(Environment.ExpandEnvironmentVariables("%ProgramW6432%") + ", " + Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles)
        + ", " + Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86));
      // run the task in a separate thread
      
      // create new tasks for every top level folder
      string[] topProgFolders = Directory.GetDirectories(Environment.ExpandEnvironmentVariables("%ProgramW6432%"));
      string[] topProg86Folders = Directory.GetDirectories(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86));

      List<Task<string[]>> tasks = new List<Task<string[]>>();
      foreach (string folder in topProgFolders)
      {
        tasks.Add(Task.Run(() => GetFiles(folder, "*.exe").ToArray()));
      }
      foreach (string folder in topProg86Folders)
      {
        tasks.Add(Task.Run(() => GetFiles(folder, "*.exe").ToArray()));
      }
        
      // wait for both tasks to finish
      Task.WaitAll(tasks.ToArray());

      string[] allFiles = tasks.SelectMany(x => x.Result).ToArray();

      allFiles = allFiles.Where(x => !string.IsNullOrEmpty(x)).ToArray();
      allFiles = allFiles.Distinct().ToArray();

      App[] appList = allFiles.Select(x => new App(x, null, null)).ToArray();



      stopWatch.Stop();
      // Get the elapsed time as a TimeSpan value.
      TimeSpan ts = stopWatch.Elapsed;
      string elapsedTime = String.Format("{0:00}:{1:00}:{2:00}.{3:000}",
            ts.Hours, ts.Minutes, ts.Seconds,
            ts.Milliseconds);
      Console.WriteLine("RunTime " + elapsedTime + " for " + allFiles.Length + " files!");
      return appList;
    }

    /*
       ____                          _    _      _                     
      / __ \                        | |  | |    | |                    
     | |  | |_   _  ___ _ __ _   _  | |__| | ___| |_ __   ___ _ __ ___ 
     | |  | | | | |/ _ \ '__| | | | |  __  |/ _ \ | '_ \ / _ \ '__/ __|
     | |__| | |_| |  __/ |  | |_| | | |  | |  __/ | |_) |  __/ |  \__ \
      \___\_\\__,_|\___|_|   \__, | |_|  |_|\___|_| .__/ \___|_|  |___/
                              __/ |               | |                  
                             |___/                |_|                  
    */
    private static App[] GetShortcutTargetExecutables(string[] shortcutFileLinks)
    {
      List<App> executableFiles = new List<App>();
      WshShell shell = new WshShell();
      foreach (string shortcutFileLink in shortcutFileLinks)
      {
        IWshShortcut shortcut = (IWshShortcut)shell.CreateShortcut(shortcutFileLink);
        string targetFile = shortcut.TargetPath;
        string[] preName = shortcutFileLink.Replace(".exe", "").Replace(".lnk", "").Split('\\');
        string name = preName[preName.Length - 1];
        if (targetFile != null)
        {
          executableFiles.Add(new App(targetFile, name, null));
        }
      }
      return executableFiles.ToArray();
    }

    // Get all files in a directory and its subdirectories that match a pattern. Skip files that are locked.
    private static List<string> GetFiles(string path, string pattern)
    {
      List<string> files = new List<string>();
      try
      {
        files.AddRange(Directory.GetFiles(path, pattern));
      }
      catch (UnauthorizedAccessException) { }
      catch (DirectoryNotFoundException) { }
      try
      {
        foreach (string directory in Directory.GetDirectories(path))
        {
          try
          {
            files.AddRange(GetFiles(directory, pattern));
          }
          catch (UnauthorizedAccessException) { }
          catch (DirectoryNotFoundException) { }
        }
      }
      catch (UnauthorizedAccessException) { }
      catch (DirectoryNotFoundException) { }
      return files;
    }
    // query the icon of an executable and return it as a base64 string
    private static App GetIconBase64(App app)
    {
      Icon icon = Icon.ExtractAssociatedIcon(app.executable);
      if (icon != null)
      {
        using (MemoryStream ms = new MemoryStream())
        {
          icon.ToBitmap().Save(ms, System.Drawing.Imaging.ImageFormat.Png);
          app.icon = Convert.ToBase64String(ms.ToArray());
          return app;
        }
      }
      return null;
    }

    private class App
    {
      public string executable;
      public string name;
      public string icon;

      public App(string executable, string name, string icon)
      {
        this.executable = executable;
        this.name = name;
        this.icon = icon;
      }

    }

    class AppComparer : EqualityComparer<App>
    {
      public override bool Equals(App x, App y)
      {
        return x.executable.Equals(y.executable);
      }

      public override int GetHashCode(App obj)
      {
        return 0; //Hacky yeah!
      }
    }
  }

}
