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

npm publish

bash ./docs.sh
