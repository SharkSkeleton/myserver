const express = require('express')
const app = express()

const PORT = process.env.PORT || 80

const fs = require('fs');
// const excel = require('excel4node');
const request = require('request');
const jsonParser = express.json();

// настройка CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PATCH, PUT, POST, DELETE, OPTIONS");
    next();  // передаем обработку запроса методу app.post("/postuser"...
});

const {
    Builder,
    By,
    until
} = require('selenium-webdriver');
const riaTargetUrlBaseBefore = 'https://dom.ria.com/uk/search/#links-under-filter=on&category=0&realty_type=0&operation_type=0&fullCategoryOperation=0&page=';
const riaTargetUrlBaseAfter = '&state_id=0&city_id=';
const riaTargetUrlBaseCity = '&limit=20&sort=inspected_sort&date_from=';
const riaTargetUrlBaseDate = '&period=0&csrf=jvWhIJtB-ckP-0o_Vu3MycxJ7-9yZjtMEY_Y';
let driver = new Builder()
    .forBrowser('chrome')
    .build();
let currentPageI = 0;
let currentCity = '0';
let currentDate = '0';
let riaTargetUrl = `${riaTargetUrlBaseBefore}${currentPageI}${riaTargetUrlBaseAfter}${currentCity}${riaTargetUrlBaseCity}${currentDate}${riaTargetUrlBaseDate}`;
let counter = 1;
let myArr = [];
// https://dom.ria.com/uk/search/#links-under-filter=on&category=0&realty_type=0&operation_type=0&fullCategoryOperation=0&page=0&state_id=0&city_id=0&limit=20&sort=inspected_sort&date_from=2020-12-01&period=0&csrf=jvWhIJtB-ckP-0o_Vu3MycxJ7-9yZjtMEY_Y

