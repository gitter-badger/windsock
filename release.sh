set -e
echo "Enter version: "
read VERSION
echo "Publishing $VERSION"

VERSION=$VERSION npm run build

npm run test:unit

#this will create a version commit and tag
npm version $VERSION --message "$VERSION"
git push origin refs/tags/v$VERSION
git push

cd docs
rm -rf _book
gitbook build
cd _book
git init
git add -A
git commit -m "$VERSION-docs"
git push -f git@github.com:bsawyer/windsock.git master:gh-pages
