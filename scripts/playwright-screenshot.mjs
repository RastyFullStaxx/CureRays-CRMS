import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

const [, , rawUrl = 'http://127.0.0.1:3011/dashboard', rawOutput = '/tmp/curerays-screenshot.png', rawViewport = '1440x1000'] = process.argv;
const [width = 1440, height = 1000] = rawViewport.split('x').map((value) => Number.parseInt(value, 10));
const output = resolve(rawOutput);
const localLibs = resolve('.playwright-libs/root/usr/lib/x86_64-linux-gnu');

process.env.TMPDIR ||= '/tmp';
process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH
  ? `${localLibs}:${process.env.LD_LIBRARY_PATH}`
  : localLibs;

await mkdir(dirname(output), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: {
    width: Number.isFinite(width) ? width : 1440,
    height: Number.isFinite(height) ? height : 1000,
  },
});

await page.goto(rawUrl, { waitUntil: 'networkidle', timeout: 45_000 });
await page.screenshot({ path: output, fullPage: true });
await browser.close();

console.log(`screenshot:${output}`);
