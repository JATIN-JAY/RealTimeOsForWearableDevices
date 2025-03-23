
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: true });
    const dateString = now.toLocaleDateString('en-US');
    const dayString = now.toLocaleDateString('en-US', { weekday: 'long' });

    const timeElement = document.getElementById('currentTime');
    const dateElement = document.getElementById('currentDate');

    if (timeElement) {
        timeElement.innerText = `Time: ${timeString} | Date: ${dateString} | Day: ${dayString}`;
    }
}

window.onload = function () {
    updateTime();
    setInterval(updateTime, 1000);
};
