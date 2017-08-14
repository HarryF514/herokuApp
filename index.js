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


var request = require('request');

var ArticleParser = require('article-parser');

ArticleParser.configure({
    timeout: 15 * 1000
});
(function go() {
    request('http://9i9icenter.com/db/getUrl', function(error, response, body) {
        if (error) {
            setTimeout(function() {
                go();
            }, 15000);
            console.log('error', error);
        };
        if (body && JSON.parse(body) && JSON.parse(body).url) {
            ArticleParser.extract(JSON.parse(body).url).then(function(article) {
                console.log('article.content.length', article.content.length);
                if (article.content.length > 2000) {
                    request.post({
                        url: 'http://9i9icenter.com/db/addArticle',
                        form: article
                    }, function(error, response, body) {
                        if (error) {
                            console.log('error', error);
                        }
                        go();
                    });
                } else {
                    go();
                }
            }).catch(function(error) {
                console.log('ArticleParser catch error', error);
                go();
            }).finally(function() {

            });
        } else {
            setTimeout(function() {
                go();
            }, 15000);
        }
    })
})();