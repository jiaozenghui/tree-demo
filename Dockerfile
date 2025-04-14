FROM node:20-alpine3.20
WORKDIR /app
COPY package.json ./
RUN npm install --registry https://registry.npmmirror.com/  --legacy-peer-deps
COPY . .
RUN npm run build

COPY /dist /dist
ADD default.conf /etc/nginx/conf.d/

 
# 暴露80端口
EXPOSE 80
 
# 启动Nginx服务器
CMD ["nginx", "-g", "daemon off;"]