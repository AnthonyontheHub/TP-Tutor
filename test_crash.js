import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  console.log('Navigating...');
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle2' });

  // Let's click "THE ARCHIVE"
  console.log('Finding The Archive button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const guestBtn = btns.find(b => b.innerText.includes('PROCEED IN GUEST MODE'));
    if (guestBtn) guestBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT:', text);
  try {
    const archiveBtn = await page.$$("::-p-text(THE ARCHIVE)");
    if (archiveBtn.length > 0) {
      console.log('Clicking The Archive...');
      await archiveBtn[0].click();
      await new Promise(r => setTimeout(r, 2000)); // wait for crash to register
    } else {
      console.log('Button not found!');
      // Maybe we need to pass the login screen first
      const input = await page.$('input');
      if (input) {
        console.log('Typing name...');
        await input.type('Anthony');
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 2000));
        
        const archiveBtn2 = await page.$$("::-p-text(THE ARCHIVE)");
        if (archiveBtn2.length > 0) {
          console.log('Clicking The Archive...');
          await archiveBtn2[0].click();
          await new Promise(r => setTimeout(r, 2000));
        } else {
           console.log('Still no button');
        }
      }
    }
  } catch(e) {
    console.error('Script error:', e);
  }
  
  await browser.close();
  process.exit(0);
})();