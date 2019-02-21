var _LOG = true;
function log(...params) {
    if (!_LOG) return;
    console.info.apply(null, params);
}
function IsValid() {
    return (document.getElementById("client_id").value
        && document.getElementById("client_secret").value
        && document.getElementById("source").value)
}
function GetSecert() {
    return {
        "X-Naver-Client-Id": document.getElementById("client_id").value,
        "X-Naver-Client-Secret": document.getElementById("client_secret").value
    };
}
function GetRegion(text) {
    if (65 <= text.charCodeAt(0) && text.charCodeAt(0) <= 122) {
        log(`Region => en to ko`);
        return { source: 'en', target: 'ko' };
    } else {
        log(`Region => ko to en`);
        return { source: 'ko', target: 'en' }; // @TODO:
    }
}
function RequestAPI(text) {
    return new Promise((resolve, reject) => {

        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'https://openapi.naver.com/v1/papago/n2mt', true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader()
        var myHeaders = new Headers(Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, GetSecert()));

        xhr.onreadystatechange = function() { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                // Request finished. Do processing here.
            }
        }
        xhr.send("foo=bar&lorem=ipsum");

        var formData = new FormData();
        var myBody = Object.assign(GetRegion(text), { 'text': text });
        for (var key in myBody) {
            formData.append(key, myBody[key]);
        }

        var request = new Request('https://openapi.naver.com/v1/papago/n2mt', {
            method: 'POST',
            headers: myHeaders,
            body: formData
        });
        console.log('@', request)
        return reject();
        // fetch(request)
        //     .then(response => {
        //         if (response.statusCode == 200) {
        //             resolve(response.text());
        //         } else {
        //             reject(response.statusCode);
        //         }
        //     })
        //     .catch(e => {
        //         reject(e);
        //     });
    })
}
function translation() {
    if (IsValid() == false) return console.error("Input your infomations");

    var text = document.getElementById("source").value;
    log(`translation => ${text} => ...`);
    RequestAPI(text)
        .then((result) => {
            log(`translation => ${text} => ${result}`);
            document.getElementById("target").value = result;
        }).catch((e) => {
            console.error(e);
        })
}

function register_event() {
    document.getElementById("client_id").addEventListener("change", () => {
        if (event.target.value) {
            chrome.storage.sync.set({ client_id: event.target.value });
        }
    })
    document.getElementById("client_secret").addEventListener("change", () => {
        if (event.target.value) {
            chrome.storage.sync.set({ client_secret: event.target.value });
        }
    })
    document.getElementById("T").addEventListener("click", translation);

}
document.addEventListener('DOMContentLoaded', function () {
    register_event();

    chrome.storage.sync.get(stored => {
        var { client_id, client_secret, content } = stored;
        log(`${client_id} ${client_secret} ${content}`);

        document.getElementById("client_id").value = client_id;
        document.getElementById("client_secret").value = client_secret;

        if (content) {
            document.getElementById("source").value = content;
            translation();
        }
    })
}, false);