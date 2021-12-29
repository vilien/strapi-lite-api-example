const https = require('https');
const { tmpdir } = require('os');
const path = require('path');
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

const rm = async (dir) => new Promise((resolve, reject) => {
  if (dir && dir !== '/') {
    execSync(`rm -rf ${dir}`);
    resolve(true);
  } else {
    reject(new Error(`Illegal directory: '${dir}'`));
  }
});


const unzip = async (filename, dir = './') => new Promise((resolve) => {
  console.log('unzip', filename);
  execSync(`tar -C ${dir} -xzf ${filename}`);
  resolve(true);
});

const cp = async (src, dist) => new Promise((resolve) => {
  console.log('cp', src, '==>', dist);
  rm(dist);
  execSync(`cp -rf ${src} ${dist}`);
  resolve(true);
});

const main = async () => {
  console.log('Replacing modules...');
  const filename = await download('https://codeload.github.com/vilien/strapi-lite/tar.gz/refs/tags/v0.0.1');
  const basename = path.basename(filename, '.tar.gz');
  const tmpDir = fs.mkdtempSync(path.join(tmpdir(), 'strapi-'));
  try {
    await unzip(filename, tmpDir);
    await cp(`${tmpDir}/${basename}/packages/strapi`, 'node_modules/strapi');
    await cp(`${tmpDir}/${basename}/packages/strapi-database`, 'node_modules/strapi-database');
    await cp(`${tmpDir}/${basename}/packages/strapi-utils`, 'node_modules/strapi-utils');
    await cp(`${tmpDir}/${basename}/packages/strapi-connector-mongoose`, 'node_modules/strapi-connector-mongoose');
  } catch(err) {
    console.error(err);
  }

  // 清理文件
  fs.unlinkSync(filename);
  rm(tmpDir);
};

main();
