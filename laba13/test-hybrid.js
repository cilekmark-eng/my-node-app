const FileManagerHybrid = require('./fileOperationsHybrid');

const fileManager = new FileManagerHybrid('./test-data-hybrid');

console.log('=== ТЕСТИРОВАНИЕ ГИБРИДНОГО МОДУЛЯ ===\n');
console.log('(Поддержка и промисов, и колбэков + обработка ошибок)\n');

async function main() {
    try {
        // --- Часть 1: стиль с промисами ---
        console.log('1. Создание файла (промисы)...');
        const filePath = await fileManager.createFile('hybrid1.txt', 'Гибридный подход');
        console.log(`Файл создан: ${filePath}`);

        console.log('\n2. Чтение файла (промисы)...');
        const content = await fileManager.readFile('hybrid1.txt');
        console.log(`Содержимое: "${content}"`);

        console.log('\n3. Статистика (промисы)...');
        const stats = await fileManager.getFileStats('hybrid1.txt');
        console.log(`Размер: ${stats.size} байт, изменён: ${stats.modified}`);

        // --- Часть 2: стиль с колбэками (тот же модуль!) ---
        console.log('\n4. Создание файла (колбэки)...');
        fileManager.createFile('hybrid2.txt', 'Через колбэк', (err, path2) => {
            if (err) return console.error('Ошибка:', err.message);
            console.log(`Файл создан: ${path2}`);

            console.log('\n5. Список файлов (колбэки)...');
            fileManager.listFiles((err, files) => {
                if (err) return console.error('Ошибка:', err.message);
                console.log(`Файлы в директории:`);
                files.forEach(f => console.log(`   - ${f}`));
            });
        });

        // --- Часть 3: обработка ошибок в обоих стилях ---

        // 3.1. Ошибка через промис (try/catch)
        console.log('\n6. Чтение несуществующего файла (промисы → catch)...');
        try {
            await fileManager.readFile('nonexistent.txt');
        } catch (err) {
            console.log(`Ошибка поймана через try/catch: ${err.code}`);
        }

        // 3.2. Та же ошибка через колбэк (первый аргумент err)
        console.log('\n7. Чтение несуществующего файла (колбэк → err)...');
        fileManager.readFile('nonexistent.txt', (err) => {
            if (err) console.log(`Ошибка пришла в колбэк: ${err.code}`);
        });

        // 3.3. Ошибка валидации (пустое имя файла)
        console.log('\n8. Попытка создать файл с пустым именем...');
        try {
            await fileManager.createFile('', 'x');
        } catch (err) {
            console.log(`Валидация сработала: ${err.message}`);
        }
        // Та же ошибка через колбэк
        fileManager.createFile('', 'x', (err) => {
            if (err) console.log(`Ошибка валидации в колбэке: ${err.message}`);
        });

        // --- Очистка ---
        await fileManager.deleteFile('hybrid1.txt');
        await new Promise(resolve => setTimeout(resolve, 300)); // ждём колбэки
        await fileManager.deleteFile('hybrid2.txt');
        console.log('\nВсе операции завершены!');
        console.log('Один модуль работает в двух стилях!');

    } catch (error) {
        console.error('\n Критическая ошибка:', error.message);
    }
}

main();
