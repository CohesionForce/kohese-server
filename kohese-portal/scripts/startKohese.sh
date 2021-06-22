#
# Copyright (c) 2021 CohesionForce Inc | www.CohesionForce.com | info@CohesionForce.com
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


#!/bin/bash -f

start_time=`date +%y%m%d_%H%M%S`
portal_log="$start_time.portal.log"
uima_log="$start_time.uima.log"

echo "::: Check for existing Kohese servers"
./scripts/checkKohese.sh -kill
sleep 2

echo "::: Starting Kohese Portal at $start_time"

nohup npm run server $* 2>&1 > logs/$portal_log &

rm -f logs/LATEST.portal.log
ln -s $portal_log logs/LATEST.portal.log

echo "::: Starting UIMA Server at $start_time"

cd ../uima-server
nohup ./kohese_server 2>&1 > ../kohese-portal/logs/$uima_log &
cd ../kohese-portal

rm -f logs/LATEST.uima.log
ln -s $uima_log logs/LATEST.uima.log

