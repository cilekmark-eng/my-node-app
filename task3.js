const fs = require('fs').promises;
const path = require('path');

const N = 21;

// директория для анализа
const targetDir = path.resolve(process.argv[2] || '.');

// максимальный размер файла — 10 МБ
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** нужно ли пропускать эту папку */
function shouldSkipDirectory(name) {
  if (N >= 6 && N <= 10) {
    return name === 'node_modules' || name === '.git';
  }

  return false;
}

/** пропускает файлы размером более 10 МБ. */
function shouldSkipFile(size) {
  return size > MAX_FILE_SIZE;
}

/** форматирует размер файла. */
function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} байт`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} КБ`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} МБ`;
}

/** рекурсивно сканирует директорию. */
async function scan(dir, files = [], folders = []) {
  const entries = await fs.readdir(dir, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(process.cwd(), fullPath) || '.';

    if (entry.isDirectory()) {
      if (shouldSkipDirectory(entry.name)) {
        continue;
      }

      folders.push(relPath);
      await scan(fullPath, files, folders);
    } else if (entry.isFile()) {
      const stat = await fs.stat(fullPath);

      // Файлы размером более 10 МБ не включаются в анализ
      if (shouldSkipFile(stat.size)) {
        continue;
      }

      files.push({
        name: entry.name,
        path: relPath,
        size: stat.size,
        ext: path.extname(entry.name).toLowerCase(),
      });
    }
  }

  return { files, folders };
}

async function main() {
  try {
    // Проверяем целевую директорию
    const stat = await fs.stat(targetDir);

    if (!stat.isDirectory()) {
      throw new Error(`${targetDir} не является директорией`);
    }

    console.log(`Анализ директории: ${targetDir}`);
    console.log('Файлы размером более 10 МБ игнорируются.\n');

    // рекурсивное сканирование
    const { files, folders } = await scan(targetDir);

    // общая статистика
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    console.log(`Общее количество папок: ${folders.length}`);
    console.log(`Количество учтённых файлов: ${files.length}`);
    console.log(
      `Общий размер учтённых файлов: ${formatSize(totalSize)} ` +
      `(${totalSize.toLocaleString('ru-RU')} байт)\n`
    );

    // группировка по расширениям
    const byExt = {};

    for (const file of files) {
      const key = file.ext || '(без расширения)';

      if (!byExt[key]) {
        byExt[key] = {
          count: 0,
          size: 0,
        };
      }

      byExt[key].count++;
      byExt[key].size += file.size;
    }

    console.log('Расширения файлов:');

    const extensions = Object.entries(byExt).sort(
      (a, b) => b[1].size - a[1].size
    );

    for (const [ext, info] of extensions) {
      console.log(
        `   ${ext}: ${info.count} файлов (${formatSize(info.size)})`
      );
    }

    console.log();

    // сортировка файлов по размеру
    const sorted = [...files].sort((a, b) => b.size - a.size);

    const largestFiles = sorted.slice(0, 5);
    const smallestFiles = [...files]
      .sort((a, b) => a.size - b.size)
      .slice(0, 5);

    console.log('Топ-5 самых больших учтённых файлов:');

    largestFiles.forEach((file, index) => {
      console.log(
        `   ${index + 1}. ${file.name} ` +
        `(${formatSize(file.size)}) — ${file.path}`
      );
    });

    console.log('\nТоп-5 самых маленьких учтённых файлов:');

    smallestFiles.forEach((file, index) => {
      console.log(
        `   ${index + 1}. ${file.name} ` +
        `(${formatSize(file.size)}) — ${file.path}`
      );
    });

    console.log();

    // отчёт
    const report = {
      директория: targetDir,
      вариант: N,
      дата_анализа: new Date().toLocaleString('sv-SE'),
      максимальный_размер_файла_байт: MAX_FILE_SIZE,
      папок: folders.length,
      файлов: files.length,
      общий_размер_байт: totalSize,
      расширения: Object.fromEntries(
        Object.entries(byExt).map(([ext, info]) => [
          ext,
          {
            файлов: info.count,
            размер_байт: info.size,
          },
        ])
      ),
      топ_5_больших: largestFiles,
      топ_5_маленьких: smallestFiles,
    };

    // сохраняем отчёт
    const reportPath = path.resolve(`report_${N}.json`);

    await fs.writeFile(
      reportPath,
      JSON.stringify(report, null, 2),
      'utf8'
    );

    console.log(`Отчёт сохранён: ${reportPath}`);
  } catch (err) {
    console.error('Ошибка выполнения программы:');
    console.error(err);
    process.exitCode = 1;
  }
}

main();