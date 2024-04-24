const fs = require('fs');
const path = require('path');

const root = path.resolve('.');

function readFiles(root) {
    let files = fs.readdirSync(root, { withFileTypes: false, recursive: true });
    console.log('Found total ' + (files || []).length + ' files');

    if (files.length > 0) {
        files.forEach(file => {
            // if (file.isFile()) {
            //     console.log('File: ' + file.path + '/' + file.name);
            // }
            console.log(file);

            const filePath = path.resolve(root, file);
            const stat = fs.statSync(filePath);
            if(stat) {
                console.log('  Stat: ' + stat.isFile + ' of size ' + stat.size + ' bytes');

            }
        });
    }
}

console.log('check current folder for files: ' + root);
readFiles(root);
