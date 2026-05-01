const fs = require('fs');
const path = require('path');

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.match(/\.(tsx|ts|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const files = getFiles('src');
const missingType = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Simple regex to find buttons. This might have false positives in strings/comments but should be mostly okay for JSX.
  const buttonRegex = /<button\b([^>]*)/g;
  let match;
  let fileMatches = [];
  while ((match = buttonRegex.exec(content)) !== null) {
    const attributes = match[1];
    if (!attributes.includes('type=')) {
      fileMatches.push({
        fullMatch: match[0],
        index: match.index
      });
    }
  }
  if (fileMatches.length > 0) {
    missingType.push({ file, matches: fileMatches });
  }
});

console.log(JSON.stringify(missingType, null, 2));
