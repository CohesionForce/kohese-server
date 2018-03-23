#!/bin/bash -f

function checkProcess {

  echo "::: Checking $1"
  procPS=`ps -ef | egrep "$1" | sed 's/  */ /g' | egrep -v "grep"`
  procPid=`echo $procPS | sed 's/  */ /g' | cut -f2 -d' '`


  if [ "$procPid" != "" ]
  then
    echo "==> Found \"$1\" as process $procPid"
    if [ $verbose ]
    then
      echo "::: $procPS"
    fi

    if [ $kill ]
    then
      echo "::: Killing $procPid"
      kill -9 $procPid
      sleep 1
      # Need to recheck
      checkProcess $1
    fi
  else
    echo "--- Did not find \"$1\""
  fi
}

# Main processing

params="$*"

for param in  $*
do
  case "$param" in

    -v) 
      verbose=1
      ;;
    -kill) 
      kill=1
      ;;
    *) 
      echo "*** Unexepcted param:  $param"
      exit
      ;;
  esac
done

checkProcess kohese-server 
checkProcess uima-server
