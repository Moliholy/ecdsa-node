import { useState } from "react";
import server from "./server";
import {Buffer} from 'buffer';

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {data: {sendRequest}} = await server.post('request', {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
      });
      await ethereum.request({
        method: 'eth_requestAccounts',
      });
      const msgHex = Buffer.from(sendRequest.message, 'utf8').toString('hex');
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [`0x${msgHex}`, address]
      });
      const {
        data: { balance },
      } = await server.post(`send`, {
        requestId: sendRequest.id,
        signature
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
