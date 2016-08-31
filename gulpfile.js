var gulp = require('gulp');
var uglify = require('gulp-uglifyjs');
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-cssmin');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var replace = require('gulp-replace');
var clean = require('gulp-clean');
var path = require('path');
var gutil = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var webpack = require("gulp-webpack");
var watch = require("gulp-watch");
var pump = require('pump');
var webp = require('webpack');


var argv = require('yargs').argv;
var version = new Date().getTime();

var webpackConfig = {
  output: {
    filename: 'app.js'
  },
  module: {
    loaders: [{
      test: /\.html$/,
      loader: "mustache"
    }, {
      test: /\.scss$/,
      loader: "style!css!sass"
    }, {
      test: /\.json$/,
      loader: "json"
    }, {
      test: /\.css$/,
      loader: "style!css"
    }]
  },
  plugins: [
    new webp.optimize.DedupePlugin(),
    new webp.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  ],
};

// inputs
var folderDist = './**/*';

//watchers
var distWatchers = [folderDist, "!./node_modules/**", "!./.git/**"];

function reportError(error) {
  gutil.log(gutil.colors.green(error.toString()));
  this.emit('end');
}

/// Watcher  STARTf


gulp.task('distWatcher', [], function() {
  gutil.log(gutil.colors.green('Watching Files in .'));


  gulp.watch(distWatchers, function(event) {
    gutil.log(gutil.colors.green('Dist File Changed', JSON.stringify(event)));
    browserSync.reload("/index.html");
  });
});

gulp.task('browserSync', [], function() {

  browserSync.init({
    open: false,
    ghostMode: false,
    server: true
  });
});

gulp.task('develop', ['browserSync', 'distWatcher']);
