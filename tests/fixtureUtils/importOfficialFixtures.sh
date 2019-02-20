#!/bin/bash
# Copies the test fixtures from the official Rockstar site,
# and creates a test suite which uses them.

cd "`dirname "$0"`/.."  # run from this script's parent directory

if [[ -z $TMPDIR ]]; then
  echo "\$TMPDIR must be set!"
  exit 1
elif [[ $TMPDIR == */ ]]; then
  rockstar_path="${TMPDIR}rockstar"
else
  rockstar_path="$TMPDIR/rockstar"
fi

echo "Cloning the rockstar repo..."
rm -rf "$rockstar_path"
git clone https://github.com/RockstarLang/rockstar.git "$rockstar_path"

echo "Cleaning up any existing test fixtures..."
rm -rf fixtures/official
mkdir -p fixtures/official

echo "Copying test fixtures..."
echo "Official test fixtures from https://github.com/RockstarLang/rockstar/tree/master/tests/fixtures." > fixtures/official/README.md
cp -R "$rockstar_path/tests/fixtures/" fixtures/official

echo "Cleaning up $rockstar_path..."
rm -rf "$rockstar_path"

echo "Creating the test suite..."
fixtureUtils/createTestSuites.js official

echo "Done."
