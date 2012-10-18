var srcPath = __dirname + "/../../../lib/",
    testData = require("./test-data"),
    logger = require(srcPath + "logger"),
    packagerMinify = require(srcPath + "packager-minify"),
    utils = require(srcPath + 'packager-utils'),
    fileMgr = require(srcPath + "file-manager"),
    path = require("path"),
    async = require("async"),
    fs = require("fs"),
    cmd,
    called;

function callback(btn) {
    called = true;
}

function checkForCallback(callback) {
    if (called) {
        called = false;
        return true;
    } else {
        return false;
    }
}

describe("Packager Minify", function () {
    beforeEach(function () {
        var from = testData.session.archivePath,
            to = testData.session.sourceDir;

        fileMgr.unzip(from, to);

        // suppress logger
        spyOn(logger, "info");
    });

    afterEach(function () {
        fileMgr.cleanSource(testData.session);
    });

    it("expect two functions for webworks.js & style.css, created via function factory", function () {
        var callback = jasmine.createSpy();

        spyOn(async, "parallel");

        packagerMinify.minify(testData.session, callback);

        expect(async.parallel).toHaveBeenCalledWith([jasmine.any(Function), jasmine.any(Function)], jasmine.any(Function));
    });

    it("should call listFiles with the proper session sourceDir", function () {
        spyOn(utils, "listFiles");

        runs(function () {
            packagerMinify.minify(testData.session, callback);
        });

        waitsFor(function () {
            return checkForCallback(callback);
        }, "callback was never returned within 1 sec", 1000);

        runs(function () {
            expect(utils.listFiles.calls.length).toEqual(2);
            expect(utils.listFiles).toHaveBeenCalledWith(testData.session.sourceDir, jasmine.any(Function));
        });
    });

    it("should read webworks.js", function () {
        spyOn(fs, "readFile").andCallThrough();

        runs(function () {
            packagerMinify.minify(testData.session, callback);
        });

        waitsFor(function () {
            return checkForCallback(callback);
        }, "callback was never returned within 1 sec", 1000);

        runs(function () {
            expect(fs.readFile.argsForCall[0][0]).toEqual(path.normalize(testData.session.sourceDir + "/webworks.js"));
            expect(fs.readFile.argsForCall[0][1]).toEqual("utf8");
            expect(fs.readFile.argsForCall[0][2]).toEqual(jasmine.any(Function));
        });
    });

    it("should read sample.css", function () {
        spyOn(fs, "readFile").andCallThrough();

        runs(function () {
            packagerMinify.minify(testData.session, callback);
        });

        waitsFor(function () {
            return checkForCallback(callback);
        }, "callback was never returned within 1 sec", 1000);

        runs(function () {
            expect(fs.readFile.argsForCall[1][0]).toEqual(path.normalize(testData.session.sourceDir + "/sample.css"));
            expect(fs.readFile.argsForCall[1][1]).toEqual("utf8");
            expect(fs.readFile.argsForCall[1][2]).toEqual(jasmine.any(Function));
        });
    });


    it("should write minified webworks.js to original location", function () {
        spyOn(fs, "writeFile").andCallThrough();

        runs(function () {
            packagerMinify.minify(testData.session, callback);
        });

        waitsFor(function () {
            return checkForCallback(callback);
        }, "callback was never returned within 1 sec", 1000);

        runs(function () {
            expect(fs.writeFile.argsForCall[1][0]).toEqual(path.normalize(testData.session.sourceDir + "/webworks.js"));
            expect(fs.writeFile.argsForCall[1][1]).toEqual(jasmine.any(String));
            expect(fs.writeFile.argsForCall[1][2]).toEqual("utf8");
            expect(fs.writeFile.argsForCall[1][3]).toEqual(jasmine.any(Function));
        });

    });

    it("should write minified sample.css to original location", function () {
        spyOn(fs, "writeFile").andCallThrough();

        runs(function () {
            packagerMinify.minify(testData.session, callback);
        });

        waitsFor(function () {
            return checkForCallback(callback);
        }, "callback was never returned within 1 sec", 1000);

        runs(function () {
            expect(fs.writeFile.argsForCall[0][0]).toEqual(path.normalize(testData.session.sourceDir + "/sample.css"));
            expect(fs.writeFile.argsForCall[0][1]).toEqual(jasmine.any(String));
            expect(fs.writeFile.argsForCall[0][2]).toEqual("utf8");
            expect(fs.writeFile.argsForCall[0][3]).toEqual(jasmine.any(Function));
        });

    });

});
