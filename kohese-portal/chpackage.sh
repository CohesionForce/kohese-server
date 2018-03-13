if [ -h package ]
then
  echo "::: Found package"
  ls -l package | sed 's/^.*package /package /'
else
  echo "!!! Existing package was not found"
fi

pkg="package-$1"

if [ -d $pkg ] 
then
  echo "::: Found target package: $pkg"
else
  echo "*** Error target package was not found:  $pkg"
  exit 4
fi

rm -f package
ln -s $pkg package
echo "+++ Changed package to $pkg"
