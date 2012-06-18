var srcPath = __dirname + "/../../../lib/",
    testData = require("./test-data"),
    testUtilities = require("./test-utilities"),
    localize = require(srcPath + "localize"),
    logger = require(srcPath + "logger"),
    packagerValidator = require(srcPath + "packager-validator"),
    path = require("path"),
    cmd;

describe("Packager Validator", function () {
    it("throws an exception when -g set and keys were not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //setup signing parameters
        session.keystore = undefined;
        session.storepass = "myPassword";
        
        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "author.p12"));
    });
    
    it("throws an exception when --buildId set and keys were not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //setup signing parameters
        session.keystore = undefined;
        session.buildId = "100";
        
        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "author.p12"));
    });
    
    it("throws an exception when -g set and barsigner.csk was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = undefined;
        session.storepass = "myPassword";
        
        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "barsigner.csk"));
    });
    
    it("throws an exception when --buildId set and barsigner.csk was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = undefined;
        session.buildId = "100";
        
        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "barsigner.csk"));
    });
    
    it("throws an exception when -g set and barsigner.db was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = undefined;
        session.storepass = "myPassword";
        
        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "barsigner.db"));
    });
    
    it("throws an exception when --buildId set and barsigner.db was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = undefined;
        session.buildId = "100";
        
        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_KEY_FILE", "barsigner.db"));
    });
    
    it("generated a warning when Build ID is set in config and keys were not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //Mock the logger
        spyOn(logger, "warn");
        
        //setup signing parameters
        session.keystore = undefined;
        session.buildId = undefined;
        configObj.buildId = "100";
        
        packagerValidator.validateSession(session, configObj);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("WARNING_MISSING_SIGNING_KEY_FILE", "author.p12"));
    });
    
    it("generated a warning when Build ID is set in config and barsigner.csk was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //Mock the logger
        spyOn(logger, "warn");
        
        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = undefined;
        session.buildId = undefined;
        configObj.buildId = "100";
        
        packagerValidator.validateSession(session, configObj);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("WARNING_MISSING_SIGNING_KEY_FILE", "barsigner.csk"));
    });
    
    it("generated a warning when Build ID is set in config and barsigner.db was not found", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //Mock the logger
        spyOn(logger, "warn");
        
        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = undefined;
        session.buildId = undefined;
        configObj.buildId = "100";
        
        packagerValidator.validateSession(session, configObj);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("WARNING_MISSING_SIGNING_KEY_FILE", "barsigner.db"));
    });
    
    it("throws an exception when a password [-g] was set with no buildId", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = "c:/barsigner.db";
        session.storepass = "myPassword";
        configObj.buildId = undefined;
        
        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_BUILDID"));
    });
    
    it("throws an exception when --buildId was set with no password [-g]", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.keystoreCsk = "c:/barsigner.csk";
        session.keystoreDb = "c:/barsigner.db";
        session.storepass = undefined;
        session.buildId = "100";
        
        expect(function () {
            packagerValidator.validateSession(session, configObj);
        }).toThrow(localize.translate("EXCEPTION_MISSING_SIGNING_PASSWORD"));
    });
    
    it("generates a warning when the config contains a build id and no password was provided[-g]", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = testUtilities.cloneObj(testData.config);
        
        //setup signing parameters
        session.keystore = "c:/author.p12";
        session.storepass = undefined;
        session.buildId = undefined;
        configObj.buildId = "100";
        
        //Mock the logger
        spyOn(logger, "warn");
        
        packagerValidator.validateSession(session, configObj);
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("WARNING_SIGNING_PASSWORD_EXPECTED"));
    });
});

describe("Packager Validator: validateConfig", function () {
    it("does not remove APIs that do exist from features whitelist", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = {
                accessList: [{
                    features: [{
                        id: "blackberry.identity",
                        required: true,
                        version: "1.0.0.0"
                    }, {
                        version: "1.0.0.0",
                        required: true,
                        id: "blackberry.event"
                    }],
                    uri: "WIDGET_LOCAL",
                    allowSubDomain: true
                }]
            };

        spyOn(path, "existsSync").andCallFake(function () {
            //since both of these APIs exist, existsSync would return true
            return true;
        });

        packagerValidator.validateConfig(session, configObj);
        //expecting the features list has not changed, since these APIs exist
        expect(configObj.accessList[0].features.length).toEqual(2);
        

    });

    it("removes non-existing APIs from features whitelist", function () {
        var session = testUtilities.cloneObj(testData.session),
            configObj = {
                accessList: [{
                    features: [{
                        version: "1.0.0.0",
                        required: true,
                        id: "abc.def.ijk"
                    }, {
                        id: "blackberry.identity",
                        required: true,
                        version: "1.0.0.0"
                    }],
                    uri: "WIDGET_LOCAL",
                    allowSubDomain: true
                }]    
            };


        spyOn(path, "existsSync").andCallFake(function (dir) {
            //directory containing "abc" does not exist: existsSync should return false, otherwise true
            return dir.indexOf("abc") !== -1 ? false : true;
        });

        spyOn(logger, "warn");

        packagerValidator.validateConfig(session, configObj);
        //expecting the features list to have shortened by 1, since one of these APIs does not exist
        expect(configObj.accessList[0].features.length).toEqual(1);
        //expecting warning to be logged to console because API "abc.def.ijk" does not exist"
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("EXCEPTION_FEATURE_NOT_FOUND", "abc.def.ijk"));

    });

    it("removes non-existing APIs from accessList with multiple features lists", function () {
        var session = testUtilities.cloneObj(testData.session),
        configObj = {
            accessList: [{
                features: [{
                    id: "blackberry.identity",
                    required: true,
                    version: "1.0.0.0"
                }, {
                    version: "blackberry.app",
                    required: true,
                    id: "blackberry.app"
                }],
                uri: "WIDGET_LOCAL",
                allowSubDomain: true
            }, {
                features: [{
                    id: "blackberry.identity",
                    required: true,
                    version: "1.0.0.0"
                }, {
                    id: "abc.def.ijk",
                    required: true,
                    version: "1.0.0.0"
                }],
                uri: "www.cnn.com",
                allowSubDomain: true
            }]
        };
        spyOn(logger, "warn");
        
        spyOn(path, "existsSync").andCallFake(function (dir) {
            //directory containing "abc" does not exist: existsSync should return false, otherwise true
            return dir.indexOf("abc") !== -1 ? false : true;
        });

        packagerValidator.validateConfig(session, configObj);
        //expecting WIDGET_LOCAL features list to have the same length as before
        expect(configObj.accessList[0].features.length).toEqual(2);
        //expecting www.cnn.com features list to have shortened by 1 since one of it's APIs does not exist
        expect(configObj.accessList[1].features.length).toEqual(1);
        //expecting warning to be logged to console because API "abc.def.ijk" does not exist"
        expect(logger.warn).toHaveBeenCalledWith(localize.translate("EXCEPTION_FEATURE_NOT_FOUND", "abc.def.ijk"));
    });

});
