var gulp = require('gulp'),  
    sass = require('gulp-ruby-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    minify = require('gulp-minify-css'),

    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),

    clean = require('gulp-clean'),

    browserSync = require('browser-sync'),
    watch = require('gulp-watch'),
    htmlmin = require('gulp-html-minifier'),

    rev = require('gulp-rev'),           
    revCollector = require('gulp-rev-collector'),


    useref = require('gulp-useref'),
    // gulpif = require('gulp-if'),
    minifyCss = require('gulp-clean-css'),

    // domSrc = require('gulp-dom-src'),
    // cheerio = require('gulp-cheerio'),

    paths = {
        'dev':'src/**/*.*',
        'pub': 'dist',
        'image': ['./**/*.+(jpg|png|gif|svg)', './*.+(jpg|png|gif|svg)'],
        'html' : ['*.html', 'src/data/**/*.*'],
        'css'  : ['**/**/*.css', 'src/**/*.css'],   // ['src/**/*.css','src/**/*.min.css'],
        'js'   : ['scripts/*.js'],
        'uglifyJs'   : ['src/**/**/*.js']
    };

gulp.task('index',function(){
    return gulp.src(paths.html)
      .pipe(gulp.dest('dist/'))
});

gulp.task('htmlmin',function(){
  return gulp.src(paths.html)
    .pipe(htmlmin({
      removeComments: true,
      minifyJS: true,//压缩页面JS
      collapseWhitespace: true,
      includeAutoGeneratedTags:false,
      processScripts:['text/html']
    }))
    .pipe(gulp.dest('dist'));
});

// 图片压缩
gulp.task('imagemin',function(){
    return gulp.src(paths.image)
      //.pipe(imagemin({optimizationLevel: 5}))
      .pipe(gulp.dest('dist'));
});

gulp.task('clean',function(){
    return gulp.src('dist', {read: false}) 
      .pipe(clean())
});

// var minifycssPath = {
//     pass:{
//         src:['src/styles/css/pass.css'],
//         // name:'pass.min.css',
//         dest:'dist/styles/css/'
//     }
//     // index:{
//     //     src:'src/styles/css/index.css',
//     //     name:'index.css',
//     //     dest:'styles/css/'
//     // }
// };
// function doMonifyCss(opt){
//     return gulp.src(opt.src)
//         .pipe(minify())
//         // .pipe(rename({suffix:'.min'}))
//         .pipe(gulp.dest('dist'))
// }
// // gulp.task('minifycss',function(){
// //     for(var i in minifycssPath ){
// //         doMonifyCss(minifycssPath[i]);
// //     }
// // });

gulp.task('minifycss',function(){
    return gulp.src(paths.css)
      .pipe(minify())
    //   .pipe(rename({suffix:'.min'}))
      .pipe(gulp.dest('dist'));
});

gulp.task('concatJs',function(){
  return gulp.src(paths.js)
    .pipe(concat('app.js'))
    .pipe(uglify('app.js'))
    .pipe(gulp.dest('dist/scripts'));
});


gulp.task('uglify',function(){
    return gulp.src(paths.uglifyJs)
      .pipe(uglify())
      .pipe(gulp.dest('dist'))
});


gulp.task('cssConcat', function() {                                //- 创建一个名为 concat 的 task
    gulp.src(['./src/css/pass.css', './src/css/abc.css'])    //- 需要处理的css文件，放到一个字符串数组里
        .pipe(concat('abc.css'))                            //- 合并后的文件名
        .pipe(minifyCss())                                      //- 压缩处理成一行
        .pipe(rename(function (path) {
            paths.basename = ".min";
            paths.extname = ".css";
        }))                                            //- 文件名加MD5后缀
        .pipe(rev())                                            //- 文件名加MD5后缀
        .pipe(gulp.dest('./dist/css'))                               //- 输出文件本地
        .pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest('dist'));                              //- 将 rev-manifest.json 保存到 rev 目录内
});

gulp.task('rev', ['cssConcat'], function() {
    gulp.src(['dist/rev-manifest.json', './src/pass.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector({
            replaceReved: true
        }))                                   //- 执行文件内css名的替换
        .pipe(gulp.dest('dist'));                     //- 替换后的文件输出的目录
});


