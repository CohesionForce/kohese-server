#!/bin/bash -f

start_time=`date +%y%m%d_%H%M%S`
portal_log="$start_time.portal.log"
uima_log="$start_time.uima.log"

echo "::: Check for existing Kohese servers"
./scripts/checkKohese.sh -kill
sleep 2

echo "::: Starting Kohese Portal at $start_time"

nohup node . $* 2>&1 > logs/$portal_log &

rm -f logs/LATEST.portal.log
ln -s $portal_log logs/LATEST.portal.log 

echo "::: Starting UIMA Server at $start_time"

cd ../uima-server
nohup ./kohese_server 2>&1 > ../kohese-portal/logs/$uima_log &
cd ../kohese-portal

rm -f logs/LATEST.uima.log
ln -s $uima_log logs/LATEST.uima.log 

