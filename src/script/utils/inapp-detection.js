export function inAppDetection(setClass = false) {

    let app = false;
    const url = window.location.href;
    const inApp = url.indexOf("app_mode=true") > 0;

    if (inApp) {
        app = 'dr-nyheder'
    }
    const ua = navigator.userAgent;

    if (ua.indexOf("Instagram")) {
        app = 'instagram'
    }
    if ((ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1)) {
        app = 'facebook'
    }

    if (setClass) {
        document.documentElement.classList.add('ua-' + app);
    }
    return app;

};