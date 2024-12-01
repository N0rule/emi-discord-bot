const fs = require('fs');
const path = require('path');

try {
    // Path to the package.json file
    const packagePath = path.join(
        process.cwd(),
        'node_modules',
        '@lavaclient',
        'plugin-queue',
        'package.json'
    );

    // Read the current package.json
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Check if the exports field exists and needs updating
    if (packageJson.exports && packageJson.exports['./register']) {
        // Update the paths
        packageJson.exports['./register'] = {
            default: './dist/register.js',
            types: './dist/register.d.ts'
        };

        // Write the updated package.json back to file
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        console.log('Successfully updated @lavaclient/plugin-queue package.json paths');
    } else {
        console.log('No update needed for @lavaclient/plugin-queue package.json');
    }
} catch (error) {
    console.error('Failed to update @lavaclient/plugin-queue package.json:', error.message);
    // Don't exit with error code as this shouldn't break the installation
    process.exit(0);
}