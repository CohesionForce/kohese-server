#!/bin/bash -f

function checkProcess {

  echo "::: Checking $1"
  procPS=`ps -ef | egrep "$1" | sed 's/  */ /g' | egrep -v "egrep"`
  procPid=`echo $procPS | sed 's/  */ /g' | cut -f2 -d' '`


  if [ "$procPid" != "" ]
  then
    echo "==> Found: $procPS"
    echo "::: Killing $procPid"
    kill -9 $procPid
  fi
}

checkProcess "node ."
checkProcess uima-server
