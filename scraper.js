const rp = require('request-promise')
// Making Ajax Request from website
const cheerio = require('cheerio')
//using Jquery like Dom Selectors
const fs = require('fs-extra')
//write files
const download = require('download');
//download System




let CollectionLinks = []
let img = []
let words = [];
let title = '';

let DataForEachYear = [{
    name: null,
    uri: null,
    uriToDesigner: null,
    cities: [null]
}];



let options = {
    uri: `http://www.vogue.de/fashion-shows/kollektionen`,
    transform: function (html) {
        return cheerio.load(html);
    }
};

rp(options)
    .then(function ($) {
        $('.tags-list li').each(function (i, elem) {
            const ht = $(this).html();
            CollectionLinks.push({
                'uri': `http://vogue.de` + $(ht).attr('href')
            });
            DataForEachYear.push({
                'name': $(this).text(),
                'uri': `http://vogue.de` + $(ht).attr('href') + `/`
            })
        });
        process.stdout.write('Get Years...');
    })
    .then(() => {
        getCitiesOfEachYear(CollectionLinks)
    })
    .catch((err) => {
        console.log(err)
    });



function getCitiesOfEachYear(CollectionLinks) {
    let cities = []
    let i = 0;
    function next() {
        if (i < 10/* CollectionLinks.length */) {   ///EDIT Length HERE
            let options = {
                uri: CollectionLinks[i].uri,
                transform: function (html) {
                    return cheerio.load(html);
                }
            }

            rp(options)
                .then(function ($) {

                    process.stdout.write('Get Cities...');
                    $('.tags-list li').each(function (i, elem) {
                        const ht = $(this).html();
                        // obj[0].cities.push($(this).text());
                        cities.push($(this).text());
                    });

                    DataForEachYear[i + 1].cities = cities
                    cities = [];
                    i++;
                    return next();

                })

        } //end if
        else {
            console.log('i is bigger then CollectionLinks.length')
            getLinksToDesigner();
        }
    } //end next()
    return next();
}; //end getCitiesOfEachYear()



function getLinksToDesigner() {
    let linksToDesigner = [];
    let eddidetListOfCity = [];
    let fixedArrayOfLinkstoDesigner = [];
    let i = 1;

    for (let y = 1; y < DataForEachYear.length; y++) {
        const link = DataForEachYear[y].uri;
        linksToDesigner.push(link)
    }

    function next() {

        if (i <= 10 /* linksToDesigner.length */) {  //EDIT LENGTH HERE

            DataForEachYear[i].cities.map(city => {
                const cityString = city
                const eddidetString = cityString.replace(' ', '-').toLowerCase()
                eddidetListOfCity.push(eddidetString)
            })

            eddidetListOfCity.forEach(city => {
                const link = linksToDesigner[i - 1];
                const cityToAddToLInk = city
                const joined = link.concat(cityToAddToLInk);
                fixedArrayOfLinkstoDesigner.push(joined)
            })
            /* 
            console.log(linksToDesigner[i - 1])
            console.log(eddidetListOfCity)
            console.log(linksToDesigner[i] + `${eddidetListOfCity[i]}`) */

            eddidetListOfCity = []
            i++;
            return next();


        } //end of if-Statement
        else {
            executeLinksOfEachYearAndCity(fixedArrayOfLinkstoDesigner);
        }

    } //end of next()
    return next();
};// end getLinksToDesigner()




function executeLinksOfEachYearAndCity(LinkstoDesingers) {
    let i = 0;
    linksToRunways = [];

    function next() {
        if (i < 10/* LinkstoDesingers.length */) { //EDIT Length here
            let options = {
                uri: LinkstoDesingers[i],
                transform: function (html) {
                    return cheerio.load(html);
                }
            }

            rp(options)
                .then(function ($) {

                    process.stdout.write('Get Desinger...');
                    $('.tags-list li').each(function (i, elem) {
                        const ht = $(this).html();
                        linksToRunways.push(`http://vogue.de` + $(ht).attr('href') + `/runway`);
                    });


                    i++;
                    return next();

                }).catch((err) => {
                    i++;
                    return next();
                    console.log('error scraping Designers')
                });


        } //end if
        else {
            console.log('i is bigger then LinkstoDesingers.length')
            accesAllLinksToAllRunways(linksToRunways)
        }
    } //end next()
    return next();
}; //end getCitiesOfEachYear()




function accesAllLinksToAllRunways(linksToRunways) {
    console.log(linksToRunways);
    let i = 0;

    function next() {
        if (i < 4 /* linksToRunways.length */) { //EDIT length here 
            let options = {
                uri: linksToRunways[i],
                transform: function (html) {
                    return cheerio.load(html);
                }
            };
            rp(options)
                .then(function ($) {

                    $('#article-gallery-overview-items img').each(function (i, elem) {
                        let li = $(this).attr('src') ? $(this).attr('src') : null
                        let ligeneric = li.replace('v100x150', 'generic_large')
                        img.push({ key: i, url: `http://www.vogue.de` + ligeneric })
                    })

                    $('.article-header h1').each(function (i, elem) {
                        const h1 = $(this).text()
                        words.push(h1)
                        title = h1
                    })

                    $('.article-content p').each(function (i, elem) {
                        const p = $(this).text() ? $(this).text() : null
                        words.push(p)
                    })

                })
                .then(() => {
                    for (let i = 0; i < img.length; i++) {
                        download(img[i].url, 'dist').then(() => {
                            process.stdout.write('DowloadImage...');
                        });
                    }
                })
                .then(() => {
                    console.log("\x1b[32m", 'Done downloading Images: ' + options.uri)
                    img = []
                })
                .then(() => {
                    const file = './dist/file.txt'
                    fs.outputFile(file, words)
                        .then(() => fs.readFile(file, 'utf8'))
                        .then(data => {
                            process.stdout.write("\x1b[36m", 'createdTexfile...');
                            words = []
                        })
                        .catch(err => {
                            console.error(err)
                        })
                }).then(() => {
                    i++;
                    return next();
                })
                .catch((err) => {
                    i++;
                    return next();
                    console.log(err)
                });

        }//end of if Loop 
        else {
            console.log("\x1b[32m", 'Finally, you are done Vera ! :)')
        }

    }// end of next ()
    return next();
};// end getLinksToDesigner()