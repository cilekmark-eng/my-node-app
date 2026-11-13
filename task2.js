const fs = require('fs').promises;
const path = require('path');

const N = 21;

// корневая папка проекта
const ROOT = path.join('.', `project_${N}`);

// список создаваемых папок
const FOLDERS = [
  path.join(ROOT, 'src', 'modules'),
  path.join(ROOT, 'src', 'components'),
  path.join(ROOT, 'src', 'utils'),
  path.join(ROOT, 'data', 'input'),
  path.join(ROOT, 'data', 'output'),
  path.join(ROOT, 'temp'),
];

// описание назначения папок
const DESCRIPTIONS = {
  [path.join(ROOT, 'src')]: 'Исходный код проекта',
  [path.join(ROOT, 'src', 'modules')]: 'Модули приложения',
  [path.join(ROOT, 'src', 'components')]: 'Компоненты интерфейса',
  [path.join(ROOT, 'src', 'utils')]: 'Вспомогательные утилиты',
  [path.join(ROOT, 'data')]: 'Данные проекта',
  [path.join(ROOT, 'data', 'input')]: 'Входные данные',
  [path.join(ROOT, 'data', 'output')]: 'Выходные данные',
  [path.join(ROOT, 'temp')]: 'Временные файлы',
};

// вывод дерева каталогов
async function printTree(dir, prefix = '') {
  const entries = await fs.readdir(dir, {
    withFileTypes: true,
  });

  entries.sort((a, b) =>
    (Number(b.isDirectory()) - Number(a.isDirectory())) ||
    a.name.localeCompare(b.name)
  );

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLast = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';

    console.log(prefix + connector + entry.name);

    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');

      await printTree(
        path.join(dir, entry.name),
        newPrefix
      );
    }
  }
}

// создание файла с описанием папки
async function writeInfo(folder, description) {
  await fs.writeFile(
    path.join(folder, 'info.txt'),
    `Папка: ${path.basename(folder)}\nНазначение: ${description}\n`,
    'utf8'
  );
}

async function main() {
  try {
    // создаём структуру каталогов
    for (const folder of FOLDERS) {
      await fs.mkdir(folder, { recursive: true });
    }

    console.log(`Создана структура папок: project_${N}\n`);

    // создаём info.txt во всех описанных папках
    for (const [folder, description] of Object.entries(DESCRIPTIONS)) {
      await writeInfo(folder, description);
    }

    // Доп задание
    if (N % 2 !== 0) {
      for (let i = 1; i <= 3; i++) {
        const nestedFolder = path.join(
          ROOT,
          'src',
          'components',
          String(i)
        );

        await fs.mkdir(nestedFolder, { recursive: true });

        await writeInfo(
          nestedFolder,
          `Вложенная папка компонентов №${i}`
        );
      }

      console.log(
        '(Нечетный вариант) В src/components созданы папки 1, 2, 3\n'
      );
    }

    // начальное дерево
    console.log('Дерево структуры (начальное):');
    console.log(path.basename(ROOT));
    await printTree(ROOT);
    console.log();

    // переносим temp внутрь data
    const tempPath = path.join(ROOT, 'temp');
    const dataTempPath = path.join(ROOT, 'data', 'temp');

    // удаляем остатки предыдущего запуска
    await fs.rm(dataTempPath, {
      recursive: true,
      force: true,
    });

    await fs.rename(tempPath, dataTempPath);

    console.log('Папка temp перемещена в data\n');

    // переименовываем output в results
    const outputPath = path.join(ROOT, 'data', 'output');
    const resultsPath = path.join(ROOT, 'data', 'results');


    await fs.rm(resultsPath, {
      recursive: true,
      force: true,
    });

    await fs.rename(outputPath, resultsPath);

    // обновляем описание после переименования
    await writeInfo(resultsPath, 'Выходные данные');

    console.log('Папка data/output переименована в data/results\n');

    // удаляем data/temp вместе с содержимым
    await fs.rm(dataTempPath, {
      recursive: true,
      force: true,
    });

    console.log('Папка data/temp удалена со всем содержимым\n');

    // выводим обновлённое дерево
    console.log('Дерево структуры (обновленное):');
    console.log(path.basename(ROOT));
    await printTree(ROOT);
  } catch (err) {
    console.error('Ошибка выполнения программы:');
    console.error(err);
    process.exitCode = 1;
  }
}

main();