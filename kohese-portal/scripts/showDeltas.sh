#
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