app.get('/', (req, res) => {

    async function parse() {
        await driver.wait(until.elementLocated(By.css('.standart-view.clear-view.flex-colls#searchResults #preloader.hide')), 5 * 2000);

        const container = await driver.findElement(By.css('#searchResults'));
        let elements = await container.findElements(By.css('.ticket-clear.line'));
// Create a new instance of a Workbook class


        console.log('Elements count', elements.length);

        while (elements.length < 20) {
            await driver.sleep(500);
            elements = await container.findElements(By.css('.ticket-clear.line'));
        }

        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            let apartment = {'title': '', 'link': '', 'metro': '', 'priceUSD': '', 'priceUAH': '', 'rooms': '', 'squares': '', 'time': ''}

            // get title
            try {
                const link = await element.findElement(By.css('.tit a'));

                apartment.title = await link.getText();
                apartment.link = await link.getAttribute('href');

                // console.log('apartment', apartment);
            } catch (e) {
                if (e.name === 'NoSuchElementError') { console.log('Unable to find a link tag under the apartment element!'); }
                else { console.log(`Some error with parsing apartment link: ${e.message}`); }
            }

            // get link to source page
            try {
                const metroOneLineEl = await element.findElement(By.css('.tit .mhide'))
                apartment.metro = await metroOneLineEl.getText();

                // console.log('apartment', apartment);
            } catch (e) {
                if (e.name === 'NoSuchElementError') {
                    console.log(`Unable to find a metro tag under the apartment element! Element title: "${apartment.title}"`);
                }
                else { console.log(`Some error with parsing apartment link: ${e.message}`); }
            }
            // #
            // get price in USD
            try {
                const priceElements = await element.findElements(By.css('.pr .green:not(.hide)'));
                const priceEl = priceElements[priceElements.length - 1];
                apartment.priceUSD = await priceEl.getText();

            } catch (e) {
                if (e.name === 'NoSuchElementError') { console.log(`Unable to find a price tag under the apartment element! Element title: "${apartment.title}"`); }
                else { console.log(`Some error with parsing apartment link: ${e.message}`); }
            }

            // get price in UAH
            try {
                const priceElement = await element.findElement(By.css('.pr'));
                priceUAH = await priceElement.getText();
                apartment.priceUAH = priceUAH.substring(priceUAH.indexOf('$') + 2, priceUAH.length);

                // console.log('apartment', apartment);
            } catch (e) {
                if (e.name === 'NoSuchElementError') { console.log(`Unable to find a price tag under the apartment element! Element title: "${apartment.title}"`); }
                else { console.log(`Some error with parsing apartment link: ${e.message}`); }
            }

            // get numbers of rooms
            try {
                const squaresElement = await element.findElement(By.css('.char'));


                const roomsEl = await squaresElement.findElement(By.css('li:first-child'));
                apartment.rooms = await roomsEl.getText();

                const squareEl = await squaresElement.findElement(By.css('li:nth-child(2)'));
                apartment.squares = await squareEl.getText();

                // myData = await priceElement.getText();
                // apartment.rooms = myData;
                //
                //
                // console.log('apartment', apartment);
                //
                //
                // worksheet.cell(counter, 1).string(apartment.title);
                // worksheet.cell(counter, 2).string(apartment.link);
                // worksheet.cell(counter, 3).string(apartment.metro);
                // worksheet.cell(counter, 4).string(apartment.priceUSD);
                // worksheet.cell(counter, 5).string(apartment.priceUAH);
                // worksheet.cell(counter, 6).string(apartment.rooms);
                // worksheet.cell(counter, 7).string(apartment.squares);
                // counter += 1;
                // fs.appendFile('mynewfile1.txt', 'apartment: ' + apartment.title + '\n'
                //   + apartment.title + '\n'
                //   + apartment.link + '\n'
                //   + apartment.metro + '\n'
                //   + apartment.priceUSD + '\n'
                //   + apartment.priceUAH + '\n'
                //   + apartment.rooms + '\n'
                //   + apartment.squares + '\n' + '\n', function (err) {
                //   if (err) throw err;
                //   // console.log('Saved!');
                // });
            } catch (e) {
                if (e.name === 'NoSuchElementError') { console.log(`Unable to find a price tag under the apartment element! Element title: "${apartment.title}"`); }
                else { console.log(`Some error with parsing apartment link: ${e.message}`); }
            }
            // get time
            try {
                const time = await element.findElement(By.css('.date-add'));
                apartment.time = await time.getText();

                // myData = await priceElement.getText();
                // apartment.rooms = myData;
                //
                //
                // console.log('apartment', apartment);


                // worksheet.cell(counter, 1).string(apartment.title);
                // worksheet.cell(counter, 2).string(apartment.link);
                // worksheet.cell(counter, 3).string(apartment.metro);
                // worksheet.cell(counter, 4).string(apartment.priceUSD);
                // worksheet.cell(counter, 5).string(apartment.priceUAH);
                // worksheet.cell(counter, 6).string(apartment.rooms);
                // worksheet.cell(counter, 7).string(apartment.squares);
                // worksheet.cell(counter, 8).string(apartment.time);
                myArr.push(apartment);

                counter += 1;

                // fs.appendFile('mynewfile1.txt', 'apartment: ' + apartment.title + '\n'
                //   + apartment.title + '\n'
                //   + apartment.link + '\n'
                //   + apartment.metro + '\n'
                //   + apartment.priceUSD + '\n'
                //   + apartment.priceUAH + '\n'
                //   + apartment.rooms + '\n'
                //   + apartment.squares + '\n' + '\n', function (err) {
                //   if (err) throw err;
                //   // console.log('Saved!');
                // });
            } catch (e) {
                if (e.name === 'NoSuchElementError') { console.log(`Unable to find a price tag under the apartment element! Element title: "${apartment.title}"`); }
                else { console.log(`Some error with parsing apartment link: ${e.message}`); }
            }
        }
    }

    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    async function goNext() {
        await driver.wait(until.elementLocated(By.xpath('//*[@id="pagination"]/*[@id="pagination"]/*[contains(@class, "pager")]/*[contains(@class, pagerMobileScroll)]/*[contains(@class, "page-item")]/*[contains(@class, "page-link") and contains(@class, "active") and not(contains(@class, "hide"))]/parent::*/following-sibling::*[not(contains(@class, "hide"))][1]/*[contains(@class, "page-link")]')));
        const nextBtnEl = driver.findElement(By.xpath('//*[@id="pagination"]/*[@id="pagination"]/*[contains(@class, "pager")]/*[contains(@class, pagerMobileScroll)]/*[contains(@class, "page-item")]/*[contains(@class, "page-link") and contains(@class, "active") and not(contains(@class, "hide"))]/parent::*/following-sibling::*[not(contains(@class, "hide"))][1]/*[contains(@class, "page-link")]'));
        const tvEl = await driver.findElement(By.css('#searchResults #preloader'));
        // const reviewFormEl = await driver.findElement(By.id('reviewForm'));
        console.log('Before actual goNext btn click');
        // await driver.executeScript("arguments[0].scrollIntoView()", nextBtnEl);
        await driver.wait(until.elementIsNotVisible(tvEl), 5000);
        await driver.executeScript("var elToRemove = document.getElementById('reviewFormEl'); if (elToRemove) return elToRemove.remove();");
        await driver.executeScript("arguments[0].scrollIntoView()", nextBtnEl);
        await nextBtnEl.click();
    }

    async function parseNPages() {
        // let workbook = new excel.Workbook();
        // let worksheet = workbook.addWorksheet('Main');
        sleep(3000);
        try {
            await driver.get(riaTargetUrl).then(() => {
                sleep(1000);
                console.log(riaTargetUrl);
            });
            const lastBtnEl = driver.findElement(By.css('#pagination #pagination .pagerMobileScroll .page-item:last-child'));
            await driver.wait(until.elementTextMatches(lastBtnEl, new RegExp('^.{3,}$')), 5 * 2000);
            const lastBtnText = (await driver.findElement(By.css('#pagination #pagination .pagerMobileScroll .page-item:last-child')).getText()).replace(/\s/g, '')
            const N = parseInt(lastBtnText);

            console.log(`last btn text: ${lastBtnText}`);

            for (let i = 0; i < N; i++) {
                await parse();

                if (i > 4) {
                    await driver.sleep(1000);
                    break;
                } else {
                    console.log('Before goNext');
                    await goNext();
                }

                console.log(`Page ${i + 1}.`)
            }
        } catch (e) {
            console.error(`Some unexpected error: ${e.message}`);
        } finally {
            await driver.quit();
        }
        // workbook.write('Excel.xlsx');
        for (let i = 0; i < myArr.length; i++) {
            console.log(myArr[i]);
        }
        console.log('End of the end');
    }

// request.post(
//   'localhost:4200',
//   { json: { key: 'value' } },
//   function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       console.log(body);
//     }
//     else {
//       console.log('Done');
//     }
//   }
// );

// обработчик по маршруту localhost:4200/postdata
    app.post("/postdata", jsonParser, async function (request, response) {
        console.log('post')
        // если не переданы данные, возвращаем ошибку
        if(!request.body) return response.sendStatus(400);

        // получаем данные
        let command = request.body.command;

        if (request.body.city !== null || undefined) {
            if (request.body.city ==='Київ') {currentCity = 10;}
            if (request.body.city ==='Вінниця') {currentCity = 1;}
            if (request.body.city ==='Одеса') {currentCity = 12;}
            if (request.body.city ==='Дніпро') {currentCity = 11;}
            if (request.body.city ==='Львів') {currentCity = 5;}
            if (request.body.city ==='Хмельницький') {currentCity = 4;}
            if (request.body.city ==='Тернопіль') {currentCity = 3;}
            if (request.body.city ==='Харків') {currentCity = 7;}
            if (request.body.city ==='Миколаїв') {currentCity = 19;}
            if (request.body.city ==='Житомир') {currentCity = 2;}
            if (request.body.city ==='Запоріжжя') {currentCity = 14;}
            if (request.body.city ==='Рівне') {currentCity = 9;}
            if (request.body.city ==='Ужгород') {currentCity = 22;}
            if (request.body.city ==='Івано-Франківськ') {currentCity = 15;}
            if (request.body.city ==='Черкаси') {currentCity = 24;}
            if (request.body.city ==='Чернівці') {currentCity = 25;}
            if (request.body.city ==='Луцьк') {currentCity = 18;}
            if (request.body.city ==='Херсон') {currentCity = 23;}
            if (request.body.city ==='Чернігів') {currentCity = 6;}
            if (request.body.city ==='Суми') {currentCity = 8;}
            if (request.body.city ==='Кропивницький') {currentCity = 16;}
        }
        if (request.body.date !== null || undefined) {
            currentDate = request.body.date;
        }
        riaTargetUrl = `${riaTargetUrlBaseBefore}${currentPageI}${riaTargetUrlBaseAfter}${currentCity}${riaTargetUrlBaseCity}${currentDate}${riaTargetUrlBaseDate}`;
        if (command === 'start') {
            await parseNPages().then(() => {
                response.json({"data": myArr});
            })
        }

        // отправка данных обратно клиенту
        response.json({"data": 'Some Error'});
    });

    // app.post("/postdatatosave", jsonParser, function (request, response) {
    //     let workbook = new excel.Workbook();
    //     let worksheet = workbook.addWorksheet('Main');
    //     console.log('getDataFromServer')
    //     // если не переданы данные, возвращаем ошибку
    //     if(!request.body) return response.sendStatus(400);
    //
    //
    //     // получаем данные
    //
    //     for (let i = 0; i < request.body.data.length; i++) {
    //         worksheet.cell(i, 1).string(request.body.data[i].title);
    //         worksheet.cell(i, 2).string(request.body.data[i].link);
    //         worksheet.cell(i, 3).string(request.body.data[i].metro);
    //         worksheet.cell(i, 4).string(request.body.data[i].priceUSD);
    //         worksheet.cell(i, 5).string(request.body.data[i].priceUAH);
    //         worksheet.cell(i, 6).string(request.body.data[i].rooms);
    //         worksheet.cell(i, 7).string(request.body.data[i].squares);
    //         worksheet.cell(i, 8).string(request.body.data[i].time);
    //     }
    //
    //     workbook.write('myNewExcel.xlsx');
    //     response.json({"message": "File created!"});
    //
    //     // отправка данных обратно клиенту
    //     response.json({"message": 'Some Error'});
    // });

    console.log('here')
    app.listen(3000);
})

