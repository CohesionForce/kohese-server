#!/bin/bash -f 

echo "::: Sync KDB Called with: $*"

if [ -f "db.json" ]
then
  echo "::: Exporting kdb"
  node ../scripts/export-kdb.js
else
  touch db.json
fi

if [ "-git" == "$1" ]
then
  echo "::: Checking for local changes"
  changes=`git status -s`
  git status -s | less

  if [ "" != "$changes" ]
  then
    read -p "Changes detected do you want to add all (y/n)?  " choice
    case "$choice" in 
      y|Y ) git add --all;;
      n|N ) echo "--- No changes added";;
      * ) echo "invalid choice"; exit ;;
    esac
  fi
 
  if [ "" != "$changes" ]
  then
    read -p "Changes detected do you want to commit (y/n)?  " choice
    case "$choice" in 
      y|Y ) 
        commit_time=`date +%y%m%d_%H%M%S`
        commit_msg="autocommit $commit_time"
        read -p "Edit or accept commit message: " -e -i "$commit_msg" commit_msg
        git commit -m "$commit_msg" 
        ;;
      n|N ) echo "--- No changes committed";;
      * ) echo "invalid choice"; exit ;;
    esac
  fi
   
  read -p "Fetch upstream changes (y/n)?  " choice
  case "$choice" in 
    y|Y ) 
      echo "::: Fetching upstream changes"
      git fetch origin master
      ;;
    n|N ) echo "--- No changes fetched";;
    * ) echo "invalid choice"; exit ;;
  esac
fi

echo "::: Importing kdb"
node ../scripts/import-kdb.js

kdbDiff=`diff db.json kdb-import.json`
contentDiff=`echo "$kdbDiff" | egrep "^[<>]" | sed -r 's/\: [0-9]+\,?$/: NUM/' | cut -f2- -d' ' | sed 's/,$//' | sort | uniq -c | sed 's/^  *//' | egrep -v "^2 "`| egrep -v "^4  *}$"

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
  echo "$contentDiff"
fi
