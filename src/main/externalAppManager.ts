import { shell, app } from 'electron';
import getAllInstalledSoftware from 'fetch-installed-software';
import fse from 'fs-extra';
import { readAppInfo } from 'binary-vdf';
import * as VDF from '@node-steam/vdf';
import util from 'util';
import os from 'os';
import { exec } from 'node:child_process';
import fs from 'fs';
import { create, insertBatch, Lyra, insert } from '@lyrasearch/lyra';

export class externalAppManager {
  private static appData: Array<externalApp> = [];
  private static appDataRelevant: Array<externalApp> = [];
  private static appDataCustomApps: Array<externalApp> = [];
  private static appDB: Lyra<{
    executable: 'string';
    name: 'string';
    icon: 'string';
  }>;

  public static async getSearchDatabase() {
    if (this.appDB === undefined) {
      this.appDB = create({
        schema: {
          executable: 'string',
          name: 'string',
          icon: 'string',
        },
      });
      if (this.appData.length === 0) {
        console.log('Querying apps...');
        this.queryAllExternalApps();
        console.log('Done querying apps: ' + this.appData.length);
      }
      await insertBatch(
        this.appDB,
        this.appData.map((x) => x.toJSON())
      );
    }
    return this.appDB;
  }

  public static async getRelevantApps() {
    if (this.appDataRelevant.length === 0) {
      await this.queryRelevantApps();
    }
    return this.appDataRelevant;
  }

  public static async queryRelevantApps(): Promise<externalApp[]> {
    // If data is already present, temporarily use that data, while the new data is being queried.
    if (fs.existsSync(app.getPath('userData') + '\\appDataRelevant.json')) {
      this.appDataRelevant = JSON.parse(
        fs.readFileSync(app.getPath('userData') + '\\appDataRelevant.json', 'utf8')
      ).map(
        (value: { executable: string; name: string; icon: string }) =>
          new externalApp(value.executable, value.name, value.icon)
      );
    }
    console.time('TotallyRelevant');
    let total: Array<string> = [];

    const uninstall = await externalAppManager.queryUninstallApps();
    const running = await externalAppManager.queryRunningApps();

    uninstall.forEach((value) => total.push(value));
    running.forEach((value) => total.push(value));

    total = total.map((value) => {
      return value.replace(/(\\|\\\\|\\\/)/g, '\\');
    });

    // unique
    total = total.filter((value, index, self) => self.indexOf(value) === index);
    total = total.filter((value) => fs.existsSync(value) && !value.includes('['));

    // Get the name via the executable path
    const nameArray = await this.getApplicationNameFromExe(total);

    let finalData: Array<externalApp> = [];

    for (let i = 0; i < total.length; i++) {
      if (nameArray[i] === undefined || nameArray[i] === '') {
        continue;
      }
      const executable = total[i];
      const name = nameArray[i];
      const icon = undefined;
      finalData.push(new externalApp(executable, name, icon));
    }

    const startMenu = await externalAppManager.queryStartMenuLinkedApps();
    startMenu.forEach(
      (value) =>
        // if the executable is already in the list, replace it with the new one.
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );
    const desktop = await externalAppManager.queryDesktopApps();
    desktop.forEach(
      (value) =>
        // if the executable is already in the list, replace it with the new one.
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );

    //The Epic and Steam games often have unreadable names, so we need to query them after the other apps. This however means they won't have a version number.
    const epic = await externalAppManager.queryEpicGames();
    const steam = await externalAppManager.querySteamGames();
    epic.forEach(
      (value) =>
        // if the executable is already in the list, replace it with the new one.
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );
    steam.forEach(
      (value) =>
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );

    // Filter out any updaters or similar
    finalData = finalData.filter((x) => {
      if (x == undefined) {
        return false;
      }
      const lx = x.executable.toLowerCase().replace(/(-|_)/g, '');
      if (
        !lx.endsWith('.exe') ||
        lx.includes('setup') ||
        lx.includes('install') ||
        lx.includes('repair') ||
        lx.includes('update') ||
        lx.includes('upgrade') ||
        lx.includes('unin') ||
        lx.includes('helper') ||
        lx.includes('verif') ||
        lx.includes('bug') ||
        lx.includes('crash')
      ) {
        return false;
      }
      return true;
    });

    const customApps = await externalAppManager.queryCustomApps();
    customApps.forEach(
      (value) =>
        // if the executable is already in the list, replace it with the new one.
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );

    const iconPromises: Array<Promise<string | undefined>> = [];
    finalData.forEach((value) => {
      iconPromises.push(
        new Promise<string | undefined>((resolve) => {
          app
            .getFileIcon(value.executable, { size: 'large' })
            .then((icon) => {
              resolve(icon.toDataURL());
            })
            .catch(() => {
              resolve('');
            });
        })
      );
    });

    const icons = await Promise.all(iconPromises);
    for (let i = 0; i < finalData.length; i++) {
      finalData[i].setIcon(icons[i]);
    }

    const appData = finalData.filter((value) => value.icon !== '' && value.name !== '');

    fs.writeFileSync(app.getPath('userData') + '\\appDataRelevant.json', JSON.stringify(appData));
    console.timeEnd('TotallyRelevant');
    this.appDataRelevant = appData;
    return appData;
  }

