/**
 *
 * @textile/hub Mocks
 */

// Auth Keys

// hub cli command  > hub whoami
const USERKEY = 'bbaareiavmr6rszwqldtcenujqatp2uzd4sgfaoaz6pmejqdfrr6qu3scyq'
// hub cli command  > hub keys ls
const SECRETKEY = 'b7bna3rw4o27pewo6zgjhyczowzvrlurgf3ryulq'
const GROUPKEY = 'b2mqyfghnqgt6sxy27y2lvddx44'

// User model
const user = {
  sig: 'buedhvywy3w7xe4ppojs6zf3ttdjplj72ul5mzi77r332cegdha7q',
  msg: '2021-02-01T20:11:20.404Z',
  key: 'b2mqyfghnqgt7sxy27y2lvsdx44',
  token: undefined
}

const token = 'eyJhbGciOiJFZDI1NTE5IinidHlwIjoiSldlIn0.eyJpYXQiOjE2MTIyMDg0ODAsImlzcyI6ImJiYWFyZWlnd2pvYXd1ZWc1a3ZobWMzNjI3Z3Zja2htZTd6emZlbnVqYXVqcHRodGd6Y21odHRvYTZ1Iiwic3ViIjoiYmJhYXJlaWFjdzN4eGVlaml6cGJiYW1kdTN3empqcHo3dG4yZm93c2VzYmNibjZ6NGU2dHg2aHZ5cmkifQ.HBxLZiL0_ULr4uRX1jiHIWHDA2n1rwyfnBPELJ2PdKVc7dshByeMyGPsblqCYqseiew4CL3QOofPGqQjzC8aCA'

// Bucket mock
const buck = {
  root: {
    key: 'bafzbeig7ptkwp7fd5bifmgtlkotnhe2baj2lyolkki5rusfl6gwfcfe3wu',
    name: 'testBucket',
    path: '/ipfs/bafybeictv6txcyj5qdrmqbadbjs4qbiv243u3ocywyirjdcs77ej3opd54',
    createdAt: 1611894550384268300,
    updatedAt: 1612203974981291800,
    thread: 'bafkqlqh6tazj3ex4ugdwpasuyc3klurkrxcztbvzp3ivcgb6ma7kk6a'
  },
  threadID: 'bafkqlqh6tazj3ex4ugdwpasuyc3klurkrxcztbvzp3ivcgb6ma7kk6a'
}
// Mock of a successful push
const pushResult = {
  path: {
    path: '/ipfs/bafkreibvd5v4qs2vzxc3woltsolutesei7ejmcvu4f24gz223a6pmu5rfm',
    cid: 'bafkreibvp5v4qs2vzxc3woltsolutezei7ejmcvu4f24gz223a6pmu5rfm',
    root: 'bafkreibvp5v4qs2vzxc3woltsoluresei7ejmcvu4f24gz223a6pmu5rfm',
    remainder: ''
  },
  root: '/ipfs/bafybela7w2ripkevzbrs421kq3ypsgujaivz7p42cn6rplafcocuszfyqi'

}

// Buckets mocks
const buckets = {
  getToken: () => { return token },
  getOrCreate: () => { return buck },
  pushPath: () => { return pushResult }
}
// Clients Mock
const client = {
  getToken: () => { return token }

}

const textileMocks = {
  USERKEY,
  SECRETKEY,
  GROUPKEY,
  user,
  token,
  buckets,
  client,
  pushResult
}
module.exports = textileMocks
