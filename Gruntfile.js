module.exports = function(grunt){

    grunt.initConfig({

    'http-server': {

        'dev': {

            // the server root directory
            root: 'wartezeit',

        // the server port
        // can also be written as a function, e.g.
        // port: function() { return 8282; }
        port: 8080,

        // the host ip address
        // If specified to, for example, "127.0.0.1" the server will
        // only be available on that ip.
        // Specify "0.0.0.0" to be available everywhere
        host: "0.0.0.0",

    showDir: true,
    autoIndex: true,

    // server default file extension
    ext: "html",

    // run in parallel with other tasks
    runInBackground: false,

    // specify a logger function. By default the requests are
    // sent to stdout.
    logFn: function (req, res, error) {
    },

    // Tell grunt task to open the browser
    openBrowser: false,

    // customize url to serve specific pages
    customPages: {
        "/readme": "README.md",
        "/readme.html": "README.html"
    }

}

}
});

grunt.loadNpmTasks('grunt-http-server');
};