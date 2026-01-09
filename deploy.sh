set -e
pnpm run build
cd dist
cp index.html 404.html
git init
git checkout -b gh-pages
git add -A
git commit -m 'deploy'
git push -f https://github.com/BYWled/admin-system.git gh-pages
cd -