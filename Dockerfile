FROM nginx:1.21-alpine

COPY /dist /dist
ADD default.conf /etc/nginx/conf.d/

 
# 暴露80端口
EXPOSE 80
 
# 启动Nginx服务器
CMD ["nginx", "-g", "daemon off;"]