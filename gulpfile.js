var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
  plumber = require('gulp-plumber'),
	compass = require('gulp-compass'),
	coffee = require('gulp-coffee');

gulp.task('coffee', function() { //‘coffee'是排程名稱，可自定
	gulp.src('./assets/coffeescripts/*.coffee') //來源檔案
    .pipe(plumber())
		.pipe(coffee({bare: true})) //編譯
		.pipe(concat('app.js')) //合併成一隻
		//.pipe(uglify()) //壓縮、醜化

		.pipe(gulp.dest('./public/assets/js')) //輸出位置
});

gulp.task('ng-coffee', function() { //‘coffee'是排程名稱，可自定
  gulp.src('./assets/ng-coffee/app.coffee') //來源檔案
    .pipe(plumber())
    .pipe(coffee({bare: true})) //編譯
    .pipe(concat('ng-app.js')) //合併成一隻
    //.pipe(uglify()) //壓縮、醜化

    .pipe(gulp.dest('./public/assets/js')) //輸出位置
});

gulp.task('compass', function() {
  gulp.src('./assets/sass/**/*.sass') //來源路徑
  .pipe(plumber())
  .pipe(compass({ //這段內輸入config.rb的內容
    css: 'public/assets/css', //compass輸出位置
    sass: 'assets/sass', //sass來源路徑
    sourcemap: false, //compass 1.0 sourcemap
    style: 'compact', //CSS壓縮格式，預設(nested)
    comments: false, //是否要註解，預設(true)
    //require: ['susy'] //額外套件 susy
  }))
  // .pipe(gulp.dest('app/assets/temp')); //輸出位置(非必要)
});

gulp.task('watch', function () { //自定一個watch的排程名稱
  gulp.watch('./assets/coffeescripts/*.coffee', ['coffee']); //監聽路徑，以及檔案變更後所執行的任務
  gulp.watch('./assets/ng-coffee/*.coffee', ['ng-coffee']); 
  gulp.watch('./assets/sass/**/**/*.sass', ['compass']);
});

gulp.task('default', ['coffee', 'ng-coffee','compass','watch']);

