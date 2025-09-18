# sudo npm install nodejs
# sudo npm install npm
# sudo npm install -g forever

npm run build
ssh -i $1 $2 'sudo rm -rf /tmp/time-dedicate'
scp -i $1 -r ./dist/  $2:/tmp/time-dedicate
#
ssh -i $1 $2 'sudo rm -rf /var/www/html/*'
ssh -i $1 $2 'sudo cp -r /tmp/time-dedicate/* /var/www/html/'