  public static async queryAllExternalApps(): Promise<externalApp[]> {
    // If data is already present, temporarily use that data, while the new data is being queried.
    if (fs.existsSync(app.getPath('userData') + '\\appData.json')) {
      this.appData = JSON.parse(
        fs.readFileSync(app.getPath('userData') + '\\appData.json', 'utf8')
      ).map(
        (value: { executable: string; name: string; icon: string }) =>
          new externalApp(value.executable, value.name, value.icon)
      );
    }
    console.time('Total');
    let total: Array<string> = [];

    const uninstall = await externalAppManager.queryUninstallApps();
    const running = await externalAppManager.queryRunningApps();
    const programFiles = await externalAppManager.queryProgramFilesApps();

    uninstall.forEach((value) => total.push(value));
    running.forEach((value) => total.push(value));
    programFiles.forEach((value) => total.push(value));

    total = total.map((value) => {
      return value.replace(/(\\|\\\\|\\\/)/g, '\\');
    });

    // unique
    total = total.filter((value, index, self) => self.indexOf(value) === index);
    total = total.filter((value) => fs.existsSync(value) && !value.includes('['));

    // Get the name via the executable path
    const nameArray = await this.getApplicationNameFromExe(total);

    let finalData: Array<externalApp> = [];

    for (let i = 0; i < total.length; i++) {
      if (nameArray[i] === undefined || nameArray[i] === '') {
        continue;
      }
      const executable = total[i];
      const name = nameArray[i];
      const icon = undefined;
      finalData.push(new externalApp(executable, name, icon));
    }

    const startMenu = await externalAppManager.queryStartMenuLinkedApps();
    startMenu.forEach(
      (value) =>
        // if the executable is already in the list, replace it with the new one.
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );
    const desktop = await externalAppManager.queryDesktopApps();
    desktop.forEach(
      (value) =>
        // if the executable is already in the list, replace it with the new one.
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );

    //The Epic and Steam games often have unreadable names, so we need to query them after the other apps. This however means they won't have a version number.
    const epic = await externalAppManager.queryEpicGames();
    const steam = await externalAppManager.querySteamGames();
    epic.forEach(
      (value) =>
        // if the executable is already in the list, replace it with the new one.
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );
    steam.forEach(
      (value) =>
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );

    // Filter out any updaters or similar
    finalData = finalData.filter((x) => {
      if (x == undefined) {
        return false;
      }
      const lx = x.executable.toLowerCase().replace(/(-|_)/g, '');
      if (
        !lx.endsWith('.exe') ||
        lx.includes('setup') ||
        lx.includes('install') ||
        lx.includes('repair') ||
        lx.includes('update') ||
        lx.includes('upgrade') ||
        lx.includes('unin') ||
        lx.includes('helper') ||
        lx.includes('verif') ||
        lx.includes('bug') ||
        lx.includes('crash')
      ) {
        return false;
      }
      return true;
    });

    const customApps = await externalAppManager.queryCustomApps();
    customApps.forEach(
      (value) =>
        // if the executable is already in the list, replace it with the new one.
        finalData.some((value2, index) => {
          if (value2.executable === value.executable) {
            finalData[index].setExecutable(value.executable);
            finalData[index].setName(value.name);
            return true;
          }
          return false;
        }) || finalData.push(new externalApp(value.executable, value.name, undefined))
    );

    const iconPromises: Array<Promise<string | undefined>> = [];
    finalData.forEach((value) => {
      iconPromises.push(
        new Promise<string | undefined>((resolve) => {
          app
            .getFileIcon(value.executable, { size: 'large' })
            .then((icon) => {
              resolve(icon.toDataURL());
            })
            .catch(() => {
              resolve('');
            });
        })
      );
    });

    const icons = await Promise.all(iconPromises);
    for (let i = 0; i < finalData.length; i++) {
      finalData[i].setIcon(icons[i]);
    }

    const appData = finalData.filter((value) => value.icon !== '' && value.name !== '');

    console.timeEnd('Total');
    this.appData = appData;
    // Overwrite the old SearchDatabase with the new one.
    this.appDB = create({
      schema: {
        executable: 'string',
        name: 'string',
        icon: 'string',
      },
    });
    await insertBatch(
      this.appDB,
      this.appData.map((x) => x.toJSON())
    );
    this.saveAppDataToDisk();
    return appData;
  }

