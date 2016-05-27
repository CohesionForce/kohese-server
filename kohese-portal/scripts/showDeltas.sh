
function showDetails {

  echo ""
  echo "::: $1"
  repo=`echo $1 | sed 's/\(.*\/Repository\/[^\/]*\).*/\1/'`
  itemName=`grep "\"name\":" $1 | sed 's/^.* "//' | sed 's/\".*$//'`
  echo "ItemName: $itemName"

  if [ "$repo" != "" ]
  then
    echo "Repo:     $repo"
    repoName=`grep "\"name\":" $repo.json | sed 's/^.* "//' | sed 's/\".*$//'`
    echo "RepoName: $repoName"
  fi
}

function showModified {
  echo ":::"
  echo "::: Modified"
  echo ":::"
  git status -s -uno | sed 's/^ *//' | cut -f2 -d' ' | while read line
  do
 
    showDetails $line 
    git diff --word-diff $line

  done
}

function catNewFiles {

  echo ""
  echo ":::"
  echo "::: Untracked Files"
  echo ":::"

  untracked=`git status -su`
  if [ "" != "$untracked" ]
  then
    git status --short | egrep "^\?\? " | cut -f2 -d' ' | while read line
    do
      showDetails $line   
      cat $line
      echo ""
    done
  fi
}

function showChanges {
  showModified
  catNewFiles
}

showChanges | less
