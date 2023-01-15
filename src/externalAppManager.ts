import { fs } from '@tauri-apps/api';
import { create, insertBatch, Lyra, search, SearchResult } from '@lyrasearch/lyra';
import { Command } from '@tauri-apps/api/shell';
import { queryNamesOfExes } from './queryApps';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { setAllApps, setRelevantApps } from './settings';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { listen } from '@tauri-apps/api/event';

const defaultIcon: string =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEaSURBVFhH7ZTbCoJAEIYlgoggguhZiw5QVBdB14HQ00T0CqUP4AN41puJAVe92F3HRZegHfgQFvH7/1nQMmPmZ+Z8uYJOCm01vJe64PF8cZ+Ftho89DxPC8IAeZ73QpZlJWmattsAfsBavsk0yRsD3Ox7ST3A4uTC/OjC7ODCdO/AZOfAeOvAaPOB4foDg1UVwLZtIUmSqG2AIq9vgNcc5coBKHIWgNec0RhAdAUUOSJrjsRxrLYBihxBMa85QzkARY7ImjOkAURXQJEjKOY1Z0RRpLYBihyRNUe5cgCKHEEprzmjMYDoCqjImiNhGKptgApvA3V57wFkzbUGEMmDIGgfAKH84ShypQBdyn3fFwfQSaE1Y+bvx7K+Vs0alqBeFFIAAAAASUVORK5CYII=\r';
const defaultIcon2: string =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAEbSURBVFhH7ZTbCoJAEIaNICKIIHrWosNFUV0EXQdCTxPRK5Q+gA/gWW8mBlz1YncdF12CduBDWMTv/2dBy4yZn5nz5Qo6KbTV8F7qgsfzxX0W2mrw0PM8LQgD5HneC1mWlaRp2m4D+AFr+SbTJG8McLPvJfUAi5ML86MLs4ML070Dk50D460Do80HhusPDFZVANu2hSRJorYBiry+AV5zlCsHoMhZAF5zRmMA0RVQ5IisORLHsdoGKHIExbzmDOUAFDkia86QBhBdAUWOoJjXnBFFkdoGKHJE1hzlygEocgSlvOaMxgCiK6Aia46EYai2ASq8DdTlvQeQNdcaQCQPgqB9AITyh6PIlQJ0Kfd9XxxAJ4XWjJm/H8v6AjOfGdkUG8+QAAAAAElFTkSuQmCC\r';

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

  private static scoreList: Map<string, number> = new Map();

  /**
   * Get the search database and if no data is present, start a query for all apps
   * @returns A promise that resolves to the Lyra search database
   */
  public static async getSearchDatabase() {
    if (this.appDB === undefined) {
      if (this.appData.length === 0) {
        // Set up listeners for the query functions
        await listen('finish_query_relevant', (event) => {
          console.log('finish_query_relevant', event);
          this.appDataRelevant = (event.payload as any).map(
            (x) => new externalApp(x.executable, x.name, x.icon, 'App')
          );
          this.appDataRelevant = this.appDataRelevant.filter(
            (x) =>
              x.name !== '' && x.icon !== '' && x.icon !== defaultIcon && x.icon !== defaultIcon2
          );
          setRelevantApps(this.appDataRelevant);
          this.updateSearchDatabase();
        });
        await listen('finish_query_current', (event) => {
          console.log('finish_query_current', event);
        });
        await listen('finish_query_other', (event) => {
          console.log('finish_query_other', event);
          this.appData = (event.payload as any).map(
            (x) => new externalApp(x.executable, x.name, x.icon, 'App')
          );
          this.appData = this.appData.filter(
            (x) =>
              x.name !== '' && x.icon !== '' && x.icon !== defaultIcon && x.icon !== defaultIcon2
          );
          setAllApps(this.appData);
          this.updateSearchDatabase();
        });

        if (await fs.exists('appDataRelevant.json', { dir: BaseDirectory.AppData })) {
          const relevantData = await fs.readTextFile('appDataRelevant.json', {
            dir: BaseDirectory.AppData,
          });
          const parsedRelevant = JSON.parse(relevantData);
          this.appDataRelevant = parsedRelevant.map(
            (x) => new externalApp(x.executable, x.name, x.icon, 'App')
          );
          this.appDataRelevant = this.appDataRelevant.filter(
            (x) =>
              x.name !== '' && x.icon !== '' && x.icon !== defaultIcon && x.icon !== defaultIcon2
          );
          setRelevantApps(this.appDataRelevant);
        }
        if (await fs.exists('appData.json', { dir: BaseDirectory.AppData })) {
          const data = await fs.readTextFile('appData.json', { dir: BaseDirectory.AppData });
          const parsed = JSON.parse(data);
          this.appData = parsed.map((x) => new externalApp(x.executable, x.name, x.icon, 'App'));
          this.appData = this.appData.filter(
            (x) =>
              x.name !== '' && x.icon !== '' && x.icon !== defaultIcon && x.icon !== defaultIcon2
          );
          setAllApps(this.appData);
        }
        if (await fs.exists('appPathsCustom.json', { dir: BaseDirectory.AppData })) {
          const data = await fs.readTextFile('appPathsCustom.json', { dir: BaseDirectory.AppData });
          const parsed = JSON.parse(data);
          this.appDataCustomApps = parsed.map(
            (x) => new externalApp(x.executable, x.name, x.icon, 'App')
          );
          this.appDataCustomApps = this.appDataCustomApps.filter(
            (x) =>
              x.name !== '' && x.icon !== '' && x.icon !== defaultIcon && x.icon !== defaultIcon2
          );
          this.appDataRelevant = this.appDataRelevant
            .concat(this.appDataCustomApps)
            .sort((a, b) => {
              if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
              }
              if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
              }
              return 0;
            });
          setRelevantApps(this.appDataRelevant);
        }

        if (this.scoreList.size === 0) {
          if (!(await fs.exists('appScores.json', { dir: fs.BaseDirectory.AppData }))) {
            this.scoreList = new Map();
          } else {
            const data = await fs.readTextFile('appScores.json', {
              dir: fs.BaseDirectory.AppData,
            });
            this.scoreList = new Map(JSON.parse(data));
          }
        }
        console.log('Querying apps finished', this.appDataRelevant);
      }
      this.updateSearchDatabase();
    }
    return this.appDB;
  }

  private static async updateSearchDatabase() {
    this.appDB = create({
      schema: {
        executable: 'string',
        name: 'string',
        icon: 'string',
        type: 'string',
      },
    });
    // create a new list of apps, which filters out duplicates, by removing all apps, whose executable is already in the relevant list
    let filteredApps = this.appData.filter(
      (x) =>
        this.appDataRelevant.findIndex((y) => y.executable === x.executable) === -1 &&
        x.executable !== ''
    );
    // add the relevant apps and the filtered apps to the appData array
    filteredApps = this.appDataRelevant.concat(filteredApps);

    await insertBatch(
      this.appDB,
      filteredApps.map((x) => {
        if (!x.icon.startsWith('data:image/png;base64,')) {
          x.icon = convertFileSrc(x.icon);
        }
        return x.toJSONwithTypes();
      })
    );
  }

  public static async getIconOfActionExe(executable: string): Promise<string> {
    if (fs.exists('', { dir: BaseDirectory.AppData })) {
      if (
        this.appDataRelevant.length === 0 &&
        fs.exists('appDataRelevant.json', {
          dir: BaseDirectory.AppData,
        })
      ) {
        const relevantData = await fs.readTextFile('appDataRelevant.json', {
          dir: BaseDirectory.AppData,
        });
        const parsedRelevant = JSON.parse(relevantData);
        this.appDataRelevant = parsedRelevant.map(
          (x) => new externalApp(x.executable, x.name, x.icon, 'App')
        );
      }
      if (
        this.appDataCustomApps.length === 0 &&
        (await fs.exists('appPathsCustom.json', {
          dir: BaseDirectory.AppData,
        }))
      ) {
        const customData = await fs.readTextFile('appPathsCustom.json', {
          dir: BaseDirectory.AppData,
        });
        const parsedCustom = JSON.parse(customData);
        this.appDataCustomApps = parsedCustom.map(
          (x) => new externalApp(x.executable, x.name, x.icon, 'App')
        );
      }
    }
    // check if the executable is in the appData or appDataRelevant array
    const app = this.appData.find(
      (x) => x.executable.replace(/\\+/g, '/') === executable.replace(/\\+/g, '/')
    );
    if (app !== undefined) {
      return app.icon;
    }
    const appCustom = this.appDataCustomApps.find(
      (x) => x.executable.replace(/\\+/g, '/') === executable.replace(/\\+/g, '/')
    );
    if (appCustom !== undefined) {
      return appCustom.icon;
    }

    const appRelevant = this.appDataRelevant.find(
      (x) => x.executable.replace(/\\+/g, '/') === executable.replace(/\\+/g, '/')
    );
    if (appRelevant !== undefined) {
      return appRelevant.icon;
    }
    console.log('getIconOfActionExe', executable, 'not found');
    // if not, query the icon
    const icon = ''; //queryIconOfExe(executable);
    return icon;
  }

  private static dropTimeout: number = 0;

  //TODO get the custom Apps in the relevantApps query!
  public static async addCustomApp(executable: string) {
    if (this.appDataCustomApps.find((x) => x.executable === executable) === undefined) {
      let now = new Date().getTime();
      let diff = now - this.dropTimeout;
      if (diff < 1000) return;
      this.dropTimeout = now;

      // First make sure the file exists and has not been added yet.
      if (
        (await fs.exists(executable)) &&
        !this.appData.some((value) => value.executable === executable)
      ) {
        // Get the name & icon via the executable path
        const name = await this.getApplicationNameFromExe([executable], true);
        if (fs.exists(executable)) {
          const command = Command.sidecar('binaries/CSharpIntegration', executable);
          await command.spawn();
          const icon = await new Promise<string>((resolve) => {
            command.stdout.on('data', (line) => {
              resolve(line as string);
            });
          });

          const app = new externalApp(
            executable,
            name[0],
            'data:image/png;base64,' + icon.split('?')[1]
          );
          this.appDataCustomApps.push(app);
          this.appDataRelevant.push(app);
          this.appDataRelevant = this.appDataRelevant.sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return -1;
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return 1;
            }
            return 0;
          });
          setRelevantApps(this.appDataRelevant);
          setAllApps(this.appData);
          this.saveAppDataToDisk();
          this.updateSearchDatabase();
          return app;
        }
      }
    }
    return;
  }

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

  private static saveAppDataToDisk() {
    fs.writeTextFile('appPathsCustom.json', JSON.stringify(this.appDataCustomApps), {
      dir: fs.BaseDirectory.AppData,
    });
  }

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

  public static getAppScore(exe: string) {
    if (this.scoreList.has(exe)) {
      return this.scoreList.get(exe);
    } else {
      return 1;
    }
  }

  public static incrementAppScore(exe: string) {
    if (this.scoreList.has(exe)) {
      const score = this.scoreList.get(exe) + 0.1;
      this.scoreList.set(exe, score);
    } else {
      this.scoreList.set(exe, 1.1);
    }
    fs.writeTextFile('appScores.json', JSON.stringify(Array.from(this.scoreList.entries())), {
      dir: fs.BaseDirectory.AppData,
    });
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
    this.type = type ?? 'App';
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
