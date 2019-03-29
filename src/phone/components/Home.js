var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var GenericPopup = /** @class */ (function () {
    function GenericPopup(background, widgets) {
        this.widgets = widgets;
        this.background = background;
        for (var widget in this.widgets) {
            widgets[widget].originalX = widgets[widget].x;
            widgets[widget].originalY = widgets[widget].y;
        }
    }
    GenericPopup.prototype.positionOnTopOf = function (wdgName) {
        for (var widget in this.widgets) {
            // positioning works like this:
            // all items will be offset based on the background, so to place the arrow right on the middle of the widget
            this.widgets[widget].x = wdgName.x + (this.widgets[widget].originalX - this.background.originalX - this.background.width / 2 + wdgName.width / 2);
            this.widgets[widget].y = this.background.height + 0.05 + this.widgets[widget].originalY;
        }
    };
    GenericPopup.prototype.show = function () {
        for (var widget in this.widgets) {
            this.widgets[widget].visible = true;
        }
    };
    GenericPopup.prototype.hide = function () {
        for (var widget in this.widgets) {
            this.widgets[widget].visible = false;
        }
    };
    return GenericPopup;
}());
var PdfRendererPopup = /** @class */ (function (_super) {
    __extends(PdfRendererPopup, _super);
    function PdfRendererPopup(background, widgets, scale) {
        var _this = _super.call(this, background, widgets) || this;
        /**
         * Displays previous page.
         */
        _this.goToPrevPage = function () {
            if (_this.pageNum <= 1) {
                return;
            }
            _this.pageNum--;
            _this.queueRenderPage(_this.pageNum);
        };
        /**
         * Displays next page.
         */
        _this.goToNextPage = function () {
            if (_this.pageNum >= _this.pdfDoc.numPages) {
                return;
            }
            _this.pageNum++;
            _this.queueRenderPage(_this.pageNum);
        };
        _this.pdfjsLib = window['pdfjs-dist/build/pdf'];
        _this.pdfDoc = null;
        _this.pageNum = 1;
        _this.pageRendering = false;
        _this.pageNumPending = null;
        _this.scale = scale;
        _this.canvas = document.createElement('canvas');
        _this.ctx = _this.canvas.getContext('2d');
        return _this;
    }
    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    PdfRendererPopup.prototype.renderPage = function (num) {
        return __awaiter(this, void 0, void 0, function () {
            var page, viewport, renderContext, renderTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.pageRendering = true;
                        return [4 /*yield*/, this.pdfDoc.getPage(num)];
                    case 1:
                        page = _a.sent();
                        viewport = page.getViewport(this.scale);
                        this.canvas.height = viewport.height;
                        this.canvas.width = viewport.width;
                        renderContext = {
                            canvasContext: this.ctx,
                            viewport: viewport
                        };
                        renderTask = page.render(renderContext);
                        // Wait for rendering to finish
                        return [4 /*yield*/, renderTask.promise];
                    case 2:
                        // Wait for rendering to finish
                        _a.sent();
                        this.pageRendering = false;
                        if (this.pageNumPending !== null) {
                            // New page rendering is pending
                            this.renderPage(this.pageNumPending);
                            this.pageNumPending = null;
                        }
                        tml3dRenderer.setTexture(this.widgets.pdfImage.widgetName, this.canvas.toDataURL());
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    PdfRendererPopup.prototype.queueRenderPage = function (num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        }
        else {
            this.renderPage(num);
        }
    };
    /**
     * Asynchronously downloads PDF.
     */
    PdfRendererPopup.prototype.loadPdf = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.pdfjsLib.getDocument(path)];
                    case 1:
                        _a.pdfDoc = _b.sent();
                        this.pageNum = 1;
                        this.pageRendering = false;
                        this.pageNumPending = null;
                        // Initial/first page rendering
                        this.renderPage(this.pageNum);
                        return [2 /*return*/];
                }
            });
        });
    };
    return PdfRendererPopup;
}(GenericPopup));
// load pdfjs
var script = document.createElement('script');
script.onload = function () {
    $scope.checklistPdfPopup = new PdfRendererPopup($scope.view.wdg['pdfImage'], {
        pdfImage: $scope.view.wdg['pdfImage'],
        pdfNextPageIcon: $scope.view.wdg['pdfNextPageIcon'],
        pdfPrevPageIcon: $scope.view.wdg['pdfPrevPageIcon'],
    }, 1);
};
script.src = "app/components/pdf.min.js";
document.head.appendChild(script);
$scope.showPdfPopup = function () {
    $scope.checklistPdfPopup.loadPdf("app/resources/uploaded/license_agree.pdf");
    $scope.checklistPdfPopup.show();
};
$scope.hidePdfPopup = function () {
    $scope.checklistPdfPopup.hide();
};
