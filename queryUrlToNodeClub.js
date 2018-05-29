/*
 * @Author: Harry Feng
 * @Date:   2017-11-09 16:54:14
 * @Last Modified by:   Harry Feng
 * @Last Modified time: 2017-11-10 17:36:28
 */
var request = require('request');
var exec = require('child_process').exec;
var myuinetcn = 'http://huoreport.com:2052/articleUrl';
var TurndownService = require('turndown')
var turndownService = new TurndownService()
var topicEndPoint = "http://puarticle.com/api/v1/topics";
var accessToken = "3ff1ea9f-5d91-45b0-a5a0-263d9d054395";
var tabName = "share";
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

parse(myuinetcn)
parse(myuinetcn)
parse(myuinetcn)
parse(myuinetcn)

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

        console.log('obj.url', obj.url, obj.qualityPercentage);
        extract(obj.url).then(function (article) {
            console.log("article length " + article.content.length);
            console.log("article.title", article.title);
            if (article.content.length > 2000) {

                request.post({
                    url: topicEndPoint,
                    form: {
                        accesstoken: accessToken,
                        title: article.title,
                        tab: tabName,
                        content: turndownService.turndown(article.content)
                    }
                }, function (error, response, body) {
                    if (error) {
                        return console.log('error', error)
                    } else {
                        console.log('body', body);
                    }
                    parse(myuinetcn);
                })

            } else {
                parse(myuinetcn);
            }
        }).catch(function (err) {
            console.log("ArticleParser.extract error " + err.toString());
            parse(myuinetcn);
        }).finally(function () {
            console.log("finally", new Date());
        });
    })
}


setTimeout(function () {
    console.log("try to restart");
    exec("forever restart queryUrlToNodeClub.js", function (error, stdout, stderr) {
        if (error) {
            console.log(error);
            return;
        }
        if (stdout) {
            console.log(stdout);
        }
    });
}, 600 * 1000);