rm -rf uiContent
mkdir uiContent
cd frontend
npm install -g increase-memory-limit
/usr/local/nodejs/bin/increase-memory-limit
if [ $? -eq 0 ];then
   echo "increase-momory limit OK"
else
   exit
fi
# npm install
yarn
if [ $? -eq 0 ];then
   echo "yarn OK"
else
   exit 
fi

cp -f src/assets/tmp/map/nanhai.js node_modules/echarts/lib/coord/geo/fix

#npm audit fix
ng build --prod
if [ $? -eq 0 ];then
   echo "ng build OK"
else
   exit 
fi
rm -rf ../uiContent/*
cp -R dist/* ../uiContent/
if [ $? -eq 0 ];then
   echo "cp dist OK"
   cd ..
else
   exit 
fi


