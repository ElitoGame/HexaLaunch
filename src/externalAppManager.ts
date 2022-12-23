import { fs, os } from '@tauri-apps/api';
import { create, insert, insertBatch, Lyra, search, SearchResult } from '@lyrasearch/lyra';
import { Command } from '@tauri-apps/api/shell';
import { queryIconOfExe, queryNamesOfExes, queryOtherApps, queryRelevantApps } from './queryApps';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { setRelevantApps } from './settings';
import { BaseDirectory } from '@tauri-apps/api/fs';

export class externalAppManager {
  private static appData: Array<externalApp> = [];
  private static appDataRelevant: Array<externalApp> = [];
  private static appDataCustomApps: Array<externalApp> = [];
  private static appDB: Lyra<{
    executable: 'string';
    name: 'string';
    icon: 'string';
    type: 'string';
  }>;
  private static fileSystemDB: Lyra<{
    executable: 'string';
    name: 'string';
    icon: 'string';
    type: 'string';
  }>;
  private static lastFileQuery = '';
  private static lastFolderResult: SearchResult<{
    executable: 'string';
    name: 'string';
    icon: 'string';
    type: 'string';
  }>;

  /**
   * Get the search database and if no data is present, start a query for all apps
   * @returns A promise that resolves to the Lyra search database
   */
  public static async getSearchDatabase() {
    if (this.appDB === undefined) {
      this.appDB = create({
        schema: {
          executable: 'string',
          name: 'string',
          icon: 'string',
          type: 'string',
        },
      });
      if (this.appData.length === 0) {
        console.log('Querying apps...');
        // this.queryRelevantApps();
        // this.queryOtherApps();
        const data = await fs.readTextFile('appData.json', { dir: BaseDirectory.AppData });
        const parsed = JSON.parse(data);
        this.appData = parsed.map(
          (x) => new externalApp(x.executable, x.name, x.icon, 'Application')
        );

        const relevantData = await fs.readTextFile('appDataRelevant.json', {
          dir: BaseDirectory.AppData,
        });
        const parsedRelevant = JSON.parse(relevantData);
        this.appDataRelevant = parsedRelevant.map(
          (x) => new externalApp(x.executable, x.name, x.icon, 'Application')
        );
        setRelevantApps(this.appDataRelevant);
        console.log('Querying apps finished', this.appDataRelevant);
      }
      await insertBatch(
        this.appDB,
        this.appData.map((x) => {
          if (!x.icon.startsWith('data:image/png;base64,')) {
            x.icon = convertFileSrc(x.icon);
          }
          return x.toJSONwithTypes();
        })
      );
      await insertBatch(
        this.appDB,
        this.appDataRelevant.map((x) => {
          if (!x.icon.startsWith('data:image/png;base64,')) {
            x.icon = convertFileSrc(x.icon);
          }
          return x.toJSONwithTypes();
        })
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

  public static async getAllApps() {
    if (this.appDataRelevant.length === 0) {
      await this.queryRelevantApps();
    }
    if (this.appData.length === 0) {
      await this.queryOtherApps();
    }
    return this.appDataRelevant.concat(this.appData);
  }

  public static async getIconOfActionExe(executable: string): Promise<string> {
    console.log('getIconOfActionExe', executable);
    // check if the executable is in the appData or appDataRelevant array
    const app = this.appData.find(
      (x) => x.executable.replace(/\\+/g, '/') === executable.replace(/\\+/g, '/')
    );
    if (app !== undefined) {
      return app.icon;
    }
    const appRelevant = this.appDataRelevant.find(
      (x) => x.executable.replace(/\\+/g, '/') === executable.replace(/\\+/g, '/')
    );
    if (appRelevant !== undefined) {
      return appRelevant.icon;
    }
    // if not, query the icon
    const icon = ''; //queryIconOfExe(executable);
    return icon;
  }

  /**
   * Query all relevant apps on the system.
   * Relevant apps are apps that are relevant for quick access to the user and were queried from
   *  - the uninstall registry
   *  - the start menu (public and user)
   *  - the desktop (public and user)
   *  - the epic games launcher
   *  - the steam library
   *  - the currently running processes
   *  - custom apps (apps that the user added manually)
   *
   * @returns A promise that resolves to an array of externalApp objects
   */
  public static async queryRelevantApps(): Promise<externalApp[]> {
    let appData: Array<externalApp> = [];

    const start = Date.now();
    console.log('searching Apps');
    const command = new Command('queryRelevantApps', [
      JSON.parse(JSON.stringify(queryRelevantApps)),
    ]);
    command.on('close', (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal} in ${
          Date.now() - start
        }ms for appcount: `,
        appData.length
      );
    });
    command.on('error', (error) => console.error(`command error: "${error}"`));
    await command.spawn();
    const relevantPromise = new Promise<externalApp[]>((resolve) => {
      command.stdout.on('data', (line) => {
        resolve(
          JSON.parse(line).map(
            (x: { executable: string; name: string; icon: string }) =>
              new externalApp(
                x.executable,
                x.name.replaceAll(/[\r\n]*/g, '').trim(),
                'data:image/png;base64,' + x.icon
              )
          )
        );
      });
    });
    // command.stderr.on("data", (line) =>
    // 	console.log(`command stderr: "${line}"`)
    // );
    const epicPromise = this.queryEpicGames();
    const steamPromise = this.querySteamGames();

    const appLists = await Promise.all([relevantPromise, epicPromise, steamPromise]);

    appLists.forEach((x) => {
      if (x) {
        appData.push(...x);
      }
      console.log(x);
    });

    // add custom apps
    const customApps = JSON.parse(
      (await fs.readTextFile('appPathsCustom.json', {
        dir: fs.BaseDirectory.AppData,
      })) ?? '[]'
    );
    console.log('custom apps: ', customApps);
    customApps.forEach((x: { name: string; executable: string; icon: string }) => {
      appData.push(new externalApp(x.executable, x.name, x.icon));
    });
    appData.sort((a, b) => a.name.localeCompare(b.name));
    // unique
    appData.filter((x, i, arr) => arr.findIndex((y) => y.executable === x.executable) === i);
    fs.writeTextFile('appDataRelevant.json', JSON.stringify(appData), {
      dir: fs.BaseDirectory.AppData,
    });
    this.appDataRelevant = appData;
    // add the local appData to the static appData list and replace duplicates
    this.appData = this.appData
      .filter((x) => !appData.find((y) => y.executable === x.executable))
      .concat(appData);
    insertBatch(
      this.appDB,
      appData.map((x) => {
        if (!x.icon.startsWith('data:image/png;base64,')) {
          x.icon = convertFileSrc(x.icon);
        }
        return x.toJSONwithTypes();
      })
    );
    console.log('Done querying relevant apps: ' + this.appData.length);
    setRelevantApps(this.appDataRelevant);
    return appData;
  }

  /**
   * Query all other apps on the system.
   * Other apps are apps that are queried from the program files folders and may not be relevant for quick access to the user.
   * - Program Files
   * - Program Files (x86)
   * @returns A promise that resolves to an array of externalApp objects
   */
  public static async queryOtherApps(): Promise<externalApp[]> {
    const appData: Array<externalApp> = [];
    const start = Date.now();
    console.log('searching other Apps');
    // setRelevantApps((await window.electronAPI.getRelevantApps()) ?? []);
    const command = new Command('queryRelevantApps', [JSON.parse(JSON.stringify(queryOtherApps))]);
    command.on('close', (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal} in ${
          Date.now() - start
        }ms`
      );
    });
    command.on('error', (error) => console.error(`command error: "${error}"`));
    const relevantPromise = new Promise<externalApp[]>((resolve) => {
      command.stdout.on('data', (line) => {
        const data = JSON.parse(line);
        resolve(data);
        console.log(data);
      });
    });
    command.stderr.on('data', (line) => console.log(`command stderr: "${line}"`));
    console.log('spawned');
    await command.spawn();
    const resolved = await relevantPromise;
    resolved.forEach((x) => {
      if (x && !x.executable.endsWith('[.exe')) {
        appData.push(new externalApp(x.executable, x.name, 'data:image/png;base64,' + x.icon));
      }
    });
    console.log('Starting name resolution');
    const nameArray = await this.getApplicationNameFromExe(appData.map((x) => x.executable));
    console.log(nameArray);
    appData.forEach((x, i) => {
      x.name = nameArray[i];
    });

    appData.filter((x) => x.name !== '').sort((a, b) => a.name.localeCompare(b.name));

    // add the local appData to the static appData list and skip duplicates
    this.appData = this.appData.concat(
      appData.filter((x) => !this.appData.find((y) => y.executable === x.executable))
    );

    insertBatch(
      this.appDB,
      appData.map((x) => x.toJSONwithTypes())
    );
    this.saveAppDataToDisk();
    console.log('Done querying other apps: ' + this.appData.length, this.appData);
    return appData;
  }

  //TODO get the custom Apps in the relevantApps query!
  public static async addCustomApp(executable: string) {
    console.log('Applist (custom): ', this.appDataCustomApps);
    if (this.appDataCustomApps.find((x) => x.executable === executable) === undefined) {
      console.log('Adding app: ' + executable);
      // First make sure the file exists and has not been added yet.
      if (
        (await fs.exists(executable)) &&
        !this.appData.some((value) => value.executable === executable)
      ) {
        // Get the name & icon via the executable path
        const name = await this.getApplicationNameFromExe([executable], true);
        if (fs.exists(executable)) {
          const command = new Command('queryRelevantApps', queryIconOfExe(executable));
          await command.spawn();
          const icon = await new Promise<string>((resolve) => {
            command.stdout.on('data', (line) => {
              resolve(line as string);
            });
          });

          const app = new externalApp(executable, name[0], 'data:image/png;base64,' + icon);
          this.appData.push(app);
          this.appDataCustomApps.push(app);
          this.appDataRelevant.push(app);
          this.saveAppDataToDisk();
          insert(this.appDB, app.toJSONwithTypes());
          return app;
        }
      }
    }
    return;
  }

  // public static async addMultipleCustomApps(executable: Array<string>) {
  // 	// First make sure the file exists and has not been added yet.
  // 	for (let i = 0; i < executable.length; i++) {
  // 		if (
  // 			(await fs.exists(executable[i])) &&
  // 			!this.appData.some((value) => value.executable === executable[i])
  // 		) {
  // 			// Get the name & icon via the executable path
  // 			const name = await this.getApplicationNameFromExe(
  // 				[executable[i]],
  // 				true
  // 			);
  // 			const icon = await this.getApplicationIconFromExe([executable[i]]);
  // 			this.appData.push(new externalApp(executable[i], name[i], icon[i]));
  // 			insert(
  // 				this.appDB,
  // 				new externalApp(executable[i], name[i], icon[i]).toJSONwithTypes()
  // 			);
  // 		}
  // 	}
  // 	this.saveAppDataToDisk();
  // }

  public static async searchFileSystem(query: string, offset: number) {
    query = query.replace(/\/|\\\\/g, '\\');
    let fileFolder = query.slice(0, query.lastIndexOf('\\') + 1);
    if (!fileFolder.endsWith('\\')) {
      fileFolder += '\\';
    }
    const fileName = query.slice(query.lastIndexOf('\\') + 1);
    // check if the folder exists.
    if (!(await fs.exists(fileFolder))) return;
    // New folder, so we need to query the folder.
    if (this.lastFileQuery !== fileFolder) {
      this.lastFileQuery = fileFolder;
      this.fileSystemDB = create({
        schema: {
          name: 'string',
          executable: 'string',
          icon: 'string',
          type: 'string',
        },
      });
      const allFiles: {
        name: string;
        executable: string;
        icon: string;
        type: string;
      }[] = [];
      // const iconPromises: Array<Promise<NativeImage>> = [];
      // (await fs.readDir(fileFolder)).forEach(async (file) => {
      // 	const promise = app.getFileIcon(file.path);
      // 	iconPromises.push(promise);
      // 	const icon = (await promise).toDataURL();
      // 	let type = file.children ? "Folder" : "Application";
      // 	const data = {
      // 		name: file.name,
      // 		executable: file.path,
      // 		icon: icon,
      // 		type: type,
      // 	};
      // 	allFiles.push(data);
      // 	insert(this.fileSystemDB, data);
      // });
      // await Promise.all(iconPromises);
      const result: SearchResult<{
        executable: 'string';
        name: 'string';
        icon: 'string';
        type: 'string';
      }> = {
        elapsed: 0n,
        hits: allFiles.map((x) => {
          return {
            id: x.executable,
            score: 0,
            document: {
              executable: x.executable,
              name: x.name,
              icon: x.icon,
              type: x.type,
            },
          };
        }),
        count: allFiles.length,
      };
      this.lastFolderResult = result;
      return result;
    } else {
      if (fileName === '') {
        // No query, so return all the files.
        return this.lastFolderResult;
      } else {
        const result = search(this.fileSystemDB, {
          term: fileName,
          offset: offset,
          properties: ['name'],
        });
        // console.log(result);
        return result;
      }
    }
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

  private static async queryEpicGames() {
    const cmd = `Get-ItemProperty "HKLM:\\SOFTWARE${
      ['x86', 'x86_64'].includes(await os.arch()) ? '\\WOW6432Node' : ''
    }\\Epic Games\\EpicGamesLauncher" | Select-Object -ExpandProperty AppDataPath`;
    const command = new Command('queryRelevantApps', [cmd]);
    command.on('error', (error) => console.error(`command error: "${error}"`));
    // command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    await command.spawn();

    const epicPath =
      (
        await new Promise<string>((resolve) => {
          command.stdout.on('data', (line) => {
            resolve(line as string);
          });
        })
      ).replaceAll(/[^a-zA-Z0-9() :\\]/g, '') + 'Manifests';
    if (!epicPath) return [];
    let collectedApps: Array<externalApp> = await new Promise(async (resolve) => {
      const collectedEpicGames: Array<externalApp> = [];
      const entries = await fs.readDir(`${epicPath}`);
      for (const file of entries) {
        if (file.name.endsWith('.item')) {
          const data = await fs.readTextFile(`${file.path}`);
          const parsed = JSON.parse(data);
          const executable = (parsed.InstallLocation + '\\' + parsed.LaunchExecutable).replace(
            /(\\\/|\\\\)/g,
            '\\'
          );
          if (fs.exists(executable)) {
            const command = new Command('queryRelevantApps', queryIconOfExe(executable));
            await command.spawn();
            const icon = await new Promise<string>((resolve) => {
              command.stdout.on('data', (line) => {
                resolve(line as string);
              });
            });

            collectedEpicGames.push(
              new externalApp(executable, parsed.DisplayName, 'data:image/png;base64,' + icon)
            );
          }
        }
      }
      resolve(collectedEpicGames);
    });
    collectedApps = collectedApps.filter((x) => x.executable.endsWith('.exe'));
    return collectedApps;
  }

  //TODO: query steam

  private static async querySteamGames() {
    const cmd = `Get-ItemProperty "HKLM:\\SOFTWARE${
      ['x86', 'x86_64'].includes(await os.arch()) ? '\\WOW6432Node' : ''
    }\\Valve\\Steam" | Select-Object -ExpandProperty InstallPath`;
    const command = new Command('queryRelevantApps', [cmd]);
    // command.stderr.on("data", (line) => console.log(`command stderr: "${line}"`));
    await command.spawn();

    const steamPath = (
      await new Promise<string>((resolve) => {
        command.stdout.on('data', (line) => {
          console.log('steam path', line);
          resolve(line as string);
        });
      })
    ).replaceAll(/[^a-zA-Z0-9() :\\]/g, '');

    if (!steamPath) return [];

    const libraryfolders = Object.values(
      this.acf_to_json(
        (await fs.readTextFile(`${steamPath}\\steamapps\\libraryfolders.vdf`)).replace(
          'libraryfolders',
          ''
        )
      )
    ).map((x: any) => x.path);

    // get the acf files from the steamapps folder of each library and parse them to json then get their name and appid
    const collectedSteamGames: Array<externalApp> = await new Promise(async (resolve) => {
      const collectedSteamGames: Array<externalApp> = [];
      for (const library of libraryfolders) {
        const entries = await fs.readDir(`${library}\\steamapps`);
        for (const file of entries) {
          if (file.name.endsWith('.acf')) {
            const data = await fs.readTextFile(`${file.path}`).catch((e) => console.error(e));
            if (data) {
              const parsed = this.acf_to_json(data);
              if (parsed.installdir) {
                // get the icon from the appcache: C:\Program Files (x86)\Steam\appcache\librarycache\{appid}_icon.jpg
                collectedSteamGames.push(
                  new externalApp(
                    `steam://rungameid/${parsed.appid}`,
                    parsed.name,

                    `${steamPath}\\appcache\\librarycache\\${parsed.appid}_icon.jpg`
                  )
                );
              }
            }
          }
        }
      }
      resolve(collectedSteamGames);
    });
    return collectedSteamGames;
  }

  private static acf_to_json(acf_content = '') {
    if (acf_content.length === 0) return;
    return JSON.parse(
      acf_content
        .split('\n')
        .slice(1)
        .map((x, i, arr) => {
          if (x.length === 0) return;
          if (x.trim().includes('\t\t')) {
            return (
              x.trim().replace('\t\t', ':') +
              (['{', '}'].includes(arr[i + 1]?.trim().slice(0, 1)) ? '' : ',')
            );
          }
          return x.split('"').length > 1
            ? x.trim() + ':'
            : x +
                (x.trim() === '{' ||
                !arr[i + 1] ||
                ['{', '}'].includes(arr[i + 1]?.trim().slice(0, 1))
                  ? ''
                  : ',');
        })
        .join('\n')
    );
  }
  private static saveAppDataToDisk() {
    fs.writeTextFile('appData.json', JSON.stringify(this.appData), {
      dir: fs.BaseDirectory.AppData,
    });
    fs.writeTextFile('appPathsCustom.json', JSON.stringify(this.appDataCustomApps), {
      dir: fs.BaseDirectory.AppData,
    });
  }

  private static async getApplicationIconFromExe() {}

  private static async getApplicationNameFromExe(
    inputPaths: Array<string>,
    checkFileForName = false
  ) {
    //[^\p{L}\p{N}\p{S} \\:._-]
    const originalPaths = inputPaths.join('","');
    // split the paths into chunks of roughly 30000 characters but definitely at the delimiter ",", so that the command doesn't exceed the maximum length of 32000 characters or similar.
    const paths = originalPaths.match(/.{1,30000}(?=","|$)/g) ?? [];
    const namePromises: Array<Promise<string>> = [];
    let names: Array<string> = [];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const cmd = queryNamesOfExes(path, i);
      const command = new Command('queryAppName', [cmd]);
      namePromises.push(
        new Promise<string>((resolve) => {
          command.stdout.on('data', async (line: string) => {
            const data = (
              await fs.readTextFile(`zRadialAppNames${i}.json`, {
                dir: fs.BaseDirectory.Temp,
              })
            ).trim();
            resolve(data);
          });
        })
      );
      // command.stderr.on("data", (line: string) => {
      // 	console.error("error", line);
      // });
      command.on('error', (line: string) => {
        console.error('error', line);
      });
      await command.spawn();
    }
    names = await Promise.all(namePromises);
    console.log('resolved all names apparently...');
    let nameArray: Array<{
      productName: string;
      fileDescription: string;
      fileName: string;
    }> = JSON.parse(`[${names.join(',').replace(/\\/g, '\\\\')}]`);
    let resultArray = nameArray.map(
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
    console.log(resultArray);
    return resultArray;
  }
}

export class externalApp {
  public executable: string;
  public name: string;
  public icon?: string;
  public type: string;

  public constructor(executable: string, name: string, icon?: string, type?: string) {
    this.executable = executable;
    this.name = name;
    this.icon = icon;
    this.type = type ?? 'Application';
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

  public toJSONwithTypes() {
    return {
      executable: this.executable,
      name: this.name,
      icon: this.icon ?? '',
      type: this.type,
    };
  }
}
