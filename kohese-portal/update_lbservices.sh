echo "export default () => {" > client/components/common/services/lb-services.js
lb-ng server/server.js >> client/components/common/services/lb-services.js
echo "}" >> client/components/common/services/lb-services.js

