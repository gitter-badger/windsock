cd docs
rm -rf _book
gitbook build
cd _book
git init
git add -A
git commit -m "docs"
git push -f git@github.com:bsawyer/windsock.git master:gh-pages