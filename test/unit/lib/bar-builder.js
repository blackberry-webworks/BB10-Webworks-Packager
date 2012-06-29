var srcPath = __dirname + "/../../../lib/",
    path = require("path"),
    wrench = require("wrench"),
    async = require("async"),
    barBuilder = require(srcPath + "bar-builder"),
    fileMgr = require(srcPath + "file-manager"),
    nativePkgr = require(srcPath + "native-packager"),
    logger = require(srcPath + "logger"),
    testData = require("./test-data"),
    extManager = null;

describe("BAR builder", function () {
    it("build() create BAR for specified session", function () {
        var callback = jasmine.createSpy(),
            session = testData.session,
            config = testData.config,
            target = session.targets[0];

        spyOn(wrench, "mkdirSyncRecursive");
        spyOn(fileMgr, "copyWWE");
        spyOn(fileMgr, "copyWebplatform");
        spyOn(fileMgr, "copyJnextDependencies");
        spyOn(fileMgr, "copyExtensions");
        spyOn(fileMgr, "generateFrameworkModulesJS");
        spyOn(async, "series").andCallFake(function () {
            nativePkgr.exec(session, target, config, function (code) {
                callback(code);
            });
        });
        spyOn(nativePkgr, "exec").andCallFake(function (session, target, config, callback) {
            callback(0);
        });

        barBuilder.build(session, testData.config, extManager, callback);

        expect(wrench.mkdirSyncRecursive).toHaveBeenCalledWith(session.outputDir + "/" + target);
        expect(fileMgr.copyWWE).toHaveBeenCalledWith(session, target);
        expect(fileMgr.copyWebplatform).toHaveBeenCalledWith(session, target);
        expect(fileMgr.copyJnextDependencies).toHaveBeenCalledWith(session);
        expect(fileMgr.copyExtensions).toHaveBeenCalledWith(config.accessList, session, target, extManager);
        expect(fileMgr.generateFrameworkModulesJS).toHaveBeenCalledWith(session);
        expect(async.series).toHaveBeenCalledWith([jasmine.any(Function), jasmine.any(Function)], jasmine.any(Function));
        expect(nativePkgr.exec).toHaveBeenCalledWith(session, target, config, jasmine.any(Function));
        expect(callback).toHaveBeenCalledWith(0);
    });
});
