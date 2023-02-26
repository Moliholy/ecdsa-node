require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const cors = require('cors');
const Web3 = require("web3");
const port = 3042;

app.use(cors());
app.use(express.json());

// Fill here with your metamask address and the balance you desire
const balances = {
  [process.env.ADDRESS]: 100
};
const sendRequests = {};

app.post('/request', (req, res) => {
  const {sender, recipient, amount} = req.body;
  if (!sender || !recipient || !amount) {
    res.status(400).send('Invalid data');
    return;
  }
  const id = uuidv4();
  const result = {
    id,
    sender,
    recipient,
    amount,
    message: `Address ${sender} want to send ${amount} to ${recipient} in the request ${id}`
  };
  sendRequests[id] = result;
  res.send({sendRequest: result});
});

app.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const { requestId, signature } = req.body;
  const sendRequest = sendRequests[requestId];
  if (!sendRequest) {
    res.status(400).send(`No request found with ID ${requestId}`);
    return;
  }

  const {sender, recipient, amount, message} = sendRequest;
  const web3 = new Web3();
  const signer = web3.eth.accounts.recover(message, signature);
  if (signer !== sender) {
    res.status(400).send('Invalid signature');
    return;
  }
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: 'Not enough funds!' });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
