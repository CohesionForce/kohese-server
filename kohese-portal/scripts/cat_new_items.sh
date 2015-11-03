
git status --short | egrep "^\?\? " | cut -f2 -d' ' | while read line
do   
  echo "::: $line"
  cat $line
done
