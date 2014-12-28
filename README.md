Twitter live
=======

Demo url:
https://powerful-ridge-6387.herokuapp.com/

Description.
-----

This is a live dashboard of the most popular words
in english tweets that contain words *money*,
*cash*, *dollar* on a shifting 5 minute period.
I used Twitter streaming API (*'statuses/filter'*)
to fetch tweets.

The server side is responsible for three things:
1. Parsing the tweets and calculating the most
frequently used words
2. Serving the angular app
3. Providing an endpoint to show the top *n* most
used words

In order to make sure that I can query the website
often I decided to use an in-memory storage instead
of a database.

The tweets are parsed in the following way:
1. Remove punctuation and blacklisted words from the tweet.
2. Save the tweet in a sorted set called 'tweets' with the score equal to the timestamp
3. For each word of the tweet increment its score in the 'words' sorted set
4. Perform cleanup. The cleanup consists of the following steps:
  1. timestamp = timestamp of 5 minutes ago
  2. Get all tweets that are older than the timestamp.
  3. Decrement every word in those tweets.
  4. Remove those tweets from the 'tweets' set.
  5. Remove words with non-positive score from 'words' set.

The angular app queries the server every second asking for the top 10 used words, and draws a
donut-chart and a table that show this data in a pretty way.

How to run.
-----
I used [yeoman angular-fullstack
generator](https://github.com/DaftMonk/generator-angular-fullstack) for this app.
This app uses Redis as the data storage, so make
sure you have that installed and configured before proceeding.
Also, this app uses twitter API, so you have to set the appropriate API keys to run the app.
Namely, you have to set the following environment variables:
```
NODE_ENV=development
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_TOKEN_SECRET
TWITTER_CONSUMER_KEY
TWITTER_CONSUMER_SECRET
```
You can set those in *server/config/local.env.js*

In order to test the app, run *grunt test*.
In order to start the app locally make sure to install and launch redis and then run *grunt serve*.
