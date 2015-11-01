
git diff --word-diff

echo ":::"
echo "::: Untracked Files"
echo ":::"
../scripts/cat_new_items.sh | less
