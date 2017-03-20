/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true, "optionalDependencies": false, "peerDependencies": false}] */

const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const manifest = require('../dist/manifest.json');

const inPath = path.resolve(process.cwd(), 'dist');
const outPath = path.resolve(process.cwd(), 'build');

const onError = (err) => {
  throw err;
};

const createArchive = (err) => {
  if (err && err.code !== 'EEXIST') onError(err);

  const outFile = `scscc-v${manifest.version}.zip`;
  const output = fs.createWriteStream(path.join(outPath, outFile));
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  archive.pipe(output);

  output.on('close', () => {
    console.log('DONE:', archive.pointer(), 'total bytes');
  });

  archive.on('error', onError);

  archive.glob('**/*', { cwd: inPath });

  archive.finalize();
};

fs.mkdir(outPath, createArchive);
