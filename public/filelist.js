(function () {
    let senderID;
    const socket = new WebSocket("ws://localhost:7460"); 
    function downloadBlob(blob, filename) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  
    socket.addEventListener("open", function () {
      console.log("WebSocket connection established.");
    });
  
    socket.addEventListener("error", function (error) {
      console.error("WebSocket error:", error);
      // Handle WebSocket connection errors here
    });
  
    let fileShare = {};
    let totalBufferSize = 0;
    socket.addEventListener("message", function (event) {
      const data = JSON.parse(event.data);
      // console.log("Received message:", event.data); // Log the received message
  
      switch (data.type) {
        case "fs-meta":
          console.log("Received metadata:", data); // Log the received metadata
  
          fileShare.metadata = data.metadata;
          fileShare.transmitted = 0;
          fileShare.buffer = [];
          totalBufferSize = data.metadata.total_buffer_size;
  
          let el = document.createElement("div");
          el.classList.add("item");
          el.innerHTML = `
                  <div class="progress">0%</div>
                  <div class="filename">${data.metadata.filename}</div>
              `;
          document.querySelector(".file-list").appendChild(el);
          fileShare.progress_node = el.querySelector(".progress");
          break;
        case "fs-share":
          // console.log(data)
          const bufferArr = new Uint8Array(data.buffer);
          console.log(bufferArr)
          // const byteLength = Object.keys(buffer).length;
          // const buffer = data.buffer;
          // const byteLength = JSON.stringify(buffer).length;
  
          fileShare.buffer.push(bufferArr);
  
          fileShare.transmitted += bufferArr.byteLength;
  
          const progress = (fileShare.transmitted / totalBufferSize) * 100;
          // console.log(fileShare.transmitted, totalBufferSize)
          fileShare.progress_node.innerText = Math.trunc(progress) + "%";
  
  
          if (fileShare.transmitted == totalBufferSize) {
            console.log("File transmission complete. Downloading file...");
  
            const fileBlob = new Blob(fileShare.buffer);
            downloadBlob(fileBlob, fileShare.metadata.filename);
            
            fileShare = {};
          } else {
            console.log("Sending start signal for next chunk.");
            socket.send(JSON.stringify({ type: "fs-start", uid: senderID }));
          }
          break;
        default:
          console.log("Unknown message type:", data.type); // Log unknown message types
          break;
      }
    });
  })();