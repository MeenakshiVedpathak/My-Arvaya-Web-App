const fs = require('fs');
const path = require('path');

const dir = 'd:\\arvaya-healthcare-patient-portal\\html_exports';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace src="/logo.png" with src="./logo.png", etc.
  // We look for src="/ and replace with src="./
  content = content.replace(/src="\//g, 'src="./');
  
  // Replace background-image url('/...') with url('./...')
  content = content.replace(/url\('\//g, "url('./");
  content = content.replace(/url\("\//g, 'url("./');

  fs.writeFileSync(filePath, content);
});

console.log('Assets fixed');
