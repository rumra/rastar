var Metalsmith = require('metalsmith');
var layouts = require('metalsmith-layouts');
// var assets = require('metalsmith-assets');
var handlebars = require('handlebars');
var serve = require('metalsmith-serve');
var watch = require('metalsmith-watch');
var sass = require('metalsmith-sass');
var permalinks = require('metalsmith-permalinks');
var collections = require('metalsmith-collections');
var tags = require('metalsmith-tags');
var excerpts = require('metalsmith-excerpts');
var msIf = require('metalsmith-if');
var prefix = require('metalsmith-prefix');



var handlebarsLayouts = require('handlebars-layouts');

handlebarsLayouts.register(handlebars);


var isProducitonBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'production');


Metalsmith(__dirname)
  .metadata({
    isProductionBuild: isProducitonBuild
  })
  .source('app/src')

  // remove all collections that used
  // issue https://github.com/segmentio/metalsmith-collections/issues/27
  .use((files, metalsmith, done) => {
    metalsmith._metadata.collections = null;
    metalsmith._metadata.articles = null;
    metalsmith._metadata.posts = null;
    done();
  })

  .use(
    collections({
      articles: {
        sortBy: 'date',
        reverse: true,
      },
      posts: {
        sortBy: 'date',
        reverse: true,
      }
    })
  )

  .use(excerpts())

  .use(
    permalinks({
      pattern: ':title',
      linksets: [{
        match: { collection: 'articles' },
        pattern: ':collection/:date/:title/'
      }, {
        match: { collection: 'posts' },
        pattern: ':collection/:date/:title/'
      }]
    })
  )

  .use(
    tags({
      path: 'tags/:tag/index.html',
      layout: 'taggeds.hbs',
    })
  )

  .use(
    layouts({
      engine: 'handlebars',
      directory: 'app/layouts',
      partials: 'app/partials'
    })
  )

  .use(
    sass({
      outputStyle: 'compressed',
      includePaths: ['node_modules'],
      sourceMap: true,
      sourceMapContents: true,
    })
  )

  .use(
    msIf(
      isProducitonBuild,
      prefix({
        prefix: 'rastar',
        selector: 'a, img, link, script'
      })
    )
  )

  // .use(
  //   assets({
  //     source: './app/assets',
  //     destination: './assets'
  //   })
  // )

  .use(
    msIf(
      !isProducitonBuild,
      watch({
        paths: {
          '${source}/**/*': '**/*',
          'app/layouts/**/*': '**/*',
          'app/partials/**/*': '**/*',
        },
        livereload: true,
      })
    )
  )

  .use(
    msIf(
      !isProducitonBuild,
      serve({
        port: 8080,
        verbose: true
      })
    )
  )

  .destination('public')

  .build(function(err) {
    if (err) throw err;
    console.log('Build finished!');
  });
