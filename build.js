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

            const file2 = path.resolve(root, file);
            console.log('File: ' + file2.path + '/' + file2.name);
        });
    }
}

console.log('check current folder for files: ' + root);
readFiles(root);

const parent = path.resolve('..');
console.log('check current folder for files: ' + parent);
readFiles(parent);

