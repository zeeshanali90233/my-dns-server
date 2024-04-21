const datagram = require("node:dgram");
const dnsPacket = require("dns-packet");
const server = datagram.createSocket("udp6");

const data = {
  "zeeshanali.org": {
    type: "A",
    data: "192.168.1.2",
  },
};
server.on("message", (msg, rinfo) => {
  const incomingReq = dnsPacket.decode(msg);
  const ipFromDb = data[incomingReq.questions[0].name];
  const buf = dnsPacket.encode({
    type: "response",
    id: incomingReq.id,
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: [
      {
        type: (ipFromDb && ipFromDb.type) || "A",
        class: "IN",
        name: incomingReq.questions[0].name,
      },
    ],
    answers: [
      {
        type: (ipFromDb && ipFromDb.type) || "A",
        class: "IN",
        name: incomingReq.questions[0].name,
        data: (ipFromDb && ipFromDb.data) || "192.168.1.1",
      },
    ],
  });
  server.send(buf, rinfo.port, rinfo.address);
});

server.bind(53, () => {
  console.log("Server is running on PORT: 53");
});
