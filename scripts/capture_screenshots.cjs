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

    const loadApp = async () => {
        console.log('Navigating to http://localhost:5173 ...');
        try {
            await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 60000 });
        } catch (e) {
            console.error('Error: Failed to navigate. Make sure the dev server is running (npm run dev).');
            console.error(e);
            await browser.close();
            process.exit(1);
        }
    };

    await loadApp();
    console.log('Taking screenshots...');

    // 1. アプリ全体のスクリーンショット
    await page.screenshot({ path: path.join(outputDir, 'app_overview.png') });
    console.log('Saved: app_overview.png');

    // 2. ツールバー周辺のスクリーンショット (左側)
    // 縦幅を800px全体に広げる
    await page.screenshot({
        path: path.join(outputDir, 'toolbar.png'),
        clip: { x: 0, y: 0, width: 80, height: 800 }
    });
    console.log('Saved: toolbar.png');

    // 3. 設定パネル周辺のスクリーンショット (右側)
    await page.screenshot({
        path: path.join(outputDir, 'settings_panel.png'),
        clip: { x: 1280 - 320, y: 0, width: 320, height: 800 }
    });
    console.log('Saved: settings_panel.png');

    // --- 各モードの動作キャプチャ ---

    const clickCanvas = async (x, y) => {
        await page.mouse.click(x, y);
        // 少し待つ
        await page.waitForTimeout(200);
    };

    // 4. スタンプモード
    await loadApp();
    // スタンプモードを選択 (デフォルトだが念のためクリック)
    // Tooltipのテキストで検索してクリック
    const stampBtn = page.locator('.tooltip-container', { hasText: 'スタンプ (Stamp)' }).first();
    if (await stampBtn.count() > 0) {
        await stampBtn.click();
    }
    
    // キャンバスにいくつかスタンプを押す
    await clickCanvas(300, 300);
    await clickCanvas(400, 300);
    await clickCanvas(500, 300);
    
    await page.screenshot({ path: path.join(outputDir, 'mode_stamp.png') });
    console.log('Saved: mode_stamp.png');

    // 5. 矩形モード
    await loadApp();
    const rectBtn = page.locator('.tooltip-container', { hasText: '矩形 (Rectangle)' }).first();
    await rectBtn.click();

    // ドラッグして矩形を描く
    await page.mouse.move(300, 200);
    await page.mouse.down();
    await page.mouse.move(600, 400);
    await page.mouse.up();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(outputDir, 'mode_rectangle.png') });
    console.log('Saved: mode_rectangle.png');

    // 6. テキストモード
    await loadApp();
    const textBtn = page.locator('.tooltip-container', { hasText: 'テキスト (Text)' }).first();
    await textBtn.click();

    // テキスト配置
    await clickCanvas(400, 300);
    
    await page.screenshot({ path: path.join(outputDir, 'mode_text.png') });
    console.log('Saved: mode_text.png');

    // 7. 矢印 (Selectモードでスタンプからドラッグ)
    await loadApp();
    // まずスタンプを1つ置く
    await clickCanvas(300, 300);
    
    // 選択モードに切り替え
    const selectBtn = page.locator('.tooltip-container', { hasText: '選択 (Select)' }).first();
    await selectBtn.click();

    // スタンプを選択 (300, 300)
    await clickCanvas(300, 300);
    
    // ハンドルが表示されるのを待つ (少し時間がかかるかも)
    await page.waitForTimeout(500);

    // ハンドル位置を推定 (スタンプの右側にあると仮定)
    // 半径20px + マージン?
    // 実装依存だが、おおよそ右側 (300+40, 300) あたりをドラッグしてみる
    // 矢印ハンドルは ArrowItem.jsx ではなく CanvasArea.jsx で renderArrowHandles で描画される
    // 位置は x + radius + 15 くらい
    const startX = 300 + 40; 
    const startY = 300;
    
    // ハンドルからドラッグして矢印を引く
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(500, 400); // 斜めに引く
    await page.mouse.up();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(outputDir, 'mode_arrow.png') });
    console.log('Saved: mode_arrow.png');

    await browser.close();
    console.log('All screenshots saved!');
})().catch(err => {
    console.error('An unhandled error occurred:');
    console.error(err);
    process.exit(1);
});
