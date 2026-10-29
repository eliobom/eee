const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'dist', 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Replace the overflow: hidden styles
  html = html.replace(
    /html,\s*body\s*{\s*height:\s*100%;\s*}/,
    'html,\n      body {\n        height: auto;\n        margin: 0;\n        padding: 0;\n      }'
  );

  html = html.replace(
    /body\s*{\s*overflow:\s*hidden;\s*}/,
    'body {\n        overflow: auto !important;\n      }'
  );

  html = html.replace(
    /#root\s*{\s*display:\s*flex;\s*height:\s*100%;\s*flex:\s*1;\s*}/,
    '#root {\n        display: flex;\n        height: auto;\n        flex: 1;\n        overflow: auto !important;\n      }'
  );

  fs.writeFileSync(indexPath, html);
  console.log('✅ Fixed scroll styles in index.html');
} else {
  console.log('❌ index.html not found');
}
