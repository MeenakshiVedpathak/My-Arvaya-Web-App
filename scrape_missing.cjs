const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const routes = [
  { path: '/wallet', name: 'wallet' },
  { path: '/rewards', name: 'rewards' }
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set localStorage
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    localStorage.setItem('arvaya_user', JSON.stringify({ name: "User", email: "user@example.com" }));
    localStorage.setItem('arvaya_token', "mock_token");
  });

  const exportsDir = 'd:\\arvaya-healthcare-patient-portal\\html_exports';

  for (let r of routes) {
    console.log('Scraping ' + r.name);
    await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle0' });
    
    // Wait for skeletons to resolve
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    let html = await page.evaluate(() => {
      // Remove scripts
      const scripts = document.querySelectorAll('script');
      scripts.forEach(s => s.remove());
      
      // Clean up injected vite styles if any
      const viteStyles = document.querySelectorAll('style[data-vite-dev-id]');
      viteStyles.forEach(s => s.remove());
      
      const head = document.head;
      const lucideScript = document.createElement('script');
      lucideScript.src = "https://unpkg.com/lucide@latest";
      head.appendChild(lucideScript);
      
      return `<!DOCTYPE html>\n<html lang="en">\n<head>\n${head.innerHTML}\n<link rel="stylesheet" href="./global.css">\n</head>\n<body>\n${document.body.innerHTML}\n<script>lucide.createIcons();</script>\n</body>\n</html>`;
    });

    fs.writeFileSync(path.join(exportsDir, `${r.name}.html`), html);
  }

  await browser.close();
  console.log("Done");
})();
