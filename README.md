
# Coh2 Player Stats Display

Better late than never. This is a new tool display the Stats of the players within a Company of Heroes 2 match similar to [MakoCelo](https://github.com/RosboneMako/MakoCelo). It is designed to be simple and easy to use without configuration. 

## Features

- Shows all Players within the current or last match of Company of Heroes 2
- Displays the Faction
- Displays solo and team rankings including the level
- Displays the players playtime with the star level
- Display the nationality with a flag
- Auto updates in the background
- Automaticaly finds the log file of COH2
- Streamer mode for overlays

![Screenshot](/documentation/images/screenshot.jpg?raw=true "")

## Usage

Download and install the newest release from: https://github.com/John-Wickedsick/coh2-player-stats/releases
Execute it and it automatically scans for games in the background.

## Contributing

Fork and clone this repo. Then add your changes and create a pull request to this repo once you are done.

### Starting Development

You will need nodejs and npm. After you cloned the repo go into the project folder and install the dependencies with:

```bash
npm install
```

Start the app in the `dev` environment:

```bash
npm start
```

### Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

### Docs

This repo was build on the electron-react-boilerplate [docs and guides on that are here](https://electron-react-boilerplate.js.org/docs/installation)
