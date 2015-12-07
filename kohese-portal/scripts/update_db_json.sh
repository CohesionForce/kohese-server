kdbDir=`pwd`
echo "::: Importing kdb"
cd ..
node ./server/kdb.js

cd $kdbDir
kdbDiff=`diff db.json kdbStore.json`

if [ "" == "$kdbDiff" ]
then
  echo "::: Synchronized files have same content"
else
  echo "::: Replacing db.json with synchronized copy"
  cp kdbStore.json db.json
fi

