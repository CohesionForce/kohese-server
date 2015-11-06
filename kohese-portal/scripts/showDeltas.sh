git status -s -uno
git diff -W --word-diff

untracked=`git status -su`

if [ "" != "$untracked" ]
then
  echo ":::"
  echo "::: Untracked Files"
  echo ":::"
  echo "$untracked"
  ../scripts/cat_new_items.sh | less
fi
