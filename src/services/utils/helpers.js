const request = require('superagent');
const parseLink = require('parse-link-header');
const Debug = require('debug');

const answerRegex = /(answer|\/a\/?)(?:\s+)?(\d+)\s+(?:\-\s+)?(.+.*)$/i;

const debug = Debug('botkit:utils');

/**
 * Helper methods for Inquire on Botkit
 *
 * @class Helpers
 */
class Helpers {
  constructor(app) {
    this.app = app;
  }

  /**
   * Removes bot name from incoming message
   *
   * @param {string} message Incoming bot message
   * @returns {string} Sanitized message
   * @memberof Helpers
   */
  formatText(message) {
    let reg = new RegExp(this.app.get('bot_name'), 'i');
    message.text = message.text.replace(reg, '');
    return message;
  }

  async patchRoom(spaceId) {
    try {
      const response = await request
        .get(`https://api.ciscospark.com/v1/rooms/${spaceId}`)
        .set('Authorization', `Bearer ${this.app.get('access_token')}`);
      const room = response.body;
      let patch = {};
      patch.displayName = room.title;
      if (room.teamId) patch.teamId = room.teamId;
      await this.app.service('spaces').patch(spaceId, patch);
    } catch (error) {
      console.error('Could not update space details: ', spaceId);
    }
  }
  /**
   *
   *
   * @param {string} personId Spark personId
   * @returns {object}
   * @memberof Helpers
   */
  async getPerson(personId) {
    const res = await request
      .get(`https://api.ciscospark.com/v1/people/${personId}`)
      .set('Authorization', `Bearer ${this.app.get('access_token')}`);
    return res.body;
  }

  /**
   * Update space activity field
   *
   * @param {string} roomId Cisco Spark spaceId
   * @returns {Promise} Updated Room Instance
   * @memberof Helpers
   */
  async updateRoomActivity(roomId) {
    try {
      const update = { lastActivity: Date.now() };
      const newRoom = await this.app.service('spaces').patch(roomId, update);
      return newRoom;
    } catch (error) {
      debug('Couldn\'t update Room Activity.');
    }
  }

  /**
   * Spark get memberships method with pagination support
   *
   * @param {string} [url='https://api.ciscospark.com/v1/memberships']
   * @param {string} roomId
   * @param {Array} [members=[]]
   * @returns {Array} Array of Memberships Data
   * @memberof Helpers
   */
  getMembershipsPaginated(
    url = 'https://api.ciscospark.com/v1/memberships',
    roomId,
    members = []
  ) {
    // let headers = {
    //   'auth': {
    //     'bearer': process.env.access_token
    //   },
    //   resolveWithFullResponse: true
    // };
    const query = roomId ? { roomId: roomId, max: 999 } : {};
    return request
      .get(url)
      .set('Authorization', `Bearer ${this.app.get('access_token')}`)
      .query(query)
      .then(response => {
        let links;
        let responseArray = members.concat(response.body.items);
        // console.log(`ResponseArray: ${JSON.stringify(responseArray)}`);
        // console.log(`Response headers ${JSON.stringify(response.headers)}`);
        if (response.headers.link) {
          links = parseLink(response.headers.link);
          if (links.next.url) {
            return this.getMembershipsPaginated(
              links.next.url,
              null,
              responseArray
            );
          }
        } else return responseArray;
      });
  }

  /**
   * Update Room Memberships Object
   *
   * @param {string} roomId Spark spaceId
   * @returns {object} Spark Space Object
   * @memberof Helpers
   */
  async updateRoomMemberships(roomId) {
    try {
      let memberships = await this.getMembershipsPaginated(undefined, roomId);
      let moderators = memberships.reduce((moderators, member) => {
        if (member.isModerator) moderators.push(member.personId);
        return moderators;
      }, []);
      memberships = memberships.map(member => member.personId);
      const patch = { memberships, moderators };
      const space = await this.app.service('spaces').patch(roomId, patch);
      return space;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   *
   *
   * @param {any} data
   * @returns
   * @memberof Helpers
   */
  async handleMembershipChange(data) {
    const room = await this.checkRoom(data);
    if (room) {
      return this.updateRoomMemberships(data.channel);
    } else {
      console.error('Existing room not found');
      return null;
    }
  }

  /**
   *
   *
   * @param {any} message
   * @returns
   * @memberof Helpers
   */
  async getUserDetails(message) {
    try {
      const person = await this.getPerson(message.data.personId);
      message.personDisplayName = person.displayName;
      message.user = person.emails[0];
      message.data.personId = person.id;
      return message;
    } catch (error) {
      console.error('Could not attach person details');
      return message;
    }
  }

  /**
   *
   *
   * @param {any} message
   * @returns
   * @memberof Helpers
   */
  async getRoomDetails(message) {
    try {
      const response = await request
        .get(`https://api.ciscospark.com/v1/rooms/${message.channel}`)
        .set('Authorization', `Bearer ${this.app.get('access_token')}`);
      const room = response.body;
      message.roomTitle = room.title;
      if (room.teamId) message.roomTeamId = room.teamId;
      return message;
    } catch (error) {
      console.error('Could not get Room details');
      return message;
    }
  }

  /**
   * Upsert creation of room / question
   *
   * @param {any} message
   * @param {any} room
   * @returns
   * @memberof Helpers
   */
  async addQuestion(message, room) {
    message = this.formatText(message);
    room.sequence += 1;
    room.lastActivity = Date.now();
    let question = {
      _room: message.channel,
      personEmail: message.user,
      personId: message.data.personId,
      text: message.text,
      displayName: message.personDisplayName || 'Unknown',
      sequence: room.sequence,
      createdOn: Date.now()
    };
    if (message.html) {
      question.html = message.html;
    }
    if (message.data.files) {
      question.files = message.data.files;
    }
    await this.app.service('spaces').patch(room._id, room);
    return this.app.service('questions').create(question);
  }

  /**
   * Create a new room object
   *
   * @param {any} message
   * @returns
   * @memberof Helpers
   */
  checkRoom(message) {
    return this.app.service('spaces').get(message.channel);
  }

  /**
   * Create a new room object
   *
   * @param {any} message
   * @returns
   * @memberof Helpers
   */
  async createRoom(message) {
    let newRoom = {
      _id: message.channel,
      orgId: message.orgId,
      displayName: message.roomTitle || 'Unknown',
      active: true
    };
    if (message.roomTeamId) {
      newRoom.teamId = message.roomTeamId;
    }
    return this.app.service('spaces').create(newRoom);
  }

  /**
   * Add the answer object to the question object
   *
   * @param {any} message
   * @returns
   * @memberof Helpers
   */
  async addAnswer(message) {
    let match = answerRegex.exec(message.text);
    let sequence = Number(match[2]);
    let htmlMatch;
    let htmlMessage;
    if (message.html) {
      htmlMatch = answerRegex.exec(message.html);
      htmlMessage = htmlMatch[3];
    }
    let answer = {
      personEmail: message.user,
      personId: message.data.personId,
      displayName: message.personDisplayName,
      text: match[3],
      createdOn: Date.now()
    };
    if (htmlMessage) {
      answer.html = htmlMessage;
    }
    if (message.data.files) {
      answer.files = message.data.files;
    }
    let query = {
      _room: message.channel,
      sequence: sequence
    };
    let update = {
      $push: {
        answers: answer
      },
      answered: true
    };
    const questions = await this.app
      .service('questions')
      .patch(null, update, { query });
    return questions[0];
  }

  /**
   * Find the answer to a specific question.
   *
   * @param {any} message
   * @returns
   * @memberof Helpers
   */
  async findQuestion(message) {
    let match = answerRegex.exec(message.text);
    let sequence = Number(match[2]);
    let query = {
      _room: message.channel,
      sequence: sequence
    };
    const questions = await this.app.service('questions').find({ query });
    return questions[0];
  }

  /**
   *
   *
   * @param {any} message
   * @returns
   * @memberof Helpers
   */
  async handleQuestion(message) {
    console.log('Incoming message is:', message.text);
    let updatedMessage;
    try {
      const room = await this.checkRoom(message);
      console.log('Found Room: ', room._id);
      updatedMessage = await this.getUserDetails(message);
      return this.addQuestion(updatedMessage, room);
    } catch (error) {
      updatedMessage = await this.getRoomDetails(message);
      const room = await this.createRoom(updatedMessage);
      await this.updateRoomMemberships(room._id);
      return this.handleQuestion(updatedMessage);
    }
  }

  /**
   * Handler for bot_space_join
   *
   * @param {any} event
   * @returns
   * @memberof Helpers
   */
  async handleSpaceJoin(event) {
    try {
      try {
        const room = await this.checkRoom(event);
        if (room) {
          await this.updateRoomMemberships(event.channel);
          const update = { active: true };
          return await this.app.service('spaces').patch(event.channel, update);
        }
      } catch (error) {
        console.log('No Room found for:', event.channel);
        const updatedEvent = await this.getRoomDetails(event);
        await this.createRoom(updatedEvent);
        return await this.updateRoomMemberships(updatedEvent.channel);
      }
    } catch (error) {
      debug('Could not create space');
    }
  }

  /**
   * Handler for bot_space_leave
   *
   * @param {any} event
   * @returns
   * @memberof Helpers
   */
  async handleSpaceLeave(event) {
    const update = { active: false };
    try {
      return await this.app.service('spaces').patch(event.channel, update);
    } catch (error) {
      debug('Could not remove space');
    }
  }

  /**
   *
   *
   * @param {any} message
   * @returns
   * @memberof Helpers
   */
  async handleAnswer(message) {
    try {
      await this.updateRoomActivity(message.channel);
      const updatedMessage = await this.getUserDetails(message);
      return await this.addAnswer(updatedMessage);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   *
   *
   * @param {any} roomId
   * @param {any} filter
   * @param {string} [sort='sequence']
   * @param {number} [limit=10]
   * @param {number} [page=1]
   * @param {any} [search=null]
   * @returns
   * @memberof Helpers
   */
  async listQuestions(
    roomId,
    filter,
    sort = 'sequence',
    limit = 10,
    page = 1,
    search = null
  ) {
    if (search || filter)
      return this.searchQuestions(roomId, filter, sort, limit, page, search);
    else {
      const query = {
        _room: roomId,
        $limit: limit,
        $skip: (page - 1) * limit,
        $sort: sort
      };
      return this.app.service('questions').find({ query });
    }
  }

  /**
   *
   *
   * @param {any} roomId
   * @param {any} filter
   * @param {string} [sort='sequence']
   * @param {number} [limit=10]
   * @param {number} [page=1]
   * @param {any} search
   * @returns
   * @memberof Helpers
   */
  searchQuestions(
    roomId,
    filter,
    sort = 'sequence',
    limit = 10,
    page = 1,
    search
  ) {
    let answered;
    if (filter == 'unanswered') {
      answered = {
        $ne: true
      };
    } else if (filter == 'answered') {
      answered = {
        $ne: false
      };
    }
    var query = {
      _room: roomId,
      $limit: limit,
      $skip: (page - 1) * limit,
      $sort: sort
    };
    if (answered) {
      query.answered = answered;
    }
    if (search) {
      query.$text = {
        $search: search
      };
    }
    // console.log('Running Query: ', query);
    return this.app.service('questions').find({ query });
  }

  async switchMode(spaceId, mode) {
    const update = { mode: mode };
    try {
      const newRoom = await this.app.service('spaces').patch(spaceId, update);
      return newRoom;
    } catch (error) {
      throw error;
    }
  }

  async checkModerator(message) {
    try {
      const space = await this.app.service('spaces').get(message.channel);
      if (space.moderators.length > 0) {
        if (space.moderators.indexOf(message.actorId) !== -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } catch (error) {
      console.error('Could not verify moderation rights');
      return true;
    }
  }

  async updateSticky(message) {
    try {
      let update = {
        sticky: message.html
      };
      return this.app.service('spaces').patch(message.channel, update);
    } catch (error) {
      console.error(
        'Could not update sticky message for space',
        message.channel
      );
      throw new Error('Could not update');
    }
  }
}

module.exports = Helpers;
