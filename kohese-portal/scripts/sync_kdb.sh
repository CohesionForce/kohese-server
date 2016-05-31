#!/bin/bash -f 

echo "::: Sync KDB Called with: $*"

kdbDir=`pwd`

if [ -f "db.json" ]
then
  echo "::: Exporting kdb"
  cd ..
  node ./scripts/export-kdb.js
  cd $kdbDir
else
  touch db.json
fi

if [ "-git" == "$1" ]
then
  cd kohese-kdb
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

      echo "::: Checking for updates to db.json"
      cd ..
      ../scripts/update_db_json.sh
      cd $kdbDir

      ;;
    n|N ) echo "--- No changes fetched";;
    * ) echo "invalid choice"; exit ;;
  esac

  echo "::: Checking status"
  git_status=`git status -sb`
  echo "$git_status"
  git_status_ahead=`git status -sb | head -1 | egrep "\[ahead"`

  if [ "" != "$git_status_ahead" ]
  then
    read -p "Push changes (y/n)?  " choice
    case "$choice" in
      y|Y )
        echo "::: Pushing changes upstream"
        git push origin master
        ;;
      n|N ) echo "--- No changes pushed";;
      * ) echo "invalid choice"; exit ;;
    esac
  fi

  cd ..

fi
