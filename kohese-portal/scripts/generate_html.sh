
kuid=$1
shift
options=$*
 
echo "::: Generating Document for $kuid using $options"
node scripts/dump-item-to-markdown.js $kuid
md_file=`ls -1 reports/dump.$kuid.*.md`
html_file=`ls -1 reports/dump.$kuid.*.md | sed 's/\.md$/.html/'` 

echo "::: Found $md_file"
echo "::: Generating $html_file"
pandoc -f markdown -t html5 $options "${md_file}" > "${html_file}"
