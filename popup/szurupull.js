var username;
var password;
var domain;

browser.storage.local.get().then((storage) => {
  if(!storage.url || storage.url === ""){
    browser.runtime.openOptionsPage();
    return;
  }
  username = storage.username;
  password = storage.password;
  domain = storage.url;

  function showMessage(text) {
    var imageList = document.querySelector("#image-list");
    imageList.innerHTML = "";
    var header = document.createElement("div")
    header.className = "panel-section panel-section-header";
    var message = document.createElement("div")
    message.className = "text-section-header";
    message.textContent = text;
    header.appendChild(message)
    imageList.appendChild(header);
  }

  function initializeGallery(uploads) {
    document.querySelector("#overlay").classList.add("hidden");

    var imageList = document.querySelector("#image-list");
    if (uploads.length > 0) {
      document.querySelector("#send").classList.remove("disabled");

      let panelItem = document.createElement("div");
      panelItem.className = "panel-list-item";
      let panelItemText = document.createElement("div");
      panelItemText.className = "text";
      panelItemText.textContent = "Posts: " + uploads.length;
      panelItem.appendChild(panelItemText);
      imageList.appendChild(panelItem);

      let panelSep = document.createElement("div");
      panelSep.className = "panel-section-separator";
      imageList.appendChild(panelSep);

      for (const upload of uploads) {
        let source = document.createElement("div")
        source.className = "source";
        let header = document.createElement("h3");
        header.innerHTML = "Source";
        source.appendChild(header);
        let sourceUrl = document.createElement("div")
        sourceUrl.className = "source-url";
        sourceUrl.innerHTML = upload.url;
        source.appendChild(sourceUrl)

        let tags = document.createElement("div");
        tags.className = "tags";
        header = document.createElement("h3");
        header.innerHTML = "Tags";
        tags.appendChild(header);
        for (const tag of upload.tags) {
          let tagEle = document.createElement("div");
          tagEle.className = "tag " + tag.category;
          tagEle.innerHTML = tag.name;
          tags.appendChild(tagEle);
        }

        let image = document.createElement("div")
        image.className = "image";
        let img = document.createElement("img")
        img.setAttribute("src", upload.preview_url);
        image.appendChild(img)

        let left = document.createElement("div");
        left.className = "left";
        left.appendChild(source);
        left.appendChild(tags);

        let container = document.createElement("div");
        container.className = "container";
        container.appendChild(left);
        container.appendChild(image);

        let entry = document.createElement("div");
        entry.className = "gallery-section panel-section panel-section-header";
        entry.appendChild(container);
        imageList.appendChild(entry);
      }
    } else {
      showMessage("No images found.");
      document.querySelector("#send").classList.add("disabled");
    }
  }

  var url = "";

  document.querySelector("#overlay").classList.remove("hidden");
  browser.tabs.query({currentWindow: true, active: true})
    .then((tabs) => {
      url = tabs[0].url;
      return fetch(domain + '/api/uploads/extract?url=' + encodeURI(url), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(username + ":" + password),
        },
      })
    })
    .then(response => response.json())
    .then(initializeGallery)
    .catch((error) => {
      console.error('Error:', error);
    });

  function openItem() {
    if (!document.querySelector("#send").classList.contains("disabled")) {
      document.querySelector("#overlay").classList.remove("hidden");
      fetch(domain + '/api/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(username + ":" + password),
        },
        body: JSON.stringify({url: url})
      })
        .then(() => {
          showMessage("Success");
          document.querySelector("#overlay").classList.add("hidden");
        })
        .catch((error) => {
          showMessage("Error: " + error);
          document.querySelector("#overlay").classList.add("hidden");
          console.error('Error:', error);
        });
      document.querySelector("#send").classList.add("disabled");
    }
  }

  document.querySelector("#send").addEventListener("click", openItem);
});
