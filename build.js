// 把 src/ 合併成一個單檔頁面：dist/index.html（Artifact 用）與 dist/standalone.html（本機直接開）
const fs = require('fs'), path = require('path');
const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
// 用函式當替換值，避免原始碼裡的 $' $& 被當成特殊樣式
const put = (html, marker, file) => html.replace(marker, () => read(file));
let html = read('index.src.html');
html = put(html, '/*__CSS__*/', 'src/style.css');
html = put(html, '/*__ENGINE__*/', 'src/engine.js');
html = put(html, '/*__DATA__*/', 'src/data.js');
html = put(html, '/*__DATA2__*/', 'src/data2.js');
html = put(html, '/*__DATA3__*/', 'src/data3.js');
html = put(html, '/*__DATA4__*/', 'src/data4.js');
html = put(html, '/*__SCENE__*/', 'src/scene.js');
html = put(html, '/*__UI__*/', 'src/ui.js');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
fs.writeFileSync(path.join(root, 'dist/standalone.html'), '<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' + html.replace(/<div id="app"[\s\S]*$/, (m) => '</head><body>' + m + '</body></html>'));
console.log('built', (html.length / 1024).toFixed(1), 'KB');
