/*
 * @Author: Harry Feng
 * @Date:   2017-11-09 16:54:14
 * @Last Modified by:   Harry Feng
 * @Last Modified time: 2017-11-10 17:36:28
 */
var request = require('request')
var exec = require('child_process').exec;
var myuinetcn = 'http://api.puarticle.com:2052/articleUrl';
var myuinetcnSaveUrl = 'http://api.puarticle.com:2052/saveArticle';
console.log("environemnt is ", process.env.NODE_ENV);
if (process.env.NODE_ENV == "DEV") {
    myuinetcnSaveUrl = 'http://localhost:2052/saveArticle';
    console.log("hiting url", myuinetcnSaveUrl);
}

var h2p = require('html2plaintext')
var requestTimeOut = 7000;

var {
    extract
} = require('article-parser');

var {
    configure
} = require('article-parser');
configure({
    fetchOptions: {
        timeout: requestTimeOut
    }
})

parse(myuinetcn);

setTimeout(function () {
    parse(myuinetcn);
    setTimeout(function () {
        parse(myuinetcn);
        setTimeout(function () {
            parse(myuinetcn);
            setTimeout(function () {
                parse(myuinetcn);
                setTimeout(function () {
                    parse(myuinetcn);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}, 1000);


function parse(url) {
    request(url, {
        timeout: requestTimeOut
    }, function (error, response, body) {
        if (body === undefined) {
            parse(myuinetcn);
            return;
        }
        try {
            var obj = JSON.parse(body);
        } catch (e) {
            console.log('body error: ', e);
            parse(myuinetcn);
            return
        }
        if (process.env.NODE_ENV == "debug") {
            console.log('obj.url', obj.url, obj.qualityPercentage);
        }

        extract(obj.url).then(function (article) {
            var htmlTextContent = h2p(article.content);
            console.log("article length " + htmlTextContent.length);
            
            if (htmlTextContent.length > 200) {
                request.post({
                    url: myuinetcnSaveUrl,
                    form: {
                        article: JSON.stringify(article)
                    }
                }, function (error, response, body) {
                    if (error) {
                        return console.log('error', error)
                    } else {
                        console.log('body', body, "saved", article.title);
                    }
                    parse(myuinetcn);
                })

            } else {
                parse(myuinetcn);
            }
        }).catch(function (err) {
            if (process.env.NODE_ENV == "debug") {
                console.log("ArticleParser.extract error " + err.toString());
            }
            parse(myuinetcn);
        }).finally(function () {
            if (process.env.NODE_ENV == "debug") {
                console.log("finally", new Date());
            }
        });
    })
}


setTimeout(function () {
    console.log("try to restart");
    exec("forever restart queryUrlToRemoteDb.js", function (error, stdout, stderr) {
        if (error) {
            console.log(error);
            return;
        }
        if (stdout) {
            console.log(stdout);
        }
    });
}, 600 * 1000);