  public static async addCustomApp(executable: string) {
    console.log('Adding app: ' + executable);
    // First make sure the file exists and has not been added yet.
    if (
      fs.existsSync(executable) &&
      !this.appData.some((value) => value.executable === executable)
    ) {
      // Get the name & icon via the executable path
      const name = await this.getApplicationNameFromExe([executable], true);
      const icon = await this.getApplicationIconFromExe([executable]);
      const app = new externalApp(executable, name[0], icon[0]);
      this.appData.push(app);
      this.appDataCustomApps.push(app);
      this.saveAppDataToDisk();
      insert(this.appDB, app.toJSON());
      return app;
    }
    return;
  }

  public static async addMultipleCustomApps(executable: Array<string>) {
    // First make sure the file exists and has not been added yet.
    for (let i = 0; i < executable.length; i++) {
      if (
        fs.existsSync(executable[i]) &&
        !this.appData.some((value) => value.executable === executable[i])
      ) {
        // Get the name & icon via the executable path
        const name = await this.getApplicationNameFromExe([executable[i]], true);
        const icon = await this.getApplicationIconFromExe([executable[i]]);
        this.appData.push(new externalApp(executable[i], name[i], icon[i]));
        insert(this.appDB, new externalApp(executable[i], name[i], icon[i]).toJSON());
      }
    }
    this.saveAppDataToDisk();
  }

  /*
 █████                █████  ███               ███      █████                      ████                                              ███                  
░░███                ░░███  ░░░               ░░░      ░░███                      ░░███                                             ░░░                   
 ░███  ████████    ███████  ████  █████ █████ ████   ███████  █████ ████  ██████   ░███      ████████ █████ ████  ██████  ████████  ████   ██████   █████ 
 ░███ ░░███░░███  ███░░███ ░░███ ░░███ ░░███ ░░███  ███░░███ ░░███ ░███  ░░░░░███  ░███     ███░░███ ░░███ ░███  ███░░███░░███░░███░░███  ███░░███ ███░░  
 ░███  ░███ ░███ ░███ ░███  ░███  ░███  ░███  ░███ ░███ ░███  ░███ ░███   ███████  ░███    ░███ ░███  ░███ ░███ ░███████  ░███ ░░░  ░███ ░███████ ░░█████ 
 ░███  ░███ ░███ ░███ ░███  ░███  ░░███ ███   ░███ ░███ ░███  ░███ ░███  ███░░███  ░███    ░███ ░███  ░███ ░███ ░███░░░   ░███      ░███ ░███░░░   ░░░░███
 █████ ████ █████░░████████ █████  ░░█████    █████░░████████ ░░████████░░████████ █████   ░░███████  ░░████████░░██████  █████     █████░░██████  ██████ 
░░░░░ ░░░░ ░░░░░  ░░░░░░░░ ░░░░░    ░░░░░    ░░░░░  ░░░░░░░░   ░░░░░░░░  ░░░░░░░░ ░░░░░     ░░░░░███   ░░░░░░░░  ░░░░░░  ░░░░░     ░░░░░  ░░░░░░  ░░░░░░  
                                                                                                ░███                                                      
                                                                                                █████                                                     
                                                                                               ░░░░░                                                      
  */

