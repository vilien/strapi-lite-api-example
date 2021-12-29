const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');

const download = async (url, file = 'download.tmp') => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    const disposition = res.headers['content-disposition'];
    const filename = disposition ? disposition.split('filename=')[1] : file;
    const stream = fs.createWriteStream(filename);
    res.pipe(stream);
    res.on('end', () => setTimeout(() => resolve(filename), 200));
  }).on('error', reject);
});

const unzip = async (filename, dir = './') => new Promise((resolve) => {
  console.log('unzip', filename);
  execSync(`unzip -o -q -d ${dir} ${filename}`);
  resolve(true);
});

const cp = async (src, dist) => new Promise((resolve) => {
  console.log('cp', src, '==>', dist);
  execSync(`rm -rf ${dist}`);
  execSync(`cp -rf ${src} ${dist}`);
  resolve(true);
})

const main = async () => {
  console.log('Replacing modules...');
  const filename = await download('https://codeload.github.com/vilien/strapi-lite/zip/refs/heads/master');
  try {
    await unzip(filename, 'tmp');
    await cp('./tmp/strapi-lite-master/packages/strapi', 'node_modules/strapi');
    await cp('./tmp/strapi-lite-master/packages/strapi-database', 'node_modules/strapi-database');
    await cp('./tmp/strapi-lite-master/packages/strapi-utils', 'node_modules/strapi-utils');
    await cp('./tmp/strapi-lite-master/packages/strapi-connector-mongoose', 'node_modules/strapi-connector-mongoose');
  } catch(err) {
    console.error(err);
  }

  // 清理文件
  fs.unlinkSync(filename);
  execSync('rm -rf ./tmp');
};

main();
