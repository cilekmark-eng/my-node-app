const fs = require('fs');
const path = require('path');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);
const statAsync = util.promisify(fs.stat);
const readdirAsync = util.promisify(fs.readdir);


class FileManagerHybrid {
    constructor(baseDir = './data-hybrid') {
        this.baseDir = baseDir;
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
            console.log(`Создана директория: ${baseDir}`);
        }
    }

    _adapt(promise, callback) {
        if (typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err, null));
            return undefined;
        }
        return promise;
    }

    _validateFilename(filename) {
        if (typeof filename !== 'string' || filename.trim().length === 0) {
            throw new Error('Имя файла должно быть непустой строкой');
        }
    }

   
    createFile(filename, content, callback) {
        try {
            this._validateFilename(filename);
            const filePath = path.join(this.baseDir, filename);
            const promise = writeFileAsync(filePath, content, 'utf8').then(() => filePath);
            return this._adapt(promise, callback);
        } catch (err) {
            return this._adapt(Promise.reject(err), callback);
        }
    }

    
    readFile(filename, callback) {
        try {
            this._validateFilename(filename);
            const filePath = path.join(this.baseDir, filename);
            const promise = readFileAsync(filePath, 'utf8');
            return this._adapt(promise, callback);
        } catch (err) {
            return this._adapt(Promise.reject(err), callback);
        }
    }

    
    getFileStats(filename, callback) {
        try {
            this._validateFilename(filename);
            const filePath = path.join(this.baseDir, filename);
            const promise = statAsync(filePath).then(stats => ({
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isFile: stats.isFile()
            }));
            return this._adapt(promise, callback);
        } catch (err) {
            return this._adapt(Promise.reject(err), callback);
        }
    }

    deleteFile(filename, callback) {
        try {
            this._validateFilename(filename);
            const filePath = path.join(this.baseDir, filename);
            const promise = unlinkAsync(filePath);
            return this._adapt(promise, callback);
        } catch (err) {
            return this._adapt(Promise.reject(err), callback);
        }
    }

    
    listFiles(callback) {
        const promise = readdirAsync(this.baseDir)
            .then(files => Promise.all(files.map(async (file) => {
                try {
                    const stats = await statAsync(path.join(this.baseDir, file));
                    return { name: file, isFile: stats.isFile() };
                } catch {
                    return { name: file, isFile: false };
                }
            })))
            .then(results => results.filter(r => r.isFile).map(r => r.name));
        return this._adapt(promise, callback);
    }
}

module.exports = FileManagerHybrid;
