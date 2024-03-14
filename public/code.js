(function () {
    let receiverID;
    const socket = new WebSocket("ws://localhost:7460"); // Change the URL to match your WebSocket server address

    socket.addEventListener("open", function (event) {
        console.log("Connected to WebSocket server");
    });

    function generateID() {
        return `${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}-${Math.trunc(Math.random() * 999)}`;
    }

    document.querySelector("#sender-start-con-btn").addEventListener("click", function () {
        let joinID = generateID();
        document.querySelector('#join-id').innerHTML = `
            <span>${joinID}</span>
        `;
        socket.send(JSON.stringify({ type: "sender-join", uid: joinID }));
    });

    socket.addEventListener("message", function (event) {
        const data = JSON.parse(event.data);
        console.log(data)
        switch (data.type) {
            case "init":
                receiverID = data.uid;
                console.log("connect success")
                window.location.href = "sharefileconnect.html";
                break;
            default:
                break;
        }
    });
})();