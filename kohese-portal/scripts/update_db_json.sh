echo "::: Importing kdb"
node ../scripts/import-kdb.js

kdbDiff=`diff db.json kdb-import.json`

if [ "" == "$kdbDiff" ]
then
  echo "::: Synchronized files have same content"
  rm kdb-import.json
else
  echo "::: Replacing db.json with synchronized copy"
  cp kdb-import.json db.json
  rm kdb-import.json
fi

