/**
 * Tasks:
 *
 * gulp lint
 *   Checks source code
 *
 * gulp watch
 *   Observes changes in the code
 *
 * gulp
 *   Invokes both `lint` and `watch` tasks
 */

const gulp = require('gulp');
const plumber = require('gulp-plumber');
const eslint = require('gulp-eslint');

const src =
[
	'gulpfile.js',
	'server.js',
	'config.example.js',
	'lib/**/*.js'
];

gulp.task('lint', () =>
{

	return gulp.src(src)
		.pipe(plumber())
		.pipe(eslint())
		.pipe(eslint.format());
});

gulp.task('watch', () =>
{
	gulp.watch(src, gulp.series('lint'));
});

gulp.task('default', gulp.series('lint'));
