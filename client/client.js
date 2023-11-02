const socket = new WebSocket('ws://localhost:3000');
let username = prompt('Ingresa tu nombre:');
let userId = null;

const recipientSelect = document.getElementById('recipient');
const clientId = null;

const messages = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendButton = document.querySelector('button');

socket.addEventListener('open', (event) => {
    console.log('Established connection');
    socket.send(JSON.stringify({ type: 'username', username: username }));
});

socket.addEventListener('message', (event) => {
    let messageData;

    try {
        messageData = JSON.parse(event.data);

        if (messageData.type === 'userId'){
            userId = messageData.id;
            console.log(userId);
        }
        else if (messageData.type === 'userList') {
            const users = messageData.users;
            const recipientSelect = document.getElementById('recipient');

            recipientSelect.innerHTML = '';

            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'Todos';
            recipientSelect.appendChild(allOption);

            users.forEach(([id, username]) => {
                if(id !== userId){
                        const option = document.createElement('option');
                        option.value = id;
                        option.textContent = username;
                        recipientSelect.appendChild(option);
                }
            });
        } else {
            const { username, message } = messageData;
            const messageText = `<strong>${username}:</strong> ${message}`;
            const li = document.createElement('li');
            li.innerHTML = messageText;
            messages.appendChild(li);
        }
    } catch (error) {
        const li = document.createElement('li');
        li.textContent = event.data;
        messages.appendChild(li);
    }
});

sendButton.addEventListener('click', () => {
    const messageText = messageInput.value;
    const selectedRecipient = recipientSelect.value;
    const messageData = {
        username,
        message: messageText,
        recipient: selectedRecipient,
    };
    socket.send(JSON.stringify(messageData));
    messageInput.value = '';
});