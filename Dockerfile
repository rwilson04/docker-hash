FROM shinymayhem/node

EXPOSE 80

COPY app.js /opt/node/app.js

CMD sudo node /opt/node/app.js
