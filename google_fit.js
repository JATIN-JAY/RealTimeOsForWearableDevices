const CLIENT_ID = "---";
const REDIRECT_URI = "http://127.0.0.1:3000/main.html";

function getAccessToken() {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    let token = urlParams.get("access_token");

    if (token) {
        localStorage.setItem("google_fit_token", token);
        console.log("Google Fit Access Token:", token);
        window.history.pushState({}, document.title, "main.html");
        getGoogleFitData();
    } else {
        token = localStorage.getItem("google_fit_token");
    }

    return token;
}

function authenticateWithGoogleFit() {
    const AUTH_URL = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read`;
    window.location.href = AUTH_URL;
}

async function getGoogleFitData() {
    let accessToken = getAccessToken();

    if (!accessToken) {
        console.warn("No Access Token Found. Redirecting to Google Login...");
        alert("Please log in to Google Fit to access your health data.");
        authenticateWithGoogleFit();
        return;
    }

    console.log("Fetching Google Fit Data (2-hour intervals)...");

    try {
        const response = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "aggregateBy": [
                    { "dataTypeName": "com.google.step_count.delta" },
                    { "dataTypeName": "com.google.heart_rate.bpm" }
                ],
                "bucketByTime": { "durationMillis": 7200000 },
                "startTimeMillis": Date.now() - (86400000),
                "endTimeMillis": Date.now()
            })
        });

        console.log("Response Status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        console.log("Google Fit Data:", data);
        updateStats(data);
        updateCharts(data);
    } catch (error) {
        console.error("Error fetching Google Fit data:", error);
    }
}

function updateStats(data) {
    console.log("Google Fit Data:", data);

    if (!data.bucket || data.bucket.length === 0) {
        console.warn("No Google Fit Data Available.");
        return;
    }

    const lastBucket = data.bucket[data.bucket.length - 1];
    const steps = lastBucket?.dataset[0]?.point?.[0]?.value?.[0]?.intVal || 0;
    const heartRate = lastBucket?.dataset[1]?.point?.[0]?.value?.[0]?.fpVal || "--";
    const temperature = (Math.random() * (38 - 36) + 36).toFixed(1);

    document.getElementById("stepCount").innerText = `🏃 Steps: ${steps}`;
    document.getElementById("heartRate").innerText = `❤️ Heart Rate: ${heartRate} BPM`;
    document.getElementById("temperature").innerText = `🌡️ Temperature: ${temperature} °C`;
}

function updateCharts(data) {
    if (!data.bucket || data.bucket.length === 0) return;

    data.bucket.forEach(bucket => {
        const timestamp = new Date(parseInt(bucket.startTimeMillis)).toLocaleTimeString();
        const steps = bucket?.dataset[0]?.point?.[0]?.value?.[0]?.intVal || 0;
        const heartRate = bucket?.dataset[1]?.point?.[0]?.value?.[0]?.fpVal || 0;

        heartRateChart.data.labels.push(timestamp);
        heartRateChart.data.datasets[0].data.push(heartRate);
        heartRateChart.update();

        stepCountChart.data.labels.push(timestamp);
        stepCountChart.data.datasets[0].data.push(steps);
        stepCountChart.update();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("syncWatchBtn");
    if (button) {
        button.addEventListener("click", () => {
            console.log("Syncing Watch & Fetching Google Fit Data...");
            getGoogleFitData();
        });
    } else {
        console.error("Button #syncWatchBtn not found!");
    }
});

window.onload = () => {
    const token = getAccessToken();
    if (token) {
        console.log("Token Found: Ready to Sync Watch.");
    }
};
