# Documentation
https://tools.ietf.org/html/rfc5280
https://www.openssl.org/docs/man1.1.1/

# Terms
Certificate Generation Program   - (CGP)
Certificate Authority            - (CA)
Certificate Revocation List      - (CRL)
Public Key Cryptography Standard - (PKCS)
[openssl-ca.cnf]     - configuration file for an openSSL Certificate Authority
[openssl-server.cnf] - configuration file for an openSSL Server Certificate
[alternate_names]  - topic at the bottom of openssl-server.cnf
[commonName]       - field under [ca_distinguished_name] topic and [server_distinguished_name] topic
[default_days]     - field under the [ca] topic in [openssl-ca.cnf]
[default_crl_days] - field under the [ca] topic in [openssl-ca.cnf]
[ctrl+shift+i] - Chrome Developer Tools shortcut

# Certificate Generation
DO NOT LEAVE ANY FIELDS BLANK. THE DEFAULTS DO NOT INPUT THEMSELVES; they are purely for reference.

The Subject Alternative Name (SAN) is most important. You should change the [alternate_names] topic in openssl-server.cnf to match your needs. for example: DNS.1 could be your website name (exactly) or the name of your institution, or anything else.

However...
THE [commonName] FIELD MUST MATCH ANY [alternate_names] FIELD.

1. Navigate to /cert in your file directory. (git -> kohese-server -> kohese-portal -> cert)
2. Do [./gen-cert.cmd] to run the Certificate Generation Program (CGP).
3. Make sure your [commonName] field matches one of the DNS.x fields in [alternate_names] in [openssl-server.cnf].
4. Finally, the CGP will ask if you want to sign[y/n] and then commit[y/n]. Enter [y] for both.

After generation, you should have 5 extra files: [cacert.pem], [cakey.pem], [servercert.csr], [servercert.pem], and [serverkey.pem].These are not to be deleted. The CGP auto-deletes for you the temporary and unnecessary files.

# Certificate Importation Using Chrome
It is recommended to remove any previously generated certificates before importing the newest [cacert.pem].

1. Open a new tab and navigate to settings
2. In the left-side pane, navigate to 'privacy and security'
3. Under 'privacy and security', choose 'Security'
4. In Security, scroll to the bottom and choose 'Manage certificates'
5. In 'Manage certificates', click on Authorities. Note: The 'Your certificates', 'Servers', and 'Others' sections are unneeded.
6. In Authorities, click 'Import'.

***LINUX***
You now should be looking at your system files folder which Chrome has opened. You must navigate to the following:
  1. git -> kohese-server -> kohese-portal -> cert -> [cacert.pem]
  2. Click [cacert.pem], and (while highlighted) press import.
***END***

***Windows***
You now should be looking at the certificates and authorities wizard.
  1. Find your certificate and import as 'root authority'. This step is very important.
  2. Import the certificate.
***END***

# Certificate Validation Confirmation
An easy way to find your certificate when multiple with the same name are present is by looking at the timestamp. Usually, the one you want was created last.

Find your certificate in the Authorities tab. If your information has been entered correctly you will find it alphabetically in the listed Authorities with the prefix org-[organizationName].

You may check the validity of your certificate in multiple ways:

**In the Settings under listed Authorities:**
1. Click on the down-facing chevron to the right of your org-[organizationName]
2. Find the needed certificate
3. Click on the vertical dots
4. Select 'view' in the drop-down menu
5. Verify your credentials in the details section.
    1. Certificate Signature Algorithm - shows PKCS, [default_md], and Asymmetric encryption datum
    2. Issuer - Shows optional [organizationName]/[organizationalUnitName] fields information
    3. Validity
    4. Not Before is usually okay
    5. Not After refers to the CRL decay, not your [default_days] field because [default_crl_days] should always be shorter.

**Navigate to your web page and check the lock icon to the left of your address in the address bar:**
1. If the icon is 'locked', you are secure. If not, it will give you a warning with the relevant error.

**On your web-page:**
1. open the developer menu using [ctrl+shift+i] and navigate to the 'Security' section from the top, in-line menu.
2. This page will show you all information relevant to the security (HTTPS) status of your web-page.

# TroubleShooting

The most common issue one might see is the [COMMON_NAME_INVALID] error. This error does not necessarily refer to the [commonName] field, but rather it is used as a catch-all for most certificate invalidity issues regarding information contained within the certificate. Usually, this error presents itself when the [commonName] field is different from some [DNS.x] field in the [alternate_names] topic or is missing entirely. This issue will show on the error page when trying to navigate to an insecure site, but more information may be gleaned by opening the developer tools using [ctrl+shift+i] and navigating to the 'Security' tab within the top in-line menu. If within the 'Security' tab of the dev tools the error [SUBJECT_ALTERNATIVE_NAMES_MISSING] is seen, then the [alternate_names] field has been deleted or corrupted and MUST be repaired before any certificate will validate with Chrome. Otherwise, the [COMMON_NAME_INVALID] error paired with [Certificate-missing] means the [commonName] does not match a [DNS.x] field in the [alternate_names] topic.

Another issue commonly seen is [ERR_CERT_AUTHORITY_INVALID]. This is more severe and indicates the CGP failed to produce a viable [cacert.pem] using our [servercert.pem] produced from [openssl-server.cnf] being validated by our CA, [openssl-ca.cnf]. This issue should not occur unless source code (in [./gen-cert.cmd], [openssl-ca.cnf], and/or [openssl-server.cnf]) has been modified. The most common cause of this error is failure to import the certificate within the 'Authorities' tab from within Chrome settings. Another common cause of this issue is when learning to create multiple certificates with the same subject. The [unique_subject] field under the topic [ca] in [openssl-ca.cnf] allows for the creation of multiple certificates which contain the same subject. If the value yes is given, the valid certificate entries in the database must have unique subjects. if the value no is given, several valid certificate entries may have the exact same subject. It is recommended to use the value no, especially if combined with the -selfsign command line option.

The last common issue seen is [ERR_SSL_VERSION_OR_CIPHER_MISMATCH]. This means the certificate encryption schema has been improperly coded and does not match any openSSL ciphers currently available. This can occur for any number of reasons. You may check the list of available ciphers by typing 'openssl ciphers' within your terminal.

[COMMON_NAME_INVALID]
  1. Delete ONLY the files [cacert.pem], [cakey.pem], [servercert.csr], [servercert.pem,] and [serverkey.pem].
  2. You should be left with [.gitignore], [gen-cert.cmd], [openssl-ca.cnf], [openssl-server.cnf], and [instructions.md]
  3. Repeat the steps in  # Certificate Generation, and make sure you input the correct names in every field.
  4. Follow the steps in  # Certificate Validation; Delete any previous versions of your certificate from Authorities.

[ERR_CERT_AUTHORITY_INVALID]
  1. Check rfc5280 and OpenSSL Documentation to make sure any changes made to the source is(are) valid.
  2. If step one cannot be reasonably verified within that documentation, revert changes made to, and delete all files other than   [.gitignore], [gen-cert.cmd], [instructions.md], [openssl-ca.cnf], and [openssl-server.cnf].

[ERR_SSL_VERSION_OR_CIPHER_MISMATCH]
  1. One has used the wrong amount of bits to encrypt
  2. Forgotten steps in the certificate formation process
  3. Use of mismatched encryption algorithms that do not conform to the list of openSSL ciphers
  4. This error is also used if the Broswer simply does not recognize the format, even if the certificate is formed correctly.