app.get('/about', (req, res) => {

    // async function parse() {
    //     await driver.get(riaTargetUrl);
    //     // await driver.wait(until.elementLocated(By.css('.standart-view.clear-view.flex-colls#searchResults #preloader.hide')), 5 * 2000);
    //
    //     const container = await driver.findElement(By.css('.content'));
    //     let elements = await container.findElements(By.css('.offer-wrapper'));
    //
    //     console.log('Elements count', elements.length);
    //
    //     while (elements.length < 20) {
    //         await driver.sleep(500);
    //         elements = await container.findElements(By.css('.space rel'));
    //     }
    //
    //     for (let i = 0; i < elements.length; i++) {
    //         let element = elements[i];
    //         let apartment = {'title': '', 'link': '', 'price': ''}
    //
    //         // get title
    //         try {
    //             const link = await element.findElement(By.css('.lheight22.margintop5 a'));
    //             apartment.title = await link.getText();
    //             apartment.link = await link.getAttribute('href');
    //
    //             console.log('apartment', apartment);
    //             res.send(apartment);
    //         } catch (e) {
    //             if (e.name === 'NoSuchElementError') { console.log('Unable to find a link tag under the apartment element!'); }
    //             else { console.log(`Some error with parsing apartment link: ${e.message}`); }
    //         }
    //     }
    //
    //     await driver.quit();
    // }
    // parse();
})

