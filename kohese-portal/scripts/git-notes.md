# Sites
http://www.nodegit.org/api/
https://github.com/nodegit/nodegit/tree/master/generate/input
https://github.com/nodegit/nodegit/tree/master/examples
https://libgit2.github.com/libgit2/#HEAD
https://libgit2.github.com/docs/guides/101-samples/


# history of diffs and follow file renames
#  - to find rename search for similarity index
```
git log --follow -p --word-diff Action/e8d583d0-6780-11e5-9d66-3bceb4f8ff0c.json

git log --name-status -M
```

# graphical commit history
```
git log --graph
```

# log across branches
```
git log --all --name-status --date-order --graph
```

# simplified view of log
```
git log --oneline
```

# to find recent head refs
```
git reflog
```

## to find recent head refs with associated date
```
git reflog --date=iso
```

# to find status of working tree and index (short)
```
git status -s
```

# to find diffs of files that have already been added to index
```
git diff --cached --word-diff
```

## or
```
git diff --staged --word-diff
```

# to find diffs between working dir and latest upstream that has been fetched
```
git diff --word-diff ..origin/master
```

# to find the commits that have been fetched that are not merged
```
git log ..origin/master
```

# to find the files changed with each commit
```
git log --name-status
```

## or
```
git log --name-status [commit]
```

## or with just filenames
```
git log --name-only
```

## or
```
git log --stat
```

# to find which commit deleted a file
```
git log --diff-filter=D --summary -- [filename]
```

# to restore the file
```
git checkout [commit]~1 [filename]
```

## or to git a specific version
```
git checkout [commit before it was deleted] [filename]
```

# to reset corrupted git index
```
rm .git/index
git reset
```

---
# Clone Repository

## To create a clone that share the same repo
A shared repo will have the same remote and local refs.  This is a useful approach to provide a seperate working area
that does not require duplicated storage (except the working tree).

```
git clone -s [source-repo] [new-repo]
```

---
# Manage Bundles

Reference [Pro-Git Bundle Page](https://git-scm.com/docs/git-bundle)

## To create bundle on modified machine
```
git bundle create [file.bundle] [from]..[to]
```
		
## To load bundle on target machine
```
git bundle verify [file.bundle]  
git fetch [file.bundle] master:master
```

--- 
# Tagging Commits

## To see existing tags
```
git tag
```

## To tag the current commit
```
git tag [tag-name]
```

## To tag a prior commit
```
git tag [tag-name] [commit]
```