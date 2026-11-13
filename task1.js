const fs = require('fs').promises;
const path = require('path');

const N = 21; 
const STUDENT_NAME = 'Чилек Марк'; 
const GROUP = '478'; 
const FAVORITES = [
  ['Бойцовский клуб', 'Чак Паланик'],
  ['Старик и Море', 'Эрнест Хеменгуэй'],
  ['Думай медленно, решай быстро', 'Даниель Канеман'],
  ['1984', 'Дж. Оруэлл'],
  ['Гарри Поттер', 'Дж. Роулинг'],
];

// путь к файлу относительно текущей директории
const filePath = path.join('.', `student_${N}.txt`);

/** формирует текстовое содержимое файла с данными */
function buildFileContent() {
  const now = new Date();
  // дает формат ГГГГ-ММ-ДД ЧЧ:ММ:СС
  const dateStr = now.toLocaleString('sv-SE');

  const lines = [
    `Студент: ${STUDENT_NAME}`,
    `Группа: ${GROUP}`,
    `Вариант: ${N}`,
    `Дата: ${dateStr}`,
    'Любимые книги:',
    ...FAVORITES.map(([title, author], i) => `${i + 1}. "${title}" - ${author}`),
  ];
  return lines.join('\n');
}

async function main() {
  try {
    // создаем файл и записываем информацию (перезаписывает, если файл уже существует)
    await fs.writeFile(filePath, buildFileContent(), 'utf8');
    console.log(`Создан файл: student_${N}.txt`);

    // считаем количество строк и добавляем итоговую строку в конец файла
    const content = await fs.readFile(filePath, 'utf8');
    const lineCount = content.split('\n').length;
    await fs.appendFile(filePath, `\nКоличество записей: ${lineCount}`, 'utf8');

    // читаем итоговый файл и выводим содержимое в отформатированном виде
    const finalContent = await fs.readFile(filePath, 'utf8');
    console.log('Содержимое файла:');
    console.log('----------------------------');
    console.log(finalContent);
    console.log('----------------------------');
  } catch (err) {
    // обработка ошибок 
    console.error(`Ошибка при работе с файлом: ${err.message}`);
    process.exitCode = 1;
  }
}

main();
