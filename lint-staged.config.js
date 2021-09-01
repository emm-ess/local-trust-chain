module.exports = {
    'src/**/*.ts': ['npm run lint'],
    '{src/**/*.ts,package-lock.json}': () => ['npm run check-types'],
}
