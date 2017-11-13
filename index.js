var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
    response.render('pages/index');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});


var request = require('request'),
    cheerio = require('cheerio');
var jsdom = require('jsdom');
const queryString = require('query-string');

function getDomain(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}
var baseUrl = 'http://myui.net.cn:3000/';
function parse(url) {
    request(url, function(error, response, body) {
        if(body === undefined){
            parse(baseUrl);
            return;
        }
        try{
            var obj = JSON.parse(body);
        }catch(e){
            console.log('body error: ', e);
            parse(baseUrl);
            return
        }
        
        console.log('obj.url', obj.url);
        request(obj.url, function(error, response, body) {
            try {
                // statements
                 var $ = cheerio.load(body);
            } catch(e) {
                // statements
                console.log(e);
                parse(baseUrl);
                return;

            }
           
            var requestBody = [];
            $('a').each(function(index, a) {

                var text = $(a).text().trim().replace(" ", "");
                if (!/.*[\u4e00-\u9fa5]+.*$/.test(text)) {
                    //alert("没有包含中文");
                    //console.log('no chinese', text);
                } else {
                    if ($(this).prop('href')) {
                        var toQueueUrl = $(this).prop('href').split('#')[0];
                        //alert("包含中文");
                        if (toQueueUrl.indexOf("http://") == 0) {
                            //var objectId = new ObjectID().toString();
                            var obj = {
                                url: toQueueUrl,
                                title: text,
                                titleLength: text.length,
                                urlDomain: getDomain(toQueueUrl),
                                isQueue: false,
                                isArticle: false,
                                qualityPercentage: -1
                            };
                            requestBody.push(obj);
                        }
                    }
                }
            });

            request.post({
                url: baseUrl + 'save',
                form: {data: JSON.stringify(requestBody)}
            }, function(error, response, body) {
                parse(baseUrl);
                if (error) {
                    return console.log('error', error)
                } else {
                    console.log('body', body);
                }
            })
        })
    })
}

parse(baseUrl);