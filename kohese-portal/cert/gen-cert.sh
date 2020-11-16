# Create ca key and cert
openssl req -x509 -config openssl-ca.cnf \
        -newkey rsa:4096 -days 365 -sha512 -nodes \
        -out cacert.pem -outform PEM

# Verify cacert.pem
openssl x509 -in cacert.pem -text -noout

openssl x509 -purpose -in cacert.pem -inform PEM

# Create server key and cert
openssl req -config openssl-server.cnf \
        -newkey rsa:4096 -sha512 -nodes \
        -out servercert.csr -outform PEM

# Verify servercert
openssl req -text -noout -verify -in servercert.csr

# Create necessary openssl files
touch index.txt
echo '01' > serial.txt

# Sign servercert with cacert
openssl ca -config openssl-ca.cnf -policy signing_policy -extensions signing_req \
        -out servercert.pem -days 365 -infiles servercert.csr

# Verify servercert was signed correctly
openssl x509 -in servercert.pem -text -noout

# Remove unnecessary, old files
rm -rf 01.pem index.txt index.txt.attr index.txt.old serial.txt serial.txt.old
