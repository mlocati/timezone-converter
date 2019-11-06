#!/bin/sh

set -o errexit
set -o nounset

NO_PUSH_REASON=
if test "${TRAVIS_PULL_REQUEST:-}" != 'false'; then
    NO_PUSH_REASON="Skip pushing to repository, since it's a pull request"
elif test "${TRAVIS_BRANCH:-}" != 'master'; then
    NO_PUSH_REASON="Skip pushing to repository, since the current branch is '${TRAVIS_BRANCH:-}' and not 'master'"
else
    git checkout -f master
fi

printf '(Re)building the output directory\n'
npm run build

if test -n "${NO_PUSH_REASON:-}"; then
    printf '%s\n' "$NO_PUSH_REASON"
    exit 0
fi

cd docs
if test -z "$(git status --porcelain .)"; then
    printf 'No changes in generated assets\n'
    cd ..
    exit 0
fi
printf 'Changes in generated assets\n'
printf 'Committing changes\n'
git add --all .
cd ..
git config user.name 'Michele Locati'
git config user.email 'michele@locati.it'
git commit -m '[skip ci] Assets automatically rebuilt'
wget -q -O - https://raw.githubusercontent.com/mlocati/travisci-github-deploy-key/master/load-deploy-key.sh | sh
git remote add deploy git@github.com:mlocati/timezone-converter.git
git push deploy master:master
