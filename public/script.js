const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

const peers = {};
let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // ANSWERING THE UPCOMING CALL FROM THE USER
    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream); // Add to the Grid
        });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });

    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close();
    });

    let text = $('input');
    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            socket.emit('message', text.val());
            text.val('');
        }
    });
    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
        scrollToBottom();
    });
});

var USERID;
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id) // Generate ID by Peer
    USERID = id;
});

// CALLING THE USER
const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream); // PeerJS: Call userID and send Stream
    const video = document.createElement('video'); // Create HTML Video Element
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream) // Add the Stream to the Grid
    });
    call.on('close', () => {
        video.remove();
    });
    console.log('USER ID: ' + userId);
    peers[userId] = call;
}

const addVideoStream = (video, stream) => {
    const div = document.createElement('div');
    const span = document.createElement('span');
    div.className = 'video_div';
    if (USERID == undefined) {
        USERID = 'You';
    }
    span.setAttribute('id', USERID);
    span.innerText = USERID;
    span.className = 'video_name';
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    });
    div.appendChild(video);
    div.appendChild(span);
    videoGrid.append(div);
}

const scrollToBottom = () => {
    var d = $('.main__chat__window');
    d.scrollTop(d.prop('scrollHeigh'));
}

const muteUnmute = () => { // ENABLE VS DISABLE AUDIO
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `;
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `;
    document.querySelector('.main__mute__button').innerHTML = html;
}

const playStop = () => { // ENABLE VS DISABLE VIDEO
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `;
    document.querySelector('.main__video__button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `;
    document.querySelector('.main__video__button').innerHTML = html;
}