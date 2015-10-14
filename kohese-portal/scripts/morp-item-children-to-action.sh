echo "::: Finding children items of $1"

grep $1 export/Item/*.json | grep parentId | cut -f1 -d':' | while read line; 
do 
  echo "::: Processing $line"
  git mv $line export/Action/; 
done
