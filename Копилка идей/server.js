const http = require('http');
const fs = require('fs');
const path = require('path');
const { url } = require('inspector');

const PORT = 3000;
const entryBanlist = ['main.html', '.vscode']
function walk(dir) {
    let directories = [], files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name in entryBanlist ||(entry.name.startsWith('V') ^ entry.isFile())) continue;

        if (entry.isDirectory()) {
            directories[directories.length] = entry.name;
        } else {   
            files[files.length]=entry.name;
        }
    }

    return new class { 'directories' = directories; 'files' = files};
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url,'https://gianter.monster');
    if (url.pathname == '/directory') {
        let dir = __dirname;
        if (url.searchParams.has('path'))
            dir += url.searchParams.get('path');
        const tree = walk(dir);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tree));
    } else if (url.pathname =='/') {
        fs.createReadStream('./main.html').pipe(res);
    } else {
        // отдать файл если существует
        const filePath = path.join(__dirname, decodeURIComponent(req.url));
        if (fs.existsSync(filePath)) {
            const stream = fs.createReadStream(filePath);
            res.writeHead(200);
            stream.pipe(res);
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});