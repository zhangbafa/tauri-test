import http from 'http'
import url from 'url'

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
    // 设置响应头以支持跨域请求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求（OPTIONS 请求）
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    // 解析 URL 和查询参数
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;
    const username = query.username;
    const password = query.password;

    // 验证用户名和密码
    let isValid = false;
    if (username === 'zhang' && password === '123') {
        isValid = true;
    }

    // 设置响应状态码
    res.statusCode = 200;
    // 设置响应头，指定响应内容类型为 JSON
    res.setHeader('Content-Type', 'application/json');

    // 构建 JSON 响应
    const responseData = {
        status: isValid
    };

    // 将 JSON 对象转换为字符串并发送响应
    res.end(JSON.stringify(responseData));
});

// 让服务器监听 3000 端口
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});