const rp = require('request-promise')
// Making Ajax Request from website
const cheerio = require('cheerio')
//using Jquery like Dom Selectors




let CollectionLinks = []

let DataForEachYear = [{
    name: null,
    uri: null,
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
                'uri': `http://vogue.de` + $(ht).attr('href')
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
                  
                    DataForEachYear[i+1].cities = cities
                    cities=[];
                    i++;                                        
                    return next();

                })

        } //end if
        else {
            console.log('i is bigger then CollectionLinks.length')
            console.log(DataForEachYear)
        }
    } //end next()
    return next();
}; //end getCitiesOfEachYear()



