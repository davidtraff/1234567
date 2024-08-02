const puppeteer = require('puppeteer');
const config = require('./config.json');

const tests = [
    /(\d)\1{3,}/,
    /0123|1234|2345|3456|4567|5678|6789/,
    /9876|8765|7654|6543|5432|4321|3210/,
    /69420/,
    /6969/,
];

const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

const MONTH_BUTTON = 'body > main > div > div > div._1maqrx41 > div.obah60.obah6j.obah63 > div:nth-child(3) > div.zn24yu0.zn24yu1 > button:nth-child(2)';
const ORDER_BUTTON = 'body > main > div > div > div._1maqrx41 > div.obah60.obah6j.obah63 > div:nth-child(7) > button';

const COMMERCE_TAG_SELECTOR = 'body > main > div > div > div > commerce-checkout';

const addToCart = async (page) => {
    await page.goto('https://www.comviq.se/mobiler/apple-iphone-15/3972/24/SPECIAL_OFFER-32989?accessories=');
    await page.setViewport({ width: 1080, height: 1024 });

    await page.waitForSelector(MONTH_BUTTON);
    await page.waitForSelector('#onetrust-accept-btn-handler');

    page.click('#onetrust-accept-btn-handler');
    await sleep(1000);

    await page.click(MONTH_BUTTON);

    await sleep(500);

    await page.click(ORDER_BUTTON);
};

const evaluateElement = async (page, selector) => {
    const path = `document.querySelector("body > main > div > div > div > commerce-checkout").shadowRoot.querySelector('${selector}')`;

    return (await page.evaluateHandle(path)).asElement();
};

const getFormField = (page, name) => evaluateElement(page, `[name="${name}"]`);

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await addToCart(page);

    await page.waitForSelector(COMMERCE_TAG_SELECTOR);
    await sleep(1000);

    await (await getFormField(page, 'ssn')).type(config.ssn);
    await (await getFormField(page, 'email')).type(config.email);
    await (await getFormField(page, 'phone')).type(config.phone);

    await sleep(500);

    const newNumberElement = await evaluateElement(page, '[aria-label="Nytt nummer"]');

    await newNumberElement.click();

    await sleep(2000);

    while (true) {
        const items = await page.evaluate(() => {
            const numbers = document
                .querySelector("body > main > div > div > div > commerce-checkout")
                .shadowRoot
                .querySelectorAll('div.cc_wpznfg17.cc_wpznfg18.cc_wpznfg1b');

            return Array.from(numbers).map((elem) => elem.textContent);
        });

        for (const number of items) {
            const match = tests.find((r) => r.test(number));
        
            if (!!match) {
                console.log(match, number);

                console.log("\x07");
                await sleep(12345678);
            }
        }

        await page.reload();
        await page.waitForSelector(COMMERCE_TAG_SELECTOR);
        await sleep(1000);
    }
})();