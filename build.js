#!/usr/bin/env node

var fs = require('fs')
  , gz = require('zlib').gzip
  , colorsTmpl = require('colors-tmpl')
  , uglify = require('uglify-js')

  , inFile = 'traversty.js'
  , outFile = 'traversty.min.js'
  , readme = 'README.md'

  , readmeContents = fs.readFileSync(readme).toString()
  , rawContents = fs.readFileSync(inFile)
  , copyright = rawContents.toString().match(/\/\*[\s\S]+?\*\//i)[0]
  , minContentsPrev = fs.readFileSync(outFile)
  , minContents = copyright + '\n' + uglify(rawContents.toString())

  , sizes = {
        raw: rawContents.length
      , minPrev: minContentsPrev.length
      , min: minContents.length
    }

  , s2s = function (size) {
      size = Math.round(size / 1024 * 10) / 10;
      return size + ' kB'
    }

  , packageJSON = require('./package')
  , componentJSON = {
        name        : packageJSON.name
      , description : packageJSON.description
      , version     : packageJSON.version
      , keywords    : packageJSON.keywords
      , main        : packageJSON.main
      , scripts     : [ packageJSON.main ]
      , repo        : packageJSON.repository.url.replace(/\.git$/, '')
    }

sizes.min = minContents.length

gz(minContentsPrev, function (err, gzContentsPrev) {
  if (err) throw err;
  gz(minContents, function (err, gzContents) {
    if (err) throw err;

    sizes.gz = gzContents.length
    sizes.gzPrev = gzContentsPrev.length

    for (var p in sizes) {
      readmeContents = readmeContents.replace(
        new RegExp(
            '(?:(?:[\\d\\.]*|NaN)\\s*kB)\\s*(' + p + ')'
          , 'g')
        , s2s(sizes[p]) + ' $1');
    }

    fs.writeFileSync(outFile, minContents)
    fs.writeFileSync(readme, readmeContents)

    console.log(colorsTmpl(
        '{bold}{green}Build successful!{/green}{/bold}\n'
      + '\t{yellow}Previous min size:{/yellow} ' + sizes.minPrev + ' bytes\n'
      + '\t{green}New min size     :{/green} ' + sizes.min + ' bytes\n'
      + '\t{yellow}Previous gz size :{/yellow} ' + sizes.gzPrev + ' bytes\n'
      + '\t{green}New gz size      :{/green} ' + sizes.gz + ' bytes'
    ))
  })
})

fs.writeFile(
    './component.json'
  , JSON.stringify(componentJSON, null, 2)
  , function () {}
)