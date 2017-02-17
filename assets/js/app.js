"use strict";
// this code is to show fragments of an understanding of frameworks inner workings. 100% javascript mimicking the internal workings of frameworks like angular, ember....

// init ---------------------------------------------
(function (w) {
    w.app = {
        settings: { log: true }, //set log to false to remove all console logging (largest memory leak issue in web dev)
        controllers: {},
        loadedControllers: {},
        log: function (title, message) {
            if (w.app.settings.log)
                console.log(title, message || "");
        },
        watchers : [],
        watch: function (obj, variables, func) {
            for (var x = 0; x < variables.length; x++) {
                (function (x, obj, variables, func) {
                    var oldValue = null;
                    w.app.watchers.push(setInterval(function () {
                        if (oldValue !== obj[variables[x]]) {
                            func(obj[variables[x]], oldValue);
                            oldValue = obj[variables[x]];
                        }
                    }, 250));
                }(x, obj, variables, func));
            }
        },
        apply: function (func) {
            func();
            w.app.digest();
        },
        digest: function () {
            for (var controller in w.app.loadedControllers) {
                if (w.app.loadedControllers.hasOwnProperty(controller)) {
                    w.app.log("digest :: found controller", w.app.loadedControllers[controller]);

                    for (var property in w.app.loadedControllers[controller].boundModels) {
                        if (w.app.loadedControllers[controller].boundModels.hasOwnProperty(property)) {
                            w.app.log("digest :: found models ", w.app.loadedControllers[controller].boundModels[property]);

                            var els = w.app.loadedControllers[controller].boundModels[property];
                            for (var x = 0; x < els.length; x++) {
                                $(els).val(w.app.loadedControllers[controller][property])
                            }
                        }
                    }
                }
            }
        }
    };
}(window));

// controllers --------------------------------------- 
(function (w) {
    w.app.controllers["main"] = function () {
        var self = {};
        self.sideOne = "";
        self.sideTwo = "";
        self.sideThree = "";
        self.text = "Enter values above.";

        function calcTriangle(numbers) {
            if (numbers.length !== 3 || !numbers[0] || !numbers[1] | !numbers[2]) {
                app.log("cant calculate triangle");
                return;
            }
            //find largest number to help with math
            
            var sideOnelargest = Math.max.apply(null, numbers);
             numbers.splice(numbers.indexOf(String(sideOnelargest)), 1);

            

            var side2 = Number(numbers[0]);
            var side3 = Number(numbers[1]);
            app.log("s1", sideOnelargest);
            app.log("s2", side2);
            app.log("s3", side3);
            app.apply(function () {
                
                if (side2 + side3 < sideOnelargest) {
                    self.text = "The given values do not create a triangle!";
                } else if (sideOnelargest === side2 && side2 === side3) {
                    self.text = "This is an equilateral triangle!";
                } else if ((sideOnelargest === side2 && sideOnelargest !== side3) || (side2 === side3 && sideOnelargest !== side3) || (sideOnelargest === side3 && sideOnelargest !== side2)) {
                    self.text = "This is an isosceles triangle!";
                } else if (sideOnelargest !== side2 && side2 !== side3 && sideOnelargest !== side3) {
                    self.text = "This is an scalene triangle!";
                }
            });
        }

        self.clear = function () {
            app.apply(function () {
                self.sideOne = "";
                self.sideTwo = "";
                self.sideThree = "";
                self.text = "Enter values above.";
            })
        };

        app.watch(self, ["sideOne", "sideTwo", "sideThree"], function (newValue, oldValue) {
            app.log("value changed", newValue);
               calcTriangle([self.sideOne, self.sideTwo, self.sideThree]);
        });

        return self;
    };
}(window));

// bootstrap ----------------------------------------
$(function () {

    var appDom = $("body#app");
    app.log("start");
    if (!appDom) {
        app.log("App not found! Which is really bad saying I made this for a code test...");
        return;
    }

    app.log("app found", appDom);

    $("*[app-controller]").each(function () {
        var controllerName = $(this).attr("app-controller");
        app.log("found controller", controllerName)

        var controller = app.controllers[controllerName]();
        app.loadedControllers[controllerName] = controller;

        if (!controller) {
            app.log("controller not declared", controllerName);
            return;
        }

        app.log("controller declared", controllerName);

        controller.boundModels = {};

        $("*[app-model]", this).each(function () {
            var model = $(this).attr("app-model");
            if (!model) {
                app.log("no model provided");
                return;
            }

            app.log("found model", model);

            $(this).keyup(function () {
                controller[model] = $(this).val();
                app.log("val changed", controller[model]);
            }).val(controller[model]);

            if (controller.boundModels[model])
                controller.boundModels[model].push(this);
            else
                controller.boundModels[model] = [this];
        });
        $("*[app-click]", this).each(function () {
            var func = $(this).attr("app-click");
            if (!func) {
                app.log("no func provided");
                return;
            }

            app.log("found func", func);

            $(this).mouseup(function () {
                controller[func]();
            });
        });
    });

});