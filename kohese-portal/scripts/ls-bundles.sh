sed 's/</\n</g' build/client/bundle/index.html | grep '<script' | sed 's/^.*src=\"//' | sed 's/".*//'