app.get('/new', (req, res) => {
    res.end(`
<div>
    <nav>
        <ul>
            <li>
                <a href="/">Home</a>
            </li>
            <li>
                <a href="/about">About</a>
            </li>
            <li>
                <a href="/new">New</a>
            </li>
        </ul>
    </nav>
    <h1>New page</h1>
</div>
`)
})
//


app.listen(PORT, () => {
    console.log('Server has been started...')
})


// const express = require('express');
// const app = express();
// const path = require('path');
//
// // Serve static files from the React app.
// app.use(express.static(path.join(__dirname, '..', 'client/build')));
//
//
// app.get('/api', async (req, res) => {
//     const webdriver = require('selenium-webdriver');
//     require('chromedriver');
//     const chrome = require('selenium-webdriver/chrome');
//
//     let options = new chrome.Options();
//     options.setChromeBinaryPath(process.env.CHROME_BINARY_PATH);
//     let serviceBuilder = new chrome.ServiceBuilder(process.env.CHROME_DRIVER_PATH);
//
//     //Don't forget to add these for heroku
//     options.addArguments("--headless");
//     options.addArguments("--disable-gpu");
//     options.addArguments("--no-sandbox");
//
//
//     let driver = new webdriver.Builder()
//         .forBrowser('chrome')
//         .setChromeOptions(options)
//         .setChromeService(serviceBuilder)
//         .build();
//
//     await driver.get('http://www.google.com');
//     res.send(await driver.getTitle());
// });
//
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'client/build/index.html'));
// });
//
// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//     console.log(`listening to port ${port} now...`);
// });

