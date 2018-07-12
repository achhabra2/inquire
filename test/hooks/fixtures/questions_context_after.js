module.exports = {
  params: {
    authenticated: true,
    query: {
      $sort: { createdOn: -1 },
      $limit: '20',
      _room:
        'Y2lzY29zcGFyazovL3VzL1JPT00vMjdhMzRhYTAtN2U0Yi0xMWU4LWJiYTgtMzM3ZDhiYjIwMzgy',
      $skip: 0
    },
    route: {},
    provider: 'rest',
    headers: {
      host: 'localhost:3000',
      connection: 'keep-alive',
      accept: 'application/json, text/plain, */*',
      dnt: '1',
      authorization: 'Bearer abcd',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
      referer: 'http://localhost:3000/',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9',
      cookie: 'io=u2W2gqAtnpADGJBZAAAA'
    },
    user: {
      _id: 'abcd',
      ciscospark: {
        accessToken: 'abcd',
        refreshToken: 'abcd'
      },
      createdOn: '2018-04-03T16:27:55.228Z',
      ciscosparkId: 'abcd',
      avatar:
        'https://302cfd031eeecd4af2dd-8d4dbda7eb916c30fc2a5d575e83350b.ssl.cf1.rackcdn.com/V1~3eb59d41a49ff7a82958e800d22718cf~QghvnmC9SYCyQLV4JQiSWQ==~1600',
      displayName: 'Aman Chhabra (APINERDS)',
      email: 'amachhab@apinerds.org',
      __v: 0
    },
    payload: {
      userId: 'abcd'
    }
  },
  type: 'after',
  service: {
    discriminatorKey: '__t',
    discriminators: {},
    id: '_id',
    paginate: { default: 10, max: 1000 },
    lean: true,
    overwrite: true,
    events: [],
    _events: {
      created: [null, null],
      removed: [null, null],
      patched: [null, null]
    },
    _eventsCount: 4
  },
  method: 'find',
  path: 'questions',
  data: {},
  result: {
    total: 1,
    limit: 20,
    skip: 0,
    data: [
      {
        _id: '5b4775730071afab51be171b',
        sequence: 1,
        answered: false,
        starred: false,
        files: [],
        createdOn: '2018-07-12T15:36:19.041Z',
        _room:
          'Y2lzY29zcGFyazovL3VzL1JPT00vMjdhMzRhYTAtN2U0Yi0xMWU4LWJiYTgtMzM3ZDhiYjIwMzgy',
        personEmail: 'amachhab@cisco.com',
        personId:
          'Y2lzY29zcGFyazovL3VzL1BFT1BMRS9kODhiZDc1ZS1iOGMzLTQ4Y2YtYWJjNy01ZWM1Y2JjNzU4YWM',
        text: 'q 1',
        displayName: 'Aman Chhabra',
        html: ' q 1',
        answers: [],
        __v: 0
      }
    ]
  }
};
