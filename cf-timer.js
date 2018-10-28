const playButton = document.querySelector('#play');
const pauseButton = document.querySelector('#pause');
const stopButton = document.querySelector('#stop');
const publishButton = document.querySelector('#publish');
// const createButton = document.querySelector('#create-button');
// const destroyButton = document.querySelector('#destroy-button');
let time = 1;
let timerID = null;

const LAST_START_TIME = 'LAST_START_TIME';
const DURATION = 'DURATION';
const STATE = 'STATE';
const PAUSE = 'PAUSE';
const PLAY = 'PLAY';
const STOP = 'STOP';


const dataJSON = {
    "data": [
        {
            "range": "B!E22",
            "values": [
                [
                    "TRUE"
                ]
            ]
        },
        {
            "range": "B!F22",
            "values": [
                [
                    "TRUE"
                ]
            ]
        },
        {
            "range": "B!G22",
            "values": [
                [
                    "Implementation"
                ]
            ]
        }
    ],
    "includeValuesInResponse": true,
    "valueInputOption": "USER_ENTERED"
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getDataJSON(data) {
    return {
        "data": [
            {
                "range": "B!E" + data.row,
                "values": [
                    [
                        "TRUE"
                    ]
                ]
            },
            {
                "range": "B!F" + data.row,
                "values": [
                    [
                        data.tryAgain
                    ]
                ]
            },
            {
                "range": "B!G" + data.row,
                "values": [
                    [
                        data.category
                    ]
                ]
            },
            {
                "range": "B!H" + data.row,
                "values": [
                    [
                        data.time
                    ]
                ]
            },
            {
                "range": "B!I" + data.row,
                "values": [
                    [
                        data.lastSolved
                    ]
                ]
            },
            {
                "range": "B!J" + data.row,
                "values": [
                    [
                        data.comments
                    ]
                ]
            }
        ],
        "includeValuesInResponse": true,
        "valueInputOption": "USER_ENTERED"
    };
}

function padLeft(time) {
    if (time >= 0 && time <= 9) {
        return "0" + time;
    }
    return "" + time;
}

function repaintTimeWithTime() {
    let cloneTime = time;
    let hour = cloneTime / 3600;
    hour = hour + "";
    hour = parseInt(hour, 10);

    cloneTime -= hour * 3600;
    let min = cloneTime / 60;
    min = min + "";
    min = parseInt(min, 10);

    cloneTime -= min * 60;
    let sec = cloneTime + "";
    sec = parseInt(sec, 10);

    document.querySelector('#hour').innerText = padLeft(hour);
    document.querySelector('#min').innerText = padLeft(min);
    document.querySelector('#sec').innerText = padLeft(sec);
}

function startTimer() {
    timerID = setInterval(function () {
        console.log("Current Time = " + time);
        repaintTimeWithTime();
        time = time + 1;
    }, 1000);
}


function pauseTimer() {
    clearInterval(timerID);
}

function stopAndResetTimer() {
    clearInterval(timerID);
    localStorage.setItem(STATE, STOP);
    localStorage.setItem(DURATION, 0);
    localStorage.setItem(LAST_START_TIME, undefined);

    time = 0;
    repaintTimeWithTime();
}

function setLastStartTime(currentTimeInMilliseconds) {
    localStorage.setItem(LAST_START_TIME, currentTimeInMilliseconds);
}

function getLastStartTime(currentTimeInMilliseconds) {
    const startTimeInMilliseconds = localStorage.getItem(LAST_START_TIME)
    if (isNumeric(startTimeInMilliseconds)) {
        return parseInt(startTimeInMilliseconds, 10);
    }
    return parseInt(currentTimeInMilliseconds, 10);
}
function setDuration(durationInMilliseconds) {
    localStorage.setItem(DURATION, durationInMilliseconds);
}

function getDuration() {
    const durationInMilliseconds = localStorage.getItem(DURATION);
    if (isNumeric(durationInMilliseconds)) {
        return parseInt(durationInMilliseconds, 10);
    }
    return parseInt(0, 10);
}

function onPlayButtonClicked() {
    const currentTimeInMilliseconds = Date.now();
    playButton.style.display = 'none';
    pauseButton.style.display = 'block';

    debugger;


    const startTimeInMilliseconds = getLastStartTime(currentTimeInMilliseconds);
    const durationInMilliseconds = getDuration();

    time = durationInMilliseconds + (currentTimeInMilliseconds - startTimeInMilliseconds);
    setDuration(time);
    setLastStartTime(currentTimeInMilliseconds);

    time /= 1000;
    time = Math.abs(time);
    localStorage.setItem(STATE, PLAY);
    startTimer();
}

function onPauseButtonClicked() {
    const currentTimeInMilliseconds = Date.now();

    pauseButton.style.display = 'none';
    playButton.style.display = 'block';

    const startTimeInMilliseconds = getLastStartTime(currentTimeInMilliseconds);
    let durationInMilliseconds = getDuration();
    durationInMilliseconds += currentTimeInMilliseconds - startTimeInMilliseconds

    setLastStartTime(undefined);
    setDuration(durationInMilliseconds);

    localStorage.setItem(STATE, PAUSE);
    time = durationInMilliseconds;
    time /= 1000;
    time = Math.abs(time);
    pauseTimer();
}

function onStopButtonClicked() {
    pauseButton.style.display = 'none';
    playButton.style.display = 'block';

    localStorage.setItem(STATE, STOP);
    localStorage.setItem(DURATION, 0);
    localStorage.setItem(LAST_START_TIME, undefined);

    stopAndResetTimer();
}

playButton.addEventListener('click', function () {
    onPlayButtonClicked();
})

pauseButton.addEventListener('click', function () {
    onPauseButtonClicked();
});

stopButton.addEventListener('click', function () {
    onStopButtonClicked();
});

// createButton.addEventListener('click', function () {
//     resumeState();
// });

// destroyButton.addEventListener('click', function () {
//     clearInterval(timerID);
// })



publishButton.addEventListener('click', function () {
    pauseTimer();
    const confirm = window.confirm('Are you sure you want to submit');
    if (confirm) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            const currentLink = tabs[0].url;
            chrome.identity.getAuthToken({ interactive: true }, function (token) {
                const sheetURL = "https://sheets.googleapis.com/v4/spreadsheets/1s59zVln96l8zIAEbS45QZT8Z8AHl6-fbnQUoP34UIB0/values/B!D1%3AD3984?key=AIzaSyDT6Ib0efhc0177UAv1BHgUBESesiZ9eBs"
                fetch(sheetURL)
                    .then(function onSheetResponse(response) {
                        if (response.ok) {
                            response.json()
                                .then(function onResponseToJSON(json) {
                                    const problems = json.values;
                                    for (let i = 0; i < problems.length; i++) {
                                        const p = problems[i];
                                        const dropdown = document.getElementById("problem-type");
                                        const category = dropdown.options[dropdown.selectedIndex].text;
                                        if (p[0] === currentLink) {
                                            console.log('Row found');
                                            const d = new Date();
                                            const lastSolved = d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear()
                                            const data = {
                                                row: i + 1,
                                                tryAgain: document.getElementById("try-again").checked ? "TRUE" : "FALSE",
                                                category: category,
                                                time: time + "",
                                                lastSolved: lastSolved,
                                                comments: document.getElementById('comments').value
                                            }
                                            const dataJSON = getDataJSON(data);
                                            console.log(dataJSON);

                                            const postSheetURL = "https://sheets.googleapis.com/v4/spreadsheets/1s59zVln96l8zIAEbS45QZT8Z8AHl6-fbnQUoP34UIB0/values:batchUpdate?key=AIzaSyDT6Ib0efhc0177UAv1BHgUBESesiZ9eBs&alt=json"
                                            fetch(postSheetURL, {
                                                method: "POST",
                                                headers: {
                                                    Authorization: 'Bearer ' + token,
                                                    'Content-Type': 'application/json'
                                                },
                                                contentType: 'json',
                                                body: JSON.stringify(dataJSON)
                                            }).then(function onSuccess(response) {
                                                if (response.ok) {
                                                    alert('Data successfully posted');
                                                    return;
                                                }
                                                alert('Some problem occured');
                                                console.log(response);
                                            })
                                        }
                                    }
                                })
                        }
                    });
            });
        })
    }
})


document.addEventListener('DOMContentLoaded', function () {
    resumeState();
});

function resumeState() {
    time = 1;
    const state = localStorage.getItem('STATE');
    // window.confirm('Last known state = ' + state);
    if (!state) {
        stopAndResetTimer();
    } else {
        if (state === 'PLAY') {
            onPlayButtonClicked();
        } else if (state === 'PAUSE') {
            playButton.style.display = 'block';
            pauseButton.style.display = 'none';
            let durationInMilliseconds = getDuration();
            time = durationInMilliseconds;
            time /= 1000;
            time = Math.abs(time);

            repaintTimeWithTime();

            onPauseButtonClicked();
        } else if (state === 'STOP') {
            playButton.style.display = 'block';
            pauseButton.style.display = 'none';
            time = 0;

            repaintTimeWithTime();

            onStopButtonClicked();
        }
    }
}




