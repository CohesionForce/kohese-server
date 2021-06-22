 # Copyright (c) 2021 CohesionForce inc. | www.CohesionForce.com | info@CohesionForce.com
 #
 # Licensed under the Apache License, Version 2.0 (the "License");
 # you may not use this file except in compliance with the License.
 # You may obtain a copy of the License at
 #
 #      http://www.apache.org/licenses/LICENSE-2.0
 #
 # Unless required by applicable law or agreed to in writing, software
 # distributed under the License is distributed on an "AS IS" BASIS,
 # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 # See the License for the specific language governing permissions and
 # limitations under the License.
 #


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
