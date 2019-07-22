# SCs Currency Converter

Currency Converter for Firefox

https://addons.mozilla.org/firefox/addon/scscurrencyconverter/

## Development

Requirements:

- [Node.js](https://nodejs.org/)
- [npm](https://github.com/npm/cli/releases/latest)

### Install

To install the project's dependencies:

```sh
npm install
```

### Start

During development use:

```sh
npm start
```

This will build a develpment version of the scripts in the dist folder, and starts webpack in watch mode.

In an other terminal/console:

```sh
npm run run:web-ext
```

This opens a clean Firefox with the addon installed. Every time a script is modified, the addon will be reloaded.

### Build

To build the addon, use:

```sh
npm run build
```

This will build a production version of the scripts in the dist folder, and packages them into a zip file in the build folder.
