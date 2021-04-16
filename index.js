#!/bin/node

const WebTorrent = require('webtorrent-hybrid');
const fs = require('fs');
const os = require('os');
const hash = process.argv[2];
const client = new WebTorrent;
const cliProgress = require('cli-progress');
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect);

if (!hash) {
  console.log('You must enter your torrent link as an argument');
  console.log('./torrent-downloader-cli LINK');
  process.exit();
}

// https://itorrents.org/torrent/47EEBC7714DB479C0C32DEC563630AC81BA27B2E.torrent
// https://itorrents.org/torrent/1B385B301E62464056DD3CDD7EA64096780E748B.torrent

const getDownloadsDirectory = () => {
  // return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
  return os.homedir() + '/Downloads';
};


try {
  client.add(hash, torrent => {
    const files = torrent.files;
    let length = files.length;
    console.log(`Files Count: ${length}`);
    console.log(`Downloading in your Downloads directory: "${getDownloadsDirectory()}"`);
    bar.start(100, 0);
    let interval = setInterval(() => {
      bar.update(torrent.progress * 100);
    }, 1000);
    files.forEach(file => {
      const source = file.createReadStream();
      const dest = fs.createWriteStream(`${getDownloadsDirectory()}/${file.name}`);
      source.on('end', () => {
        console.log(`\n----\nfile "${file.name}" downloaded.\n`);
        length -= 1;
        if (!length) {
          bar.stop();
          clearInterval(interval);
          process.exit();
        }
      }).pipe(dest);
    });
  });
} catch (err) {
  console.error(`Error: ${err}`);
}
