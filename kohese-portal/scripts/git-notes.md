# Sites
http://www.nodegit.org/api/
https://github.com/nodegit/nodegit/tree/master/generate/input
https://github.com/nodegit/nodegit/tree/master/examples
https://libgit2.github.com/libgit2/#HEAD
https://libgit2.github.com/docs/guides/101-samples/


# history of diffs and follow file renames
#  - to find rename search for similarity index
git log --follow -p --word-diff Action/e8d583d0-6780-11e5-9d66-3bceb4f8ff0c.json

git log --name-status -M

# graphical commit history
git log --graph

# log across branches
git log --all --name-status --date-order --graph

# simplified view of log
git log --oneline

# to find recent head refs
git reflog

## to find recent head refs with associated date
git reflog --date=iso

# to find status of working tree and index (short)
git status -s

# to find diffs of files that have already been added to index
git diff --cached --word-diff
## or
git diff --staged --word-diff

# to find diffs between working dir and latest upstream that has been fetched
git diff --word-diff ..origin/master

# to find the commits that have been fetched that are not merged
git log ..origin/master

# to find the files changed with each commit
git log --name-status

git log --name-status <commit>

## or with just filenames
git log --name-only

## or
git log --stat

# to find which commit deleted a file
git log --diff-filter=D --summary -- <filename>

# to restore the file
git checkout <commit>~1 <filename>
## or to git a specific version
git checkout <commit before it was deleted> <filename>

# to reset corrupted git index
rm .git/index
git reset
