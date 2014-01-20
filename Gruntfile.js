var timer = require("grunt-timer");

module.exports = function(grunt) {
	timer.init(grunt);

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.initConfig({
		concat: {
			listview: {
				src: ['utils/utils.js',
					'objectpool/objectpool.js',
					'listview/listview.js',
					'gestureadapter/gestureadapter.js',
					'animator/animator.js',
					'scrollview/scrollview.js'],
				dest: 'listview/bin/listview-combined.min.js'
			},
			scrollview: {
				src: ['utils/utils.js',
					'animator/animator.js',
					'objectpool/objectpool.js',
					'gestureadapter/gestureadapter.js',
					'scrollview/scrollview.js'],
				dest: 'scrollview/bin/scrollview-combined.min.js'
			}
		},

		uglify: {
			animator: {
				src: ['animator/animator.js'],
				dest: 'animator/bin/animator.min.js'
			},
			gestureadapter: {
				src: ['gestureadapter/gestureadapter.js'],
				dest: 'gestureadapter/bin/gestureadapter.min.js'
			},
			listview: {
				src: ['listview/listview.js'],
				dest: 'listview/bin/listview.min.js'
			},
			listviewcombined: {
				src: ['listview/bin/listview-combined.min.js'],
				dest: 'listview/bin/listview-combined.min.js'
			},
			objectpool: {
				src: ['objectpool/objectpool.js'],
				dest: 'objectpool/bin/objectpool.min.js'
			},
			scrollview: {
				src: ['scrollview/scrollview.js'],
				dest: 'scrollview/bin/scrollview.min.js'
			},
			scrollviewcombined: {
				src: ['scrollview/bin/scrollview-combined.min.js'],
				dest: 'scrollview/bin/scrollview-combined.min.js'
			},
			utils: {
				src: ['utils/utils.js'],
				dest: 'utils/bin/utils.min.js'
			}
		},

		clean: {
			animator: {
				src: ['animator/bin/animator.min.js']
			},
			gestureadapter: {
				src: ['gestureadapter/bin/gestureadapter.min.js']
			},
			listview: {
				src: ['listview/bin/listview.min.js', 'listview/bin/listview-combined.min.js']
			},
			objectpool: {
				src: ['objectpool/bin/objectpool.min.js']
			},
			scrollview: {
				scr: ['scrollview/bin/scrollview.min.js', 'scrollview/bin/scrollview-combined.min.js']
			},
			utils: {
				src: ['utils/bin/utils.min.js']
			}
		}
	});


	grunt.registerTask('build-animator', ['clean:animator', 'uglify:animator']);
	grunt.registerTask('build-gestureadapter', ['clean:gestureadapter', 'uglify:gestureadapter']);
	grunt.registerTask('build-listview', ['clean:listview', 'uglify:listview', 'concat:listview', 'uglify:listviewcombined']);
	grunt.registerTask('build-objectpool', ['clean:objectpool', 'uglify:objectpool']);
	grunt.registerTask('build-scrollview', ['clean:scrollview', 'uglify:scrollview', 'concat:scrollview', 'uglify:scrollviewcombined']);
	grunt.registerTask('build-utils', ['clean:utils', 'uglify:utils']);

	grunt.registerTask('build', ['build-animator', 'build-gestureadapter', 'build-listview', 'build-objectpool', 'build-scrollview', 'build-utils']);
};