var srcPath = __dirname + "/../../../lib/",
    testData = require("./test-data"),
    testUtilities = require("./test-utilities"),
    localize = require(srcPath + "localize"),
    logger = require(srcPath + "logger"),
    packagerValidator = require(srcPath + "packager-validator"),
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
