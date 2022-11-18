export interface IElectronAPI {
  sendData: (dataToSubmit: any[]) => void;
  search: (
    query: string,
    offset: number
  ) => Promise<
    | SearchResult<{
        executable: 'string';
        name: 'string';
        icon: 'string';
      }>
    | undefined
  >;
  addApp: (app: string) => Promise<{ executable: string; name: string; icon: string } | undefined>;
  getRelevantApps: () => Promise<{
    executable: 'string';
    name: 'string';
    icon: 'string';
  }>;
}
