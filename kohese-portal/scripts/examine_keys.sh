dir=`dirname $1`
model=`echo $dir | sed 's/^.*\///'`
keys=`grep ":" $1 | cut -f1 -d":" | tr -d '\n' | sed 's/^  "//' | sed 's/"  "/, /g' | sed 's/"$/\n/'`
echo "$model: $keys"
