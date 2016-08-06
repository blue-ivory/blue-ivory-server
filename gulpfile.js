var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');
var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var nodemon = require('gulp-nodemon');

// compile all the typescript files
gulp.task('compile', function() {
    console.log('-----------------------------------------------');
    console.log('| compiling typescript files to build/**/*.js |');
    console.log('-----------------------------------------------');
    gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(typescript({
            target: 'es5'
        }))
        .pipe(sourcemaps.write('../build'))
        .pipe(gulp.dest('build'))
});

// compile test files
gulp.task('compile-test', function() {
    console.log('----------------------------------------------------');
    console.log('| compiling typescript files to test/build/**/*.js |');
    console.log('----------------------------------------------------');
    gulp.src('src/test/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(typescript({
            target: 'es5'
        }))
        .pipe(sourcemaps.write('../test'))
        .pipe(gulp.dest('build/test'))
})

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

gulp.task("istanbul:hook", function() {
    return gulp.src(['build/test/**/*.js'])
        // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
});

gulp.task("test", ['compile-test', 'istanbul:hook'], function() {
    return gulp.src('build/test/**/*.js')
        .pipe(mocha({ ui: 'bdd' }))
        .pipe(istanbul.writeReports());
});

gulp.task('default', ['compile', 'watch', 'resources', 'test', 'server']);