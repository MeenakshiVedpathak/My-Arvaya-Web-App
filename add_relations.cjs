const fs = require('fs');
const path = require('path');

const dir = 'd:\\arvaya-healthcare-patient-portal\\html_exports';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const routeMap = {
  '/doctors': 'doctors.html',
  '/doctor': 'doctorProfile.html',
  '/labs': 'labs.html',
  '/ambulance': 'ambulance.html',
  '/slot': 'selectSlot.html',
  '/review': 'review.html',
  '/confirmed': 'confirmed.html',
  '/abha': 'abha.html',
  '/records': 'records.html',
  '/analytics': 'analytics.html',
  '/signup': 'signup.html',
  '/wallet': 'wallet.html',
  '/rewards': 'rewards.html',
  '/': 'home.html'
};

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace href="/..." with href="....html"
  content = content.replace(/href="(\/[^"]*)"/g, (match, p1) => {
    const pathname = p1.split(/[?#]/)[0];
    if (routeMap[pathname]) {
      return `href="${routeMap[pathname]}"`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content);
});

console.log('Relations added');
