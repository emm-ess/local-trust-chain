module.exports = {
    'src/**/*.ts': ['npm run lint:script --'],
    '{src/**/*.ts,package-lock.json}': () => ['npm run check-types'],
    'package.json': () => ['npm run lint:package-json'],
}
