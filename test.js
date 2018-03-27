// http://www.vogue.de/fashion-shows/paris-fashion-week/herbst-winter-2018-19/balenciaga

const fs = require('fs-extra')
const rp = require('request-promise')
// Making Ajax Request from website
const cheerio = require('cheerio')
//using Jquery like Dom Selectors
const download = require('download');
//download System

//download Filesytstem 

let img = []
let words = [];
let title = '';

let options = {
    uri: `http://www.vogue.de/fashion-shows/paris-fashion-week/herbst-winter-2018-19/balenciaga`,
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
            const p = $(this).text()
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
        console.log('Done downloading Images: ' + options.uri)
        img = []
    })
    .then(() => {
        const file = './dist/file.txt'
        fs.outputFile(file, words)
            .then(() => fs.readFile(file, 'UTF-8'))
            .then(data => {
                console.log('Done creating textFile')
                words= []
            })
            .catch(err => {
                console.error(err)
            })
    })
    .catch((err) => {
        console.log(err)
    });
