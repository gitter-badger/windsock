set -e
echo "Enter version: "
read VERSION

read -p "Publishing $VERSION - are you sure? (y/n)" -n 1 -r
echo
if [[ $REPLY =~ ^[y]$ ]]
then
    echo "Publishing $VERSION ..."

    # build
    VERSION=$VERSION npm run build

    # run tests
    npm run test:unit

    #commit
    git add -A
    git commit -m "$VERSION-build"
    npm version $VERSION --message "$VERSION-publish"
    git push origin refs/tags/$VERSION
    git push

    #publish
    npm publish
fi
