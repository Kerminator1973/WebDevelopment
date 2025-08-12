# Анализ ошибочных запросов к Node.js

В случае, если клиент сформировал запрос с ошибокой в структуре, Node.js отсчёт такие запросы на уровне Middleware, а для разработчика клиентского ПО это может быть критичной проблемой. Чтобы увидеть подобные ошибки, необходимо добавить в проект дополнительное логирование:

```js
const express = require('express');
const app = express();

// Middleware логирует все получаемые запросы
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.ip}`);
    console.log('Headers:', req.headers);
    next();
});

// Middleware обрабатывает ошибку в структуре JSON-документа (это тоже приводит к ошибке 400)
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
        console.log('Raw body:', buf.toString());
    }
}));

// Выводим информацию об ошибках в полученном запросе
app.use((error, req, res, next) => {
    console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        type: error.type,
        body: error.body
    });
    
    if (error.type === 'entity.parse.failed') {
        console.log('JSON parsing failed - malformed JSON in request body');
    }
    
    res.status(400).json({ 
        error: 'Bad Request', 
        details: error.message 
    });
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
});
```

>Столкнулся с ситуацией, в которой Node.js игнорировал http-запрос в том случае, если в MIME-заголовке отсутствовало поле "Host". Информация полученная от Cloude Haiku: "_HTTP/1.1 requires the Host header to be present in every request. If the header is missing, servers are technically allowed to reject the request_".
