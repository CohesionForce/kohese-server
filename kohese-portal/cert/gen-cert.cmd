openssl req -x509 -config openssl-ca.cnf -newkey rsa:4096 -sha512 -nodes -out cacert.pem -outform PEM
openssl x509 -in cacert.pem -text -noout
openssl x509 -purpose -in cacert.pem -inform PEM
openssl req -config openssl-server.cnf -newkey rsa:4096 -sha512 -nodes -out servercert.csr -outform PEM
openssl req -text -noout -verify -in servercert.csr
touch index.txt
echo '01' > serial.txt
openssl ca -config openssl-ca.cnf -policy signing_policy -extensions signing_req -out servercert.pem -infiles servercert.csr
openssl x509 -in servercert.pem -text -noout
