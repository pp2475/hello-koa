'use strict';

const Koa = require('koa');

const router = require('koa-router')();

const bodyParser = require('koa-bodyparser');

const app = new Koa();

const fs = require('fs');


    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));


const isProduction = process.env.NODE_ENV === 'production';

app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));

const nunjucks = require('nunjucks');

const controller = require('./controller');

app.use(async(ctx, next)=>{
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

function createEnv(path, opts){
    var
        autoescape = opts.autoescape === undefined ? true : opts.autoescape,
        noCache = opts.noCache || false,
        watch = opts.watch || false,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader('views',{
                noCache: noCache,
                watch: watch,
            }), {
                autoescape: autoescape,
                throwOnUndefined: throwOnUndefined
            }
        );
    if (opts.filters){
        for (var f in opts.filters){
            env.addFilter(f, opts.filters[f]);
        }
    }
    return env;
}

var env = createEnv('views', {
    watch: true,
    filters: {
        hex: function(n){
            return '0x'+ n.toString(16);
        }
    }
});

var s = env.render('extend.html', {
    header: 'Hello',
    body: 'bia bia bia...'
});

console.log(s);

app.use(bodyParser());

app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');