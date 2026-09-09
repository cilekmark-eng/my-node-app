const http = require('http');

//ПИ
function calculatePi(iterations) {
    let pi = 0;
    let sign = 1;
    for (let i = 0; i < iterations; i++) {
        pi += sign / (2 * i + 1);
        sign *= -1;
    }
    return pi * 4;
}
const piValue = calculatePi(1000000); 
const piFormatted = piValue.toFixed(21);

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write('<h1>Информация о студенте</h1>');
    res.write('<p><strong>ФИО:</strong> [Чилек Марк Геннадьевич]</p>');
    res.write('<p><strong>Группа:</strong> [478]</p>');
    res.write(`<p><strong>Число Пи (до ${21} знака):</strong> ${piFormatted}</p>`);
    res.end();
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});