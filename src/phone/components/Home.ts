interface TML3DRenderer {
    setScale: (wdgName, sx, sy, sz) => void;
    setTexture: (wdgName, src) => void;
    setTranslation: (wdgName, x, y, z) => void;
    setRotation: (wdgName, rx, ry, rz) => void;
    add3DImage: (trackerName, name, image, parent, lx, ly, anchor, width, height, pivot, successCallback, errorCallback) => void;
    setupTrackingEventsCommand: (successCallback: (target: string, eyepos: [number, number, number], eyedir: [number, number, number], eyeup: [number, number, number]) => void, failedCb) => void;
}

declare const tml3dRenderer: TML3DRenderer;
declare const $timeout: ng.ITimeoutService;
declare const $interval: ng.IIntervalService;
declare const $http: ng.IHttpService;
declare let $window: any;
declare const $element, $attrs, $injector, $sce, $ionicPopup, $ionicPopover;
interface SBBCustomScope extends ng.IScope {
    /**
     * Checklist pdf popup
     */
    checklistPdfPopup: PdfRendererPopup;
    /**
     * Method called to show the popup
     */
    showPdfPopup: () => void;
    hidePdfPopup: () => void;
    app: {
        speech: {
            synthesizeSpeech: ({ text: string }) => void;
        },
        mdl: any,
        params: any;
    }
    view: {
        wdg: any[]
    }

    navigate: (viewName: string) => void;
}
declare const $scope: SBBCustomScope;

class GenericPopup {
    protected widgets: any;
    protected background: any;

    constructor(background: any, widgets: any) {
        this.widgets = widgets;
        this.background = background;
        for (const widget in this.widgets) {
            widgets[widget].originalX = widgets[widget].x;
            widgets[widget].originalY = widgets[widget].y;
        }
    }

    positionOnTopOf(wdgName) {
        for (const widget in this.widgets) {
            // positioning works like this:
            // all items will be offset based on the background, so to place the arrow right on the middle of the widget
            this.widgets[widget].x = wdgName.x + (this.widgets[widget].originalX - this.background.originalX - this.background.width / 2 + wdgName.width / 2);
            this.widgets[widget].y = this.background.height + 0.05 + this.widgets[widget].originalY;
        }
    }

    show() {
        for (const widget in this.widgets) {
            this.widgets[widget].visible = true;
        }
    }

    hide() {
        for (const widget in this.widgets) {
            this.widgets[widget].visible = false;
        }
    }
}

class PdfRendererPopup extends GenericPopup {
    pdfjsLib;
    private pdfDoc;
    private pageNum;
    private pageRendering;
    private pageNumPending;
    private scale;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(background, widgets, scale) {
        super(background, widgets);
        this.pdfjsLib = window['pdfjs-dist/build/pdf']
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.scale = scale;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    async renderPage(num) {
        this.pageRendering = true;
        // Using promise to fetch the page
        let page = await this.pdfDoc.getPage(num);
        let viewport = page.getViewport(this.scale);
        this.canvas.height = viewport.height;
        this.canvas.width = viewport.width;

        // Render PDF page into canvas context
        let renderContext = {
            canvasContext: this.ctx,
            viewport: viewport
        };
        let renderTask = page.render(renderContext);

        // Wait for rendering to finish
        await renderTask.promise;

        this.pageRendering = false;
        if (this.pageNumPending !== null) {
            // New page rendering is pending
            this.renderPage(this.pageNumPending);
            this.pageNumPending = null;
        }
        tml3dRenderer.setTexture(this.widgets.pdfImage.widgetName, this.canvas.toDataURL());
    }

    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    private queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    /**
     * Displays previous page.
     */
    public goToPrevPage = () => {
        if (this.pageNum <= 1) {
            return;
        }
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
    }

    /**
     * Displays next page.
     */
    public goToNextPage = () => {
        if (this.pageNum >= this.pdfDoc.numPages) {
            return;
        }
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
    }

    /**
     * Asynchronously downloads PDF.
     */
    public async loadPdf(path: string) {
        this.pdfDoc = await this.pdfjsLib.getDocument(path);
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        // Initial/first page rendering
        this.renderPage(this.pageNum);
    }
}

 // load pdfjs
let script = document.createElement('script');
script.onload = () => {
    $scope.checklistPdfPopup = new PdfRendererPopup($scope.view.wdg['pdfImage'], {
        pdfImage: $scope.view.wdg['pdfImage'],
        pdfNextPageIcon: $scope.view.wdg['pdfNextPageIcon'],
        pdfPrevPageIcon: $scope.view.wdg['pdfPrevPageIcon'],
    }, 1);
}

script.src = "app/components/pdf.min.js";

document.head.appendChild(script);

$scope.showPdfPopup =  () => {
    $scope.checklistPdfPopup.loadPdf("app/resources/uploaded/license_agree.pdf");
    $scope.checklistPdfPopup.show();
}

$scope.hidePdfPopup =  () => {
    $scope.checklistPdfPopup.hide();
}