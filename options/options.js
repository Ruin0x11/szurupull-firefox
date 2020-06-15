/**
 * Update the options UI with the settings values retrieved from storage,
 * or the default settings if the stored settings are empty.
 * @param  {object} restoredSettings  -
 * @return {void}                     -
 */
function updateUI(restoredSettings) {
    // console.log('restoredSettings');
    // console.dir(restoredSettings, { depth: 10, colors: true }); // DEBUG

    // Get HTML input
    const url = document.querySelector("#url");
    const username = document.querySelector("#username");
    const password = document.querySelector("#password");

    // Set HTML input with stored values
    url.value = restoredSettings.url;
    username.value = restoredSettings.username;
    password.value = restoredSettings.password;
}

/**
 * Store options UI using browser.storage.local.
 * @return {void}       -
 */
function storeSettings() {
    const url = document.querySelector("#url");
    const username = document.querySelector("#username");
    const password = document.querySelector("#password");

    const settings = {
        url: url.value,
        username: username.value,
        password: password.value,
    };
    // console.log('storeSettings settings');
    // console.log(settings);

    // Store in storage
    browser.storage.local.set(settings);

    // Update UI
    updateUI(settings);

    alert("Preferences saved.")
}

/**
 * Display on error
 * @param  {object} error -
 * @return {void}   -
 */
function onError(e) {
    console.error(e);
}

/*
  On opening the options page, fetch stored settings and update the UI with them.
*/
const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

/*
  On clicking the save button, save the currently selected settings.
*/
const saveButton = document.querySelector("#save-button");
saveButton.addEventListener("click", storeSettings);
