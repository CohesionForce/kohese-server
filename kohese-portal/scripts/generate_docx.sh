
kuid=$1
shift
options=$*
 
echo "::: Generating Document for $kuid using $options"
node scripts/dump-item-to-markdown.js $kuid
md_file=`ls -1 tmp_reports/dump.$kuid.*.md`
docx_file=`ls -1 tmp_reports/dump.$kuid.*.md | sed 's/\.md$/.docx/'` 

echo "::: Found $md_file"
echo "::: Generating $docx_file"
pandoc -f markdown -t docx $options -o "${docx_file}" "${md_file}"