  // Get Apps from the uninstall registry
  private static async queryUninstallApps() {
    const data = await getAllInstalledSoftware.getAllInstalledSoftware();
    const collectedApps = (
      data as Array<{ DisplayName: string; DisplayIcon: string; InstallLocation: string }>
    )
      .filter(
        (x) =>
          x.DisplayName !== undefined &&
          x.DisplayIcon !== undefined &&
          x.DisplayIcon !== '' &&
          x.InstallLocation !== undefined &&
          x.InstallLocation !== '' &&
          (x.DisplayIcon as string).includes('.exe') &&
          !(x.DisplayIcon as string).includes('%SYSTEMROOT%') &&
          !(x.DisplayName as string).includes('Win') &&
          !(x.DisplayName as string).includes('Microsoft') &&
          !(x.DisplayName as string).toLowerCase().includes('uninstall') &&
          (!(x.InstallLocation as string)?.toLowerCase().includes('uninstall') ?? true) &&
          (!(x.DisplayIcon as string)?.toLowerCase().includes('uninstall') ?? true)
      )
      .map((x) => {
        return (x.DisplayIcon.split('.exe')[0] + '.exe').replace(/"/g, '');
        // return { name: x.DisplayName, path: x.InstallLocation, icon: x.DisplayIcon };
      });
    return collectedApps;
  }

  // Get currently running apps.
  private static async queryRunningApps() {
    //TODO: Find a way to promisify this without "Access is denied" errors. The callback is difficult to handle as I can't await it.
    const collectedApps: Array<string> = await new Promise((resolve) => {
      exec(
        'Get-Process | Where-Object {$_.MainWindowTitle -ne ""} | Select-Object -Expand MainModule | Select-Object -Property FileName',
        { shell: 'powershell.exe' },
        (_err, stout) => {
          resolve(
            stout
              .split('\n')
              .slice(3, -1)
              .map((x) => x.trim())
              .filter((x) => x !== '')
          );
        }
      );
    });
    return collectedApps;
  }

  // Get Apps based on the start menu links.
  private static async queryStartMenuLinkedApps() {
    const execProm = util.promisify(exec);
    let collectedApps: Array<{ executable: string; name: string }> = [];
    // Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders
    // Common Start Menu
    const startMenuPath = await new Promise((resolve) => {
      exec(
        `Get-ItemProperty "HKLM:\\SOFTWARE${
          os.platform() === 'win32' ? '\\WOW6432Node' : ''
        }\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders" | Select-Object -ExpandProperty "Common Start Menu"`,
        { shell: 'powershell.exe' },
        (_err, stout) => {
          resolve(stout.trim());
        }
      );
    });
    const { stdout } = await execProm(`where /r "${startMenuPath}" *.lnk`);
    stdout.split(/(\r\n|\n|\r)/gm).forEach((x) => {
      try {
        collectedApps.push({
          executable: shell.readShortcutLink(x).target,
          name: x.split('\\').slice(-1)[0].split('.lnk')[0],
        });
      } catch (error) {
        return;
      }
    });
    {
      const startMenuPath2 = await new Promise((resolve) => {
        exec(
          `Get-ItemProperty "HKLM:\\SOFTWARE${
            os.platform() === 'win32' ? '\\WOW6432Node' : ''
          }\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders\\Backup" | Select-Object -ExpandProperty "Programs"`,
          { shell: 'powershell.exe' },
          (_err, stout) => {
            resolve(stout.trim());
          }
        );
      });
      const { stdout } = await execProm(
        `where /r "${(startMenuPath2 as string).replace(
          '%USERPROFILE%',
          app.getPath('home')
        )}" *.lnk`
      );
      stdout.split(/(\r\n|\n|\r)/gm).forEach((x) => {
        try {
          collectedApps.push({
            executable: shell.readShortcutLink(x).target,
            name: x.split('\\').slice(-1)[0].split('.lnk')[0],
          });
        } catch (error) {
          return;
        }
      });
    }
    // filter out duplicates
    collectedApps = collectedApps.filter((value, index, self) => self.indexOf(value) === index);
    // Filter our unlikely results. (.urls, installers, uninstallers, etc.)
    collectedApps = collectedApps.filter(
      (x) =>
        x !== undefined &&
        x.executable.endsWith('.exe') &&
        !x.executable.includes('uninstall') &&
        !x.executable.includes('setup') &&
        !x.executable.includes('install') &&
        !x.executable.includes('repair') &&
        !x.executable.includes('update') &&
        !x.executable.includes('upgrade') &&
        !x.executable.includes('unins001') &&
        !x.executable.includes('unins000')
    );
    return collectedApps;
  }

  // Get Apps from the Steam Launcher
  private static async querySteamGames() {
    //TODO check if this path is always the same, regardless of language or install location
    //Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Valve\Steam
    const steamPath = await new Promise((resolve) => {
      exec(
        `Get-ItemProperty HKLM:\\SOFTWARE${
          os.platform() === 'win32' ? '\\WOW6432Node' : ''
        }\\Valve\\Steam | Select-Object -ExpandProperty InstallPath`,
        { shell: 'powershell.exe' },
        (_err, stout) => {
          resolve(stout.trim());
        }
      );
    });
    if (!steamPath) return [];
    const inBuffer = await fse.createReadStream(steamPath + '\\appcache\\appinfo.vdf');
    const appInfo = await readAppInfo(inBuffer);
    const collectedApps: Array<{ executable: string; name: string }> = await new Promise(
      (resolve) => {
        const collectedSteamGames: Array<{ executable: string; name: string }> = [];
        fs.readFile(steamPath + '\\steamapps\\libraryfolders.vdf', 'utf8', (err, data) => {
          try {
            if (err) return;
            const parsed = VDF.parse(data);
            // console.log(parsed);
            for (const key in parsed.libraryfolders) {
              for (const app in parsed.libraryfolders[key].apps) {
                const gameData = appInfo.filter(
                  (x: { id: number }) => x.id === Number.parseInt(app)
                )[0];
                if (gameData.entries.common.name === 'Steamworks Common Redistributables') continue;
                // console.log(gameData);
                // console.log(gameData.entries.common.name);
                const firstLaunchEntry = Object.keys(gameData.entries.config.launch)[0];
                collectedSteamGames.push({
                  executable: (
                    parsed.libraryfolders[key].path +
                    '\\steamapps\\common\\' +
                    gameData.entries.config.installdir +
                    '\\' +
                    gameData.entries.config.launch[firstLaunchEntry]?.executable
                  ).replace(/(\\\/|\\\\)/g, '\\'),
                  name: gameData.entries.common.name,
                });
              }
            }
            resolve(collectedSteamGames);
          } catch (error) {
            console.log(error);
          }
        });
      }
    );
    return collectedApps;
  }

  // Get Apps from the Epic Games Launcher
  private static async queryEpicGames() {
    //TODO check if this path is always the same, regardless of language or install location
    //Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Epic Games\EpicGamesLauncher
    const epicPath = await new Promise<string>((resolve) => {
      exec(
        `Get-ItemProperty "HKLM:\\SOFTWARE${
          os.platform() === 'win32' ? '\\WOW6432Node' : ''
        }\\Epic Games\\EpicGamesLauncher" | Select-Object -ExpandProperty AppDataPath`,
        { shell: 'powershell.exe' },
        (_err, stout) => {
          resolve(stout.trim());
        }
      );
    });
    if (!epicPath) return [];
    const collectedApps: Array<{ executable: string; name: string }> = await new Promise(
      (resolve) => {
        const collectedEpicGames: Array<{ executable: string; name: string }> = [];
        fs.readdir(epicPath + '\\Manifests', async (err, data) => {
          if (err) return;
          for (const file of data) {
            await new Promise<void>((resolveInner) => {
              fs.readFile(epicPath + `\\Manifests\\${file}`, 'utf8', (err, data) => {
                if (err) {
                  resolveInner();
                  return;
                }
                const parsed = JSON.parse(data);
                if (fs.existsSync(parsed.InstallLocation + '\\' + parsed.LaunchExecutable)) {
                  collectedEpicGames.push({
                    executable: (parsed.InstallLocation + '\\' + parsed.LaunchExecutable).replace(
                      /(\\\/|\\\\)/g,
                      '\\'
                    ),
                    name: parsed.DisplayName,
                  });
                }
                resolveInner();
              });
            });
          }
          resolve(collectedEpicGames);
        });
      }
    );
    return collectedApps.filter((x) => x.executable.endsWith('.exe'));
  }

  // Get Apps from the Program files folder
  private static async queryProgramFilesApps() {
    // Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion
    // ProgramFilesDir
    // ProgramW6432Dir
    const programFilesPath = await new Promise<string>((resolve) => {
      exec(
        `Get-ItemProperty "HKLM:\\SOFTWARE${
          os.platform() === 'win32' ? '\\WOW6432Node' : ''
        }\\Microsoft\\Windows\\CurrentVersion" | Select-Object -ExpandProperty "ProgramFilesDir"`,
        { shell: 'powershell.exe' },
        (_err, stout) => {
          resolve(stout.trim());
        }
      );
    });
    const programFiles6432Path = await new Promise<string>((resolve) => {
      exec(
        `Get-ItemProperty "HKLM:\\SOFTWARE${
          os.platform() === 'win32' ? '\\WOW6432Node' : ''
        }\\Microsoft\\Windows\\CurrentVersion" | Select-Object -ExpandProperty "ProgramW6432Dir"`,
        { shell: 'powershell.exe' },
        (_err, stout) => {
          resolve(stout.trim());
        }
      );
    });
    const execProm = util.promisify(exec);
    let collectedApps: Array<string> = [];
    //TODO check if this path is always the same, regardless of language
    const folders = [programFilesPath, programFiles6432Path];
    for (const folder of folders) {
      const { stdout } = await execProm(`where /r "${folder}" *.exe`);
      stdout.split(/(\r\n|\n|\r)/gm).forEach((x) => {
        try {
          collectedApps.push(x);
        } catch (error) {
          return;
        }
      });
    }
    // Filter our unlikely results. (.urls, installers, uninstallers, etc.)
    collectedApps = collectedApps.filter((x) => {
      if (x == undefined) {
        return false;
      }
      const lx = x.toLowerCase().replace(/(-|_)/g, '');
      if (
        !lx.endsWith('.exe') ||
        lx.includes('uninstall') ||
        lx.includes('setup') ||
        lx.includes('install') ||
        lx.includes('repair') ||
        lx.includes('update') ||
        lx.includes('upgrade') ||
        lx.includes('unins001') ||
        lx.includes('unins000') ||
        lx.includes('helper') ||
        lx.includes('crash') ||
        lx.includes('update')
      ) {
        return false;
      }
      return true;
    });
    return collectedApps;
  }

  // Get Apps from the Public & User Desktops
  private static async queryDesktopApps() {
    const execProm = util.promisify(exec);
    let collectedApps: Array<{ executable: string; name: string }> = [];
    {
      const { stdout } = await execProm(`where /r "${app.getPath('desktop')}" *.lnk`);
      stdout.split(/(\r\n|\n|\r)/gm).forEach((x) => {
        try {
          collectedApps.push({
            executable: shell.readShortcutLink(x).target,
            name: x.split('\\').slice(-1)[0].split('.lnk')[0],
          });
        } catch (error) {
          return;
        }
      });
    }
    {
      //TODO check if this path is always the same, regardless of language
      // Computer\HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders
      // Common Desktop
      const publicDesktopPath = await new Promise<string>((resolve) => {
        exec(
          `Get-ItemProperty "HKLM:\\SOFTWARE${
            os.platform() === 'win32' ? '\\WOW6432Node' : ''
          }\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders" | Select-Object -ExpandProperty "Common Desktop"`,
          { shell: 'powershell.exe' },
          (_err, stout) => {
            resolve(stout.trim());
          }
        );
      });
      const { stdout } = await execProm(`where /r "${publicDesktopPath}" *.lnk`);
      stdout.split(/(\r\n|\n|\r)/gm).forEach((x) => {
        try {
          collectedApps.push({
            executable: shell.readShortcutLink(x).target,
            name: x.split('\\').slice(-1)[0].split('.lnk')[0],
          });
        } catch (error) {
          return;
        }
      });
    }
    // Filter our unlikely results. (.urls, installers, uninstallers, etc.)
    collectedApps = collectedApps.filter(
      (x) =>
        x !== undefined &&
        x.executable.endsWith('.exe') &&
        !x.executable.includes('uninstall') &&
        !x.executable.includes('setup') &&
        !x.executable.includes('install') &&
        !x.executable.includes('repair') &&
        !x.executable.includes('update') &&
        !x.executable.includes('upgrade') &&
        !x.executable.includes('unins001') &&
        !x.executable.includes('unins000')
    );
    return collectedApps;
  }

  private static queryCustomApps() {
    if (fs.existsSync(app.getPath('userData') + '\\appPathsCustom.json')) {
      this.appDataCustomApps = JSON.parse(
        fs.readFileSync(app.getPath('userData') + '\\appPathsCustom.json', 'utf8')
      );
      this.appDataCustomApps = this.appDataCustomApps.filter((x) => fs.existsSync(x.executable));
    }
    return this.appDataCustomApps;
  }

  private static async getApplicationNameFromExe(
    inputPaths: Array<string>,
    checkFileForName = false
  ) {
    const originalPaths = inputPaths.join('","');
    // split the paths into chunks of roughly 30000 characters but definitely at the delimiter ",", so that the command doesn't exceed the maximum length of 32000 characters or similar.
    const paths = originalPaths.match(/.{1,30000}(?=","|$)/g) ?? [];
    const namePromises: Array<Promise<string>> = [];
    let names: Array<string> = [];
    for (const path of paths) {
      namePromises.push(
        new Promise<string>((resolve) => {
          //
          exec(
            // (get-childitem "C:\Users\ElitoGame\AppData\Local\Programs\Microsoft VS Code\Code.exe", "C:\Users\ElitoGame\AppData\Local\Programs\signal-desktop\Signal.exe" | % {$_.VersionInfo} | Where-Object {$_.ProductName -ne "" -and $_.ProductVersion -ne ""} | Select ProductName, ProductVersion | ForEach-Object { '"{0}":"{1}"' -f $_.ProductName, $_.ProductVersion }) -join ','
            //  | Where-Object {$_.ProductName -and $_.ProductVersion}
            `(get-childitem ${('"' + path + '"').replace(
              '"",',
              ''
            )} | % {$_.VersionInfo} | Select ProductName, FileDescription, FileName | ForEach-Object { '{{"productName":"{0}", "fileDescription":"{1}", "fileName":"{2}"}}' -f $_.ProductName, $_.FileDescription, $_.FileName }) -join ','`,
            { shell: 'powershell.exe' },
            (_err, stout) => {
              try {
                resolve(stout.trim());
              } catch (_error) {
                resolve('""');
              }
            }
          );
        })
      );
    }
    names = await Promise.all(namePromises);
    let nameArray = JSON.parse(`[${names.join(',').replace(/\\/g, '\\\\')}]`);
    nameArray = nameArray.map(
      (x: { productName: string; fileDescription: string; fileName: string }) => {
        let name = x.productName;
        if (name === 'Microsoft Office') {
          name = x.fileDescription;
        }
        if (checkFileForName && name === '') {
          console.log(x);
          name = x.fileName.split('.')[0].split('\\').slice(-1)[0];
        }
        return name;
      }
    );
    return nameArray;
  }

  private static async getApplicationIconFromExe(inputPaths: Array<string>) {
    const iconPromises: Array<Promise<string | undefined>> = [];
    inputPaths.forEach((value) => {
      iconPromises.push(
        new Promise<string | undefined>((resolve) => {
          app
            .getFileIcon(value, { size: 'large' })
            .then((icon) => {
              resolve(icon.toDataURL());
            })
            .catch(() => {
              resolve('');
            });
        })
      );
    });

    const icons = await Promise.all(iconPromises);
    return icons;
  }

  private static saveAppDataToDisk() {
    fs.writeFileSync(app.getPath('userData') + '\\appData.json', JSON.stringify(this.appData));
    fs.writeFileSync(
      app.getPath('userData') + '\\appPathsCustom.json',
      JSON.stringify(this.appDataCustomApps)
    );
  }
}

export class externalApp {
  public executable: string;
  public name: string;
  public icon?: string;

  public constructor(executable: string, name: string, icon?: string) {
    this.executable = executable;
    this.name = name;
    this.icon = icon;
  }

  public setExecutable(executable: string) {
    this.executable = executable;
  }

  public setName(name: string) {
    this.name = name;
  }

  public setIcon(icon?: string) {
    this.icon = icon;
  }

  public toJSON() {
    return {
      executable: this.executable,
      name: this.name,
      icon: this.icon ?? '',
    };
  }
}
