
let options = {
    uri: `http://www.vogue.de/fashion-shows/paris-fashion-week/herbst-winter-2018-19/balenciaga`,
    transform: function (html) {
        return cheerio.load(html);
    }
};


const str = options.uri.toString()
const sliced = str.split("/");
const slicedReversed = sliced.reverse();
console.log(sliced[0])

