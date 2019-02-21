var _LOG = false;
function log(...params) {
    if (!_LOG) return;
    console.info.apply(null, params);
}
function IsValid() {
    function NotEmpty(text) {
        return text && text != "undefined"
    }
    return (document.getElementById("source").value
        && (
            (NotEmpty(document.getElementById("client_id").value) && NotEmpty(document.getElementById("client_secret").value))
            || NotEmpty(document.getElementById("google_api").value)
        )
    );
}
function GetPapagoSecert() {
    return {
        "X-Naver-Client-Id": document.getElementById("client_id").value,
        "X-Naver-Client-Secret": document.getElementById("client_secret").value
    };
}
function GetGoogleSecret() {
    return document.getElementById("google_api").value;
}
function GetRegion(text) {
    if (65 <= text.charCodeAt(0) && text.charCodeAt(0) <= 122) {
        return { source: 'en', target: 'ko' };
    } else {
        return { source: 'ko', target: 'en' }; // @TODO:
    }
}
function RequestAPI_papago(text) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'https://openapi.naver.com/v1/papago/n2mt');
        var myHeader = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, GetPapagoSecert());
        for (var key in myHeader) {
            xhr.setRequestHeader(key, myHeader[key]);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    if (xhr.status === 500) {
                        console.error(xhr.responseText)
                    }
                    reject(xhr.status);
                }
            }
        }

        var myBody = Object.assign(GetRegion(text), { 'text': text });
        var data = [];
        for (var key in myBody) {
            data.push(`${key}=${myBody[key]}`);
        }
        data = data.join('&');

        log(`request => ${data}`);

        xhr.send(data);
    })
}
function RequestAPI_google(text) {
    return new Promise((resolve, reject) => {
        var apiKey = GetGoogleSecret();
        var { source, target } = GetRegion(text);
        var apiurl = "https://www.googleapis.com/language/translate/v2?key=" + apiKey + "&source=" + source + "&target=" + target + "&q=";

        $.ajax({
            url: apiurl + encodeURIComponent(text),
            dataType: 'jsonp',
            success: function (data) {
                var result = data.data.translations[0].translatedText;
                resolve(result)
            },
            error: function (err) {
                reject(err)
            }
        });
    })
}
function translation() {
    if (IsValid() == false) return console.error("Input your infomations");

    var text = document.getElementById("source").value;

    var elements = document.getElementsByName("api");
    var api_type = 'google';
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
            api_type = elements[i].id;
            break;
        }
    }

    var api = {
        "google": RequestAPI_google,
        "papago": RequestAPI_papago
    }[api_type];

    log(`translation => ${text} => by ${api_type}`);

    api(text)
        .then((result) => {
            log(`translation => ${text} => ${result}`);
            document.getElementById("target").innerText = result;
        }).catch((e) => {
            console.error(e);
        })
}

function register_event() {
    document.getElementById("client_id").addEventListener("change", () => {
        if (event.target.value) {
            chrome.storage.local.set({ client_id: event.target.value || "" });
        }
    })
    document.getElementById("client_secret").addEventListener("change", () => {
        if (event.target.value) {
            chrome.storage.local.set({ client_secret: event.target.value || "" });
        }
    })
    document.getElementById("google_api").addEventListener("change", () => {
        if (event.target.value) {
            chrome.storage.local.set({ google_api: event.target.value || "" });
        }
    })
    document.getElementById("T").addEventListener("click", translation);

}
document.addEventListener('DOMContentLoaded', function () {
    register_event();

    chrome.storage.local.get(stored => {
        var { client_id, client_secret, google_api, content } = stored;

        document.getElementById("client_id").value = client_id;
        document.getElementById("client_secret").value = client_secret;
        document.getElementById("google_api").value = google_api;

        if (content) {
            document.getElementById("source").value = content;
            translation();
        }
    })
}, false);