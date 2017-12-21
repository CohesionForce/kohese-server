function do_it {
  echo "::: Processing $1 repo"
  time node --max_old_space_size=2048 scripts/index-commits.js kdb-altRepo/kdb/$1
}

do_it Administration
do_it BD
do_it BD_CMM
do_it CAC2S
do_it cache
do_it Chiefs
do_it CMMI
do_it DSEEP
do_it IT
do_it Kohese
do_it kohese-kdb
do_it NIMH
do_it Process
do_it Projects
do_it Sandbox
do_it SITE
do_it SPEM
do_it TAIS
do_it Website
do_it Zoro
