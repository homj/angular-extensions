module.exports = {
    '*.{js,jsx,ts,tsx,html,json,css,scss}': ['npx nx format', (files) => `npx eslint ${files.join(' ')}`]
};
