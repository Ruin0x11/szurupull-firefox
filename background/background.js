/*
  Default settings. Initialize storage to these values.
*/
var storage = {
    url: '',
    username: '',
    password: ''
}

/**
 * Generic error logger.
 * @param  {object} e -
 * @return {void}     -
 */
function onError(e) {
    console.error(e);
}

/**
 * On startup, check whether we have stored settings.
 * If we don't, then store the default settings.
 * @param  {object} storedSettings  -
 * @return {void}                   -
 */
function checkStoredSettings(storedSettings) {
    if (storedSettings.url === undefined) {
        browser.storage.local.set(storage);
    }
}

function setIcon(resp) {
    if (resp.scraper === null) {
        browser.browserAction.setIcon({path: "icons/icon-disabled-48.png"});
    }
    else {
        browser.browserAction.setIcon({path: "icons/icon-48.png"});
    }
}

function updateIcon(storedSettings, url) {
    fetch(storedSettings.url + '/api/uploads/check?url=' + encodeURI(url), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(storedSettings.username + ":" + storedSettings.password),
        },
    })
        .then(response => response.json())
        .then(setIcon)
        .catch((error) => {
            console.error('Error:', error);
        });
}

function registerEventListeners(storedSettings) {
    browser.webNavigation.onBeforeNavigate.addListener(_evt => {
        browser.browserAction.setIcon({path: "icons/icon-disabled-48.png"});
    }, {url: [{schemes: ["http", "https"]}]});
    browser.webNavigation.onCompleted.addListener(evt => {
        // Filter out any sub-frame related navigation event
        if (evt.frameId !== 0) {
            return;
        }

        updateIcon(storedSettings, evt.url);
    }, {url: [{schemes: ["http", "https"]}]});

    browser.tabs.onActivated.addListener(evt => {
        browser.tabs.query({windowId: evt.windowId, active: true}).then((tabs) => {
            updateIcon(storedSettings, tabs[0].url);
        });
    });
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then((storedSettings) => {
    checkStoredSettings(storedSettings);
    registerEventListeners(storedSettings);
}, onError)
