var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

// compile all the typescript files
gulp.task('compile', function() {
    console.log('-----------------------------------------------');
    console.log('| compiling typescript files to build/**/*.js |');
    console.log('-----------------------------------------------');
    gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(typescript())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('build'))
});

// watch the files for changes and rebuild everything
gulp.task("watch", function() {
    console.log('-------------------------');
    console.log('|  watching src/**/*.ts |');
    console.log('-------------------------');
    gulp.watch("src/**/*.ts", ['compile']);
});

/**
 * Copy all resources that are not TypeScript files into build directory.
 */
gulp.task("resources", function() {
    return gulp.src(["src/**/*", "!**/*.ts"])
        .pipe(gulp.dest("build"))
});

/**
 * Copy all required libraries into build directory.
 */
gulp.task("libs", function() {
    return gulp.src([
            'es6-shim/es6-shim.min.js',
            'systemjs/dist/system-polyfills.js',
            'systemjs/dist/system.src.js',
            'reflect-metadata/Reflect.js',
            'rxjs/**',
            'zone.js/dist/**',
            '@angular/**'
        ], { cwd: "node_modules/**" }) /* Glob required here. */
        .pipe(gulp.dest("build/lib"));
});

/**
 * Build the project.
 */
gulp.task("build", ['compile', 'resources', 'libs'], function() {
    console.log("Building the project ...")
});

// start the server and listen for changes
gulp.task('server', function() {
    // configure nodemon
    nodemon({
        // the script to run the app
        script: 'build/server/server.js',
        // this listens to changes in any of these files/routes and restarts the application
        // watch: ["build/server.js", "app.js", "routes/", 'public/*', 'public/*/**'],
        watch: 'build',
    }).on('restart', function() {
        gulp.src('build/server/server.js');

        console.log('-----------------------');
        console.log('|  Server restarted!  |');
        console.log('-----------------------');
    });
});

gulp.task('default', ['compile', 'watch', 'resources', 'server']);