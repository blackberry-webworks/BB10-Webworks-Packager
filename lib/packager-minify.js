/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var localize = require("./localize"),
    logger = require("./logger"),
    utils = require('./packager-utils'),
    path = require("path"),
    fs = require("fs"),
    jsp = require("uglify-js").parser,
    pro = require("uglify-js").uglify,
    cleanCSS = require('clean-css'),
    async = require("async"),
    _self;

function compressJS(file) {
    return function (callback) {
        fs.readFile(file, "utf8", function (err, data) {
            var ast,
                gen;

            if (err) {
                callback(null, false);
            }

            try {
                ast = jsp.parse(data);
                ast = pro.ast_mangle(ast);
                ast = pro.ast_squeeze(ast);
                gen = pro.gen_code(ast, false);
            } catch (e) {
                throw localize.translate("EXCEPTION_MINIFY_ERROR");
            }

            fs.writeFile(file, gen, "utf8", function (err) {
                if (err) {
                    callback(null, false);
                }

                callback(null, true);
            });
        });
    };
}

function compressCSS(file) {
    return function (callback) {
        fs.readFile(file, "utf8", function (err, data) {
            var minifiedCSS;

            if (err) {
                callback(null, false);
            }

            try {
                minifiedCSS = cleanCSS.process(data);
            } catch (e) {
                throw localize.translate("EXCEPTION_MINIFY_ERROR");
            }

            fs.writeFile(file, minifiedCSS, "utf8", function (err) {
                if (err) {
                    callback(null, false);
                }

                callback(null, true);
            });
        });
    };
}

_self = {
    minify: function (session, callback) {
        if (session.minify) {
            logger.info(localize.translate("PROGRESS_MINIFY_OUTPUT"));
            var tasks = [],
                jsFiles,
                cssFiles,
                file;

            jsFiles = utils.listFiles(session.sourceDir, function (file) {
                return path.extname(file) === ".js";
            });

            cssFiles = utils.listFiles(session.sourceDir, function (file) {
                return path.extname(file) === ".css";
            });

            for (file in jsFiles) {
                tasks.push(compressJS(jsFiles[file]));
            }

            for (file in cssFiles) {
                tasks.push(compressCSS(cssFiles[file]));
            }

            async.parallel(tasks, function (err, results) {
                var taskPass;
                for (taskPass in results) {
                    if (!taskPass) {
                        throw localize.translate("EXCEPTION_MINIFY_ERROR");
                    }
                }
                callback();
            });
        } else {
            callback();
        }
    }
};

module.exports = _self;
