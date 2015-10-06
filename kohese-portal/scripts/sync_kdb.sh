echo "::: Exporting kdb"
node ../scripts/export-kdb.js

echo "::: Importing kdb"
node ../scripts/import-kdb.js

kdbDiff=`diff db.json kdb-import.json`
contentDiff=`echo "$kdbDiff" | egrep "^[<>]" | sed -r 's/\: [0-9]+\,$/: NUM/' | cut -f2- -d' ' | sed 's/,$//' | sort | uniq -c | sed 's/^  *//' | egrep -v "^2 "`

#echo "::: kdbDiff"
#echo "$kdbDiff"

#echo "::: contentDiff"
#echo "$contentDiff"

if [ "" == "$kdbDiff" ]
then
  echo "::: Synchronized files have same content"
  rm kdb-import.json
elif [ "" == "$contentDiff" ]
then
  echo "::: Replacing db.json with synchronized copy"
  cp kdb-import.json db.json
  rm kdb-import.json
else
  echo "*** Synchronization failed with content differences:"
  echo "$kdbDiff"
fi
