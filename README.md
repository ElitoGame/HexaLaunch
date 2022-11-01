# RadialHexUI

A radial hexagon menu to boost productivity

## Features

### Essentials

- [ ] Launching Apps
- [x] Auto Start with Windows(/Mac)
- [ ] Settings Menu for essential settings like:
  - [ ] Themes
  - [ ] Hotkey
  - [ ] App layout customization
- [ ] Essential Extensions
  - [ ] Browser Launcher
  - [ ] Empty Paper bin
- [ ] Auto Updating (Windows 100%, Mac potentially harder due to notarizing)
- [ ] Add a possibility to add Apps to the Launcher without pasting the Apps install location. This can be one or multiple of these:
  - [ ] Via the Windows.edb index File.
  - [ ] Via a CMD or Powershell command (Get-WMIObject or wmic or Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*)
  - [ ] Via node.fs
  - [ ] Via Drap & Drop
  - [ ] Via detecting active processes

### Optional

- [ ] Non-Essential Settings
  - [ ] Icon Picker for the App layout customization
- [ ] Non-Essential Extensions
  - [ ] ~~Bluetooth Connector~~
  - [ ] Windows Media Player Extension (or Spotify alternatively)
  - [ ] System Stats (RAM, CPU, Storage, GPU)
  - [ ] Searchbar (Depends highly on App detection)
  - [ ] Browser Bookmarks (Chrome & Firefox for now)
- [ ] Animations in the Hex UI
  - [ ] Opening and Closing the UI
  - [ ] Moving the Mouse to show different hexagons fields
  - [ ] Opening special fields like the Searchbar
- [ ] Mac Support (Not required since no Mac Users in the team, so nice to have) - many extensions don't work on linux, so sadly no support there...

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

Requires at least Node v14.18+

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