// gulp.task('indexHtml', function() {
//     return gulp.src('./src/pass.html')
//         .pipe(cheerio(function ($) {
//             $('script').remove();
//             $('link').remove();
//             $('body').append('<script src="app.full.min.js"></script>');
//             $('head').append('<link rel="stylesheet" href="app.full.min.css">');
//         }))
//         .pipe(gulp.dest('dist/'));
// });

// gulp.task('domSrc', function () {
//     domSrc({ file: './src/pass.html', selector: 'script', attribute: 'src' })
//         .pipe(concat('app.full.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest('dist/'));
// });
// gulp.task('domCss', function() {
//     return domSrc({file:'./src/pass.html',selector:'link',attribute:'href'})
//     	.pipe(concat('app.full.min.css'))
//         .pipe(minify())
//         .pipe(gulp.dest('dist/'));
// });

// gulp.task('cssConcat', function() {                                //- 创建一个名为 concat 的 task
//     gulp.src(['./src/css/pass.css', './src/css/abc.css'])    //- 需要处理的css文件，放到一个字符串数组里
//         .pipe(concat('abc.css'))                            //- 合并后的文件名
//         // .pipe(minifyCss())                                      //- 压缩处理成一行
//         .pipe(rev())                                            //- 文件名加MD5后缀
//         .pipe(gulp.dest('./dist/css'))                               //- 输出文件本地
//         .pipe(rev.manifest())                                   //- 生成一个rev-manifest.json
//         .pipe(gulp.dest('dist'));                              //- 将 rev-manifest.json 保存到 rev 目录内
// });

// gulp.task('rev', ['cssConcat'], function() {
//     gulp.src(['dist/rev-manifest.json', './src/pass.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
//         .pipe(revCollector({
//             replaceReved: true,
//             dirReplacements: {
//                 'css': '/dist/style.min.css',
//                 // '/js/': '/dist/js/',
//                 // 'cdn/': function(manifest_value) {
//                 //     return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
//                 // }
//             }
//         }))                                   //- 执行文件内css名的替换
//         .pipe(gulp.dest('./dist/'));                     //- 替换后的文件输出的目录
// });



// gulp.task('usemin', function () {
//   return gulp.src('./src/pass.html')
//       .pipe(usemin({
//         js: [ uglify, rev ]
//         // in this case css will be only concatenated (like css: ['concat']). 
//       }))
//       .pipe(gulp.dest('dist/'));
// });



// gulp.task('useref', function () {
//     return gulp.src('./src/pass.html')
//         .pipe(useref())
//         // .pipe(gulpif('*.js', uglify()))
//         .pipe(gulpif('*.css', minifyCss()))
//         .pipe(gulp.dest('dist'));
// });


gulp.task('useref', function () {
    return gulp.src('./src/pass.html')
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});


var sassPath = {
    css: {
        src:'styles/scss/index.scss',
        dest:'styles/css/'
    }
};
function doCompileSass(opt) {
    return sass(opt.src, {sourcemap: true})
        // .pipe(sourcemaps.init())
        // .pipe(postcss([autoprefixer({remove:false})]))
        .on('error', sass.logError)
        .pipe(sourcemaps.write())
        .pipe(sourcemaps.write('maps', {
            includeContent: false,
            sourceRoot: 'source'
        }))
        .pipe(gulp.dest(opt.dest));
}
gulp.task('sass',function(){
    for(var i in sassPath ){
        doCompileSass(sassPath[i]);
    }
});

gulp.task('watch',function(){
    gulp.watch('./styles/scss/*.scss', ['sass']);
});
gulp.task('browsersync',function(){
    var files = [
        './**/*.*',
        './**/*.html',
        './**/*.scss',
        './**/*.css',
        './**/*.+(jpg|png|gif)',
        './**/*.js'
    ];
    browserSync.init(files,{
        server:{
            baseDir : './'
        },
        port: 9999,
        notify: false
    });
});
gulp.task('dev',['watch'],function(){
    gulp.start('sass');
    gulp.start('browsersync');
});

gulp.task('webserver',function(){
    connect.server({
        livereload: true,
        port: 1000
    });
});




gulp.task('default', function () {
    gulp.start('index');
    // gulp.start('htmlmin');
    gulp.start('imagemin');
    gulp.start('minifycss');
});