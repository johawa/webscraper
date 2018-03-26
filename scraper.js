const rp = require('request-promise')
// Making Ajax Request from website
const cheerio = require('cheerio')
//using Jquery like Dom Selectors




let CollectionLinks = []

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
        process.stdout.write('loading CollectionLinks');
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
        if (i < CollectionLinks.length ) {
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

        if (i <= linksToDesigner.length) {

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
                //console.log(joined);
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




function executeLinksOfEachYearAndCity(LinksToDesigner) {
    console.log(LinksToDesigner)
}

