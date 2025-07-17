# 部署指南

## 本地构建

### 1. 安装依赖
```bash
npm install
```

### 2. 构建生产版本
```bash
npm run build
```

构建完成后，会在 `dist` 目录下生成静态文件。

### 3. 预览构建结果
```bash
npm run preview
```

## 服务器部署

### 方法一：使用Nginx

1. 将 `dist` 目录下的所有文件上传到服务器
2. 配置Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # 处理Vue Router的history模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 方法二：使用Apache

1. 将 `dist` 目录下的所有文件上传到服务器
2. 在网站根目录创建 `.htaccess` 文件：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 方法三：使用Docker

1. 创建 `Dockerfile`：

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 创建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. 构建并运行Docker镜像：

```bash
docker build -t zhiyou-erp-admin .
docker run -p 8080:80 zhiyou-erp-admin
```

## 环境变量配置

在 `.env.production` 文件中配置生产环境变量：

```env
# API基础URL
VITE_API_BASE_URL=https://api.your-domain.com

# 应用标题
VITE_APP_TITLE=志友ERP管理后台

# 是否启用调试模式
VITE_DEBUG=false
```

## 性能优化建议

1. **启用Gzip压缩**
2. **配置CDN加速**
3. **启用浏览器缓存**
4. **使用HTTPS**
5. **启用HTTP/2**

## 监控和日志

建议配置：
- 错误监控（如Sentry）
- 性能监控
- 访问日志分析 