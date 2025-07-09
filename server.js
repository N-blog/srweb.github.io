const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

const DB_FILE = path.join(__dirname, 'data.json');
const PORT = 1589;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// データベースを読み込む関数（毎回使用）
function loadDB() {
  if (!fs.existsSync(DB_FILE)) return {};
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw);
}

// データベースを保存する関数
function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

// ID生成関数（5文字の英数字 + _ と -）
function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  let id = '';
  for (let i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// ホームページ: タイトルとフォーム
app.get('/', (req, res) => {
  res.send(`
    <title>Glitch Webホストは終了しました。</title>
    <h1>Glitch Webホストは終了しました。</h1>
   
  `);
});
app.get('/admin', (req, res) => {
  res.send(`
    <title>Glitch Webホスト...画面作成</title>
    <h1>Glitch Webホスト...画面作成</h1>
    <form action="/api/admin" method="post">
      <input name="title" placeholder="タイトル" required /><br/>
      <input name="from" placeholder="From" required /><br/>
      <textarea name="body" placeholder="本文"></textarea><br/>
      <input name="ref" placeholder="参考URL" /><br/>
      <input name="s" placeholder="リンクURL" /><br/>
      <input name="id" placeholder="ID" /><br/>
      <button type="submit">作成</button>
    </form>
  `);
});
// /dev → /admin にリダイレクト
app.get('/dev', (req, res) => res.redirect('/admin'));

// /admin: フォームから新しいページを作成
app.post('/api/admin', (req, res) => {
  const db = loadDB();
  function reqid(id) {
    if (id) {
      return id  
    }
    return generateId();
  }
  const id =reqid(req.id)
  db[id] = {
    id,
    title: req.body.title,
    from: req.body.from,
    body: req.body.body || '',
    k: true,
    redirect: '',
    ref: req.body.ref || '',
    s: req.body.s || ''
  };
  saveDB(db);
  res.redirect(`/p/${id}`);
});

// /api/data/:id: データをJSONで取得
app.get('/api/data/:id', (req, res) => {
  const db = loadDB();
  const data = db[req.params.id];
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});
app.get('/redirect/:id', (req, res) => {
  const data = db[req.params.id];
res.send(`<title>リダイレクトしようとしています</title>
    <h1>リダイレクトしようとしています</h1>
    <a href=${id}>リダイレクト</a>
    `)
});
// /p/:id: ページを表示
app.get('/p/:id', (req, res) => {
  const db = loadDB();
  const data = db[req.params.id];
  if (!data) return res.status(404).send('ページが見つかりません');

  const status = data.k ? '管理中' : '管理していません';
  const sContent = data.s
    ? `<p><a href="${data.s}" target="_blank">リンク</a></p>`
    : '<p>キャンセル</p>';
  const refLink = data.ref
    ? `<a href="${data.ref}" target="_blank">${data.ref}</a>`
    : 'なし';
if (!(data.redirect)) {
    res.redirect("/redirect/"+data.redirect)
}
  res.send(`
    <title>WebHosts ${data.title}</title>
    <h1>${data.title} (${refLink})の情報 Webhost</h1>
    ${data.body}
    <p>From: ${data.from}</p>
    <p>状態: ${status}（${refLink}）</p>
    ${sContent}
    
    <hr/>
    <table border="1">
      <tr><th>プロパティ</th><th>意味</th><th>内容</th></tr>
      <tr><td>id</td><td>ページの識別子</td><td>${data.id}</td></tr>
      <tr><td>title</td><td>ページのタイトル</td><td>${data.title}</td></tr>
      <tr><td>from</td><td>作成者や出典</td><td>${data.from}</td></tr>
      <tr><td>k</td><td>管理状態</td><td>${data.k}</td></tr>
      <tr><td>redirect</td><td>リダイレクト先</td><td>${data.redirect || 'なし'}</td></tr>
      <tr><td>ref</td><td>リンク</td><td>${refLink}</td></tr>
      <tr><td>s</td><td>リンク</td><td>${data.s ? `<a href="${data.s}">${data.s}</a>` : 'なし'}</td></tr>
    </table>
  `);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
