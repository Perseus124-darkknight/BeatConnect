const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Capture page errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // Authenticate by setting localStorage
    await page.goto('http://localhost:5173/admin.html');
    await page.evaluate(() => {
        localStorage.setItem('bc_token', 'dev_admin_token');
    });
    
    // Reload as authenticated
    await page.goto('http://localhost:5173/admin.html', { waitUntil: 'networkidle0' });
    
    console.log("Calling openArtistModal()...");
    await page.evaluate(() => {
        window.openArtistModal();
    });
    
    // Get modal display properties
    const modalStyle = await page.evaluate(() => {
        const modal = document.getElementById('artist-modal');
        const style = window.getComputedStyle(modal);
        return {
            classes: modal.className,
            display: style.display,
            opacity: style.opacity,
            zIndex: style.zIndex,
            pointerEvents: style.pointerEvents,
            bounds: modal.getBoundingClientRect()
        };
    });
    
    console.log("Modal Properties:", modalStyle);
    
    await browser.close();
})();
