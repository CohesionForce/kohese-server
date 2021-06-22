shopt -s;
for file in * ;
do
  {
    echo "*** Processing file $file...";
    xdotool key ctrl+alt+h;
    xdotool key ctrl+alt+h;
    echo "*** Processed file $file";
  }
done

echo "*** all headers updated";
