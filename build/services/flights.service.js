"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer-extra");
async function getFlightsResults(params) {
    const { origin, destination, departureDate, returnDate } = params;
    const browser = await puppeteer.launch({
        // Uncomment to view browser
        // headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--single-process", "--no-zygote"],
    });
    const page = await browser.newPage();
    page.setViewport({
        width: 1920,
        height: 1080,
    });
    await page.goto('https://www.google.com/travel/flights?hl=es-ES&curr=EUR', { waitUntil: 'load', timeout: 0 });
    // Cookie Consent
    const [button] = await page.$x("//button[contains(., 'Aceptar todo')]");
    await button.click();
    const selectorCityInputs = '.e5F5td';
    await page.waitForSelector(selectorCityInputs);
    const inputs = await page.$$(selectorCityInputs);
    // COMPLETE INPUTS
    // type "from"
    await inputs[0].click();
    await page.waitForTimeout(1500);
    await page.keyboard.type(origin);
    await page.waitForTimeout(1500);
    await page.keyboard.press("Enter");
    // type "to"
    await inputs[1].click();
    await page.waitForTimeout(1500);
    await page.keyboard.type(destination);
    await page.waitForTimeout(1500);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);
    // type "departureDate"
    await page.waitForSelector('input[aria-label="Salida"]', { visible: true });
    await page.focus('input[aria-label="Salida"]');
    await page.keyboard.type(departureDate);
    await page.waitForTimeout(1500);
    // type "returnDate"
    await page.waitForSelector('input[aria-label="Vuelta"]', { visible: true });
    await page.focus('input[aria-label="Vuelta"]');
    await page.keyboard.type(returnDate);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press('Tab');
    // SEARCH
    await page.keyboard.press('Enter');
    // SKIP OFFERS BANNER
    const selectorCloseBanner = '.oNbB0 div[aria-label="Cerrar"]';
    try {
        const bannerBtn = await page?.waitForSelector(selectorCloseBanner, { timeout: 6000 });
        if (bannerBtn) {
            await bannerBtn.click();
        }
    }
    catch {
    }
    // ORDER BY 
    try {
        const orderBySelector = '[jscontroller="U5T3Ef"] button[jsname="AefGQb"]';
        await page.waitForSelector(orderBySelector, { timeout: 2000 });
        await page.click(orderBySelector);
    }
    catch (error) {
        const customError = 'No se han encontrado vuelos según los parámetros establecidos';
        throw customError;
    }
    // Price selection
    const selectorPrice = 'li[data-value="2"] .VfPpkd-StrnGf-rymPhb-pZXsl';
    await page.waitForSelector(selectorPrice);
    await page.waitForTimeout(1000);
    await page.click(selectorPrice);
    // Read flights departure
    await page.waitForTimeout(6000);
    // Load more flights
    const selectorLoadMore = '[jscontroller="FivfGd"]';
    try {
        await page.waitForSelector(selectorLoadMore, { setTimeout: 3000 });
        await page.click(selectorLoadMore, { setTimeout: 3000 });
    }
    catch { }
    await page.waitForTimeout(6000);
    const flightsIda = await getFlightsFromPage(page);
    // Click flight row to redirect arrive flights
    const selectorRow = '.Rk10dc .pIav2d';
    await page.waitForSelector(selectorRow);
    await page.click(selectorRow);
    // Read flights arrive
    await page.waitForTimeout(6000);
    // Load more flights
    try {
        await page.waitForSelector(selectorLoadMore, { setTimeout: 3000 });
        await page.click(selectorLoadMore, { setTimeout: 3000 });
    }
    catch { }
    await page.waitForTimeout(2000);
    const flightsVuelta = await getFlightsFromPage(page);
    await browser.close();
    return [flightsIda, flightsVuelta];
}
async function getFlightsFromPage(page) {
    return await page.evaluate(() => {
        const flights = Array.from(document.querySelectorAll(".pIav2d"));
        return flights.map((el) => {
            const thumbnailString = el.querySelector(".EbY4Pc")?.getAttribute("style") || '';
            const startIndex = thumbnailString.indexOf("url(");
            const endIndex = thumbnailString.indexOf(";");
            const thumbnail = (startIndex !== -1 && endIndex !== -1)
                ? thumbnailString.slice(startIndex + 4, endIndex - 1).replaceAll("\\", "")
                : "No thumbnail";
            const layoverElement = el.querySelector(".BbR8Ec .sSHqwe");
            let layover = layoverElement?.getAttribute("aria-label") || null;
            let layoverArray = [];
            if (layover) {
                layoverArray = layover.split(/(?<=\.)\s+/);
            }
            layoverArray = layoverArray.map(layover => {
                const stringLength = 'es una'.length;
                const indiceInicio = layover.indexOf("es una");
                if (indiceInicio !== -1) {
                    layover = layover.substring(indiceInicio + stringLength).trim();
                    layover = layover.charAt(0).toUpperCase() + layover.slice(1);
                }
                return layover;
            });
            layoverArray.forEach(layover => {
                const indiceInicio = layover.indexOf("es una");
                if (indiceInicio !== -1) {
                    layover = layover.substring(indiceInicio);
                }
            });
            const getTextContent = (selector) => el.querySelector(selector)?.textContent?.trim() || `No ${selector.split(' ')[1]}`;
            // Skip trains
            if (getTextContent(".Ir0Voe .sSHqwe span").toLocaleLowerCase() === 'renfe') {
                return null;
            }
            return {
                thumbnail,
                companyName: getTextContent(".Ir0Voe .sSHqwe span").length < 80 ? getTextContent(".Ir0Voe .sSHqwe span") : null,
                description: el.querySelector(".mv1WYe")?.getAttribute("aria-label") || "No description",
                duration: getTextContent(".gvkrdb"),
                airportLeave: getTextContent(".Ak5kof .sSHqwe .eoY5cb:nth-child(1)"),
                airportArrive: getTextContent(".Ak5kof .sSHqwe .eoY5cb:nth-child(2)"),
                layover: layoverArray,
                price: getTextContent(".U3gSDe .YMlIz > span"),
            };
        }).filter((flight) => flight !== null);
        ;
    });
}
exports.default = getFlightsResults;
