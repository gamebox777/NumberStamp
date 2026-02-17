const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 保存先ディレクトリ
const outputDir = path.resolve(__dirname, '../docs/images');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 画面サイズを大きめに設定
    await page.setViewportSize({ width: 1280, height: 800 });

    console.log('Navigating to http://localhost:5173 ...');
    try {
        // タイムアウトを少し長めに設定
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) {
        console.error('Error: Failed to navigate. Make sure the dev server is running (npm run dev).');
        console.error(e);
        await browser.close();
        process.exit(1);
    }

    console.log('Taking screenshots...');

    // 1. アプリ全体のスクリーンショット
    await page.screenshot({ path: path.join(outputDir, 'app_overview.png') });
    console.log('Saved: app_overview.png');

    // 2. ツールバー周辺のスクリーンショット (左側)
    // クリップ範囲を指定
    await page.screenshot({
        path: path.join(outputDir, 'toolbar.png'),
        clip: { x: 0, y: 0, width: 80, height: 600 }
    });
    console.log('Saved: toolbar.png');

    // 3. 設定パネル周辺のスクリーンショット (右側)
    // ウィンドウ幅が1280なので、右端のパネル（幅300px程度と仮定）を取得
    await page.screenshot({
        path: path.join(outputDir, 'settings_panel.png'),
        clip: { x: 1280 - 320, y: 0, width: 320, height: 600 }
    });
    console.log('Saved: settings_panel.png');

    await browser.close();
    console.log('Done!');
})().catch(err => {
    console.error('An unhandled error occurred:');
    console.error(err);
    process.exit(1);
});
