/*-------------------------Variables--------------------------*/

const d = new Date();
let time = `${formatTime(d.getHours())}:${formatTime(d.getMinutes())}`;
let date = `${formatTime(d.getDate())}-${formatTime(d.getMonth() + 1)}-${d.getFullYear()}`
let city = "Karachi";
let country = "Pakistan";
let latitude = 0;
let longitude = 0;

/*------------------------------------------------------------*/

/*----------------------Location Setters----------------------*/

async function fetchDataManually() {
    let url = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=1`;
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function fetchDataAutomatically() {
    let url = `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=1`;
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

setData('manual');

document.getElementById("edit").addEventListener("click", () => {
    changeVisibility("location-edit", "flex");
    document.getElementById('city').focus();
    document.querySelector('body').classList.add('blur');
});

document.getElementById("close").addEventListener("click", () => {
    changeVisibility("location-edit", "none");
    document.querySelector('body').classList.remove('blur');
});

document.getElementById("autoLocation").addEventListener("click", getLocation);

document.getElementById("location-info").addEventListener("click", () => {
    changeVisibility("location-edit", "none");
    city = formatLocation(document.getElementById('city').value);
    country = formatLocation(document.getElementById('country').value);
    document.querySelector('body').classList.remove('blur');
    setData('manual');
});

/*------------------------------------------------------------*/

/*-----------------------Data Displayer-----------------------*/

async function setData(mode) {
    let res;
    let isManualMode = (mode === 'manual') ? true : false;
    if (isManualMode === true) {
        res = await fetchDataManually();
    } else {
        res = await fetchDataAutomatically();
    }

    if (res.code == 200) {
        // console.log(res);
        // console.log(res.code, res.status);
        // console.log(res.data.meta.latitude, res.data.meta.longitude);
        if (document.getElementById("error").style.display != 'none') {
            changeVisibility("error", "none");
        }

        const namaz1 = {
            "fajr": res.data.timings.Fajr,
            "sunrise": res.data.timings.Sunrise,
            "dhuhr": res.data.timings.Dhuhr,
            "asr": res.data.timings.Asr,
            "maghrib": res.data.timings.Maghrib,
            "isha": res.data.timings.Isha
        }

        for (n in namaz1) {
            document.getElementById(n).innerHTML = tConvert(namaz1[n]);
            console.log(n, namaz1[n]);
        }

        document.getElementById(
            "hijri"
        ).innerHTML = `<i class="far fa-calendar-alt"></i> ${res.data.date.hijri.day} ${res.data.date.hijri.month.en} ${res.data.date.hijri.year} / ${res.data.date.readable}`;

        if (city != null) {
            document.getElementById("location").innerHTML = `<i class="fas fa-map-marker-alt"></i> ${city}, ${country} `;
        } else {
            document.getElementById("location").innerHTML = `<i class="fas fa-map-marked-alt"></i> <abbr title="Latitude">Lat</abbr>: ${res.data.meta.latitude}, <abbr title="Longitude">Long</abbr>: ${res.data.meta.longitude} `;
        }

        // for (let i = 0; i < namaz.length; i++) {
        //     document.getElementById(namaz[i]).innerHTML = tConvert(namazTime[i]);
        // }

        //     console.log(res);
        //     console.log(res.data.timings);
        // console.log(`Time: ${time}, Fajr: ${namazTime[0]}, Sunrise: ${namazTime[1]}, Dhuhr: ${namazTime[2]}, Asr: ${namazTime[3]}, Maghrib: ${namazTime[4]}, Isha: ${namazTime[5]}`);
        // time = "05:05"

        activeTime(namaz1);
        setInterval(() => activeTime(namaz1), 60000);

        function tConvert(time) {
            time = time
                .toString()
                .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

            if (time.length > 1) {
                time = time.slice(1);
                time[5] = +time[0] < 12 ? " AM" : " PM";
                time[0] = +time[0] % 12 || 12;
            }
            return time.join("");
        }
    } else {
        showError(res);
        console.log(`${res.code}: ${res.status}`);
        console.log(res.data);
    }
}

/*------------------------------------------------------------*/

/*----------------------Location fetcher----------------------*/

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showLocationError);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    city = null;
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    // console.log(latitude, longitude);
    setData('Automatic');
}

function showLocationError(error) {
    let x = document.getElementById("error");
    switch (error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "Couldn't fetch information, User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred."
            break;
    }
    changeVisibility("error", "block");
}

/*------------------------------------------------------------*/

/*----------------------Helper Functions----------------------*/

//Data Formatters
function formatTime(time) {
    return time >= 10 ? time : `0${time}`;
}

function formatLocation(str) {
    return `${str.slice(0, 1).toUpperCase()}${str.slice(1).toLowerCase()}`;
}

//Element Modifiers
function changeVisibility(id, display) {
    document.getElementById(id).style.display = display;
}

function showError(msg) {
    document.getElementById("error").innerHTML = `Error ${msg.code} - ${msg.data}`;
    changeVisibility("error", "block");
}

function activeTime(namazTime) {
    const d = new Date();
    time = `${formatTime(d.getHours())}:${formatTime(d.getMinutes())}`;
    if (time >= namazTime['isha']) {
        document.getElementById("isha-cont").classList.add("active");
        document.getElementById("maghrib-cont").classList.remove("active");
    } else if (time >= namazTime['maghrib']) {
        document.getElementById("maghrib-cont").classList.add("active");
        document.getElementById("asr-cont").classList.remove("active");
    } else if (time >= namazTime['asr']) {
        document.getElementById("asr-cont").classList.add("active");
        document.getElementById("dhuhr-cont").classList.remove("active");
    } else if (time >= namazTime['dhuhr']) {
        document.getElementById("dhuhr-cont").classList.add("active");
        document.getElementById("sunrise-cont").classList.remove("active");
    } else if (time >= namazTime['sunrise']) {
        document.getElementById("sunrise-cont").classList.add("active");
        document.getElementById("fajr-cont").classList.remove("active");
    } else if (time >= namazTime['fajr']) {
        document.getElementById("fajr-cont").classList.add("active");
        document.getElementById("isha-cont").classList.remove("active");
    } else {
        document.getElementById("isha-cont").classList.add("active");
        console.log("Else clause activated");
    }
}

/*------------------------------------------------------------*/

function validate(e) {
    if (document.getElementById(e.id).value == '') {
        document.getElementById(e.id).style.border = "1px solid red";
    } else {
        document.getElementById(e.id).style.border = "1px solid #c4c4c4";
        // console.log(this);
        // console.log(e.id);
    }
}