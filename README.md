## Inquire Cisco Spark Bot

#### Written by Aman Chhabra

[![Build Status](https://travis-ci.org/achhabra2/inquire.svg?branch=master)](https://travis-ci.org/achhabra2/inquire)
[![Coverage Status](https://coveralls.io/repos/github/achhabra2/inquire/badge.svg?branch=master)](https://coveralls.io/github/achhabra2/inquire?branch=master)
[![GitHub stars](https://img.shields.io/github/stars/achhabra2/inquire.svg)](https://github.com/achhabra2/inquire/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/achhabra2/inquire/master/LICENSE)
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/achhabra2/inquire)

---

### Description

Inquire helps you ask questions and get answers. It was created to address the forum style nature of business messaging channels. It tracks all questions asked and allows peers to answer. It also contains a frontend where you can view a curated FAQ list.

---

### Deployment

To configure Inquire for your environment there are 2 ways to deploy:

1.  Heroku (Deploy to Heroku button above)
2.  Docker (automated build [here](https://hub.docker.com/r/achhabra2/inquire-auto/))

You will need the following:

1.  Cisco Spark Bot Token _(required)_ [here](https://developer.ciscospark.com/)
2.  Cisco Spark Integration _(required)_ [here](https://developer.ciscospark.com/)

- Save your Oauth Client ID and Client Secret _(required)_
- For the **Redirect URI** put in:

  _https://**{YOUR-APP-FQDN}**/auth/redirect_  
  OR  
  _https://**{HEROKU-APP-NAME}**.herokuapp.com/auth/redirect_ (Heroku Deploy)

- You will need these permissions:
  - `spark:people_read` Read your users’ company directory
  - `spark:rooms_read` List the titles of rooms that your user’s are in
  - `spark:messages_write` Post and delete messages on your users’ behalf
  - `spark:teams_read` List the teams your users are in

3.  An accessibile MongoDB Instance to store the Q&A Data _(optional with heroku deploy)_
4.  Botkit Studio Token _(optional)_

---

### Environment Variables

Set the following environment variables:

| EV Name        | Description                                        |
| -------------- | -------------------------------------------------- |
| BOT_NAME       | The name of your Cisco Spark Bot                   |
| PUBLIC_ADDRESS | The public DNS that you app will be accessible at. |
| ACCESS_TOKEN   | Cisco Spark Bot Access Token From **(1)**          |
| MONGODB_URI    | MongoDB Connection String                          |
| OAUTH_CLIENT   | Oauth Client ID From **(2)**                       |
| OAUTH_SECRET   | Oauth Client Secret From **(2)**                   |
| STUDIO_TOKEN   | BotKit Studio Token from **(3)**                   |
| SECRET         | Webhook Token Secret                               |
| JWT_SECRET     | Secret used to sign JWT                            |
| PT_HOST        | PaperTrail Logging Host                            |
| PT_PORT        | PaperTrail Logging Port                            |
| HOST           | Hostname for your server                           |
