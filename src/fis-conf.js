/**
 * 
 * 常用命令:
 * 
 * fis3 server start --root '../dist'
 * 
 * fis3 release -wL '../dist'
 * 
 * fis3 server stop
 */

fis.hook('relative'); 
//让所有文件，都使用相对路径。 
fis.match('**', { relative: true })

fis.match('*', {
    useHash: false
  });
  
  
  fis.match('*.js', {
    // fis-optimizer-uglify-js 插件进行压缩，已内置
    // optimizer: fis.plugin('uglify-js')

    parser: fis.plugin('babel-5.x')
  });
  
  
  fis.match('*.css', {
    // 给匹配到的文件分配属性 `useSprite`
    // 对css文件,以及html文件css片段进行csssprites处理。支持repeat-x, repeat-y, background-position 和 background-size
    useSprite: true,
  
    // fis-optimizer-clean-css 插件进行压缩，已内置
    optimizer: fis.plugin('clean-css')
  });
  
  fis.match('*.scss', {
    rExt: '.css',
    parser: fis.plugin('node-sass', {
      // options...
    })
  })
  
  
  fis.match('*.less', {
    // fis-parser-less 插件进行解析
    parser: fis.plugin('less'),
    // .less 文件后缀构建后被改成 .css 文件
    rExt: '.css'
  })
  
  
  fis.match('*.png', {
    // fis-optimizer-png-compressor 插件进行压缩，已内置
    optimizer: fis.plugin('png-compressor')
  });
  
  fis.match('::packager', {
    postpackager: fis.plugin('loader', {
      //allInOne: true
    }),
  
    spriter: fis.plugin('csssprites')
    // , packager: fis.plugin('map', {
    //   '/static/pkg/folderA.js': '/static/folderA/**.js'
    // })
    /*
     相当于:
      fis.match('::package', {
        packager: fis.plugin('map', {
          '/static/pkg/folderA.js': [
            '/static/folderA/file1.js',
            '/static/folderA/file2.js',
            '/static/folderA/**.js'
          ]
        })
      })
  
    */
  });

  fis.match('*.css', {
    postprocessor: fis.plugin('postcss')
  });
  fis.match(/.*\/[a-zA-Z0-9]+\.scss$/, {
    postprocessor: fis.plugin('postcss')
  });
  
  fis.match('*.{css, less, scss}', {
    // packTo 即能完成简单的合并操作。
    // packTo: '/static/aio.css'
  });
  
  fis.match('*.{css, less, scss, js}', {
    release : '$0'
  });
  