dojot-snoop
-----------

A teeny-tiny listener to all messages from dojot modules.

The following environment variables can be set in order to locate dojot services
(all values are the default ones):
```
export LD_LIBRARY_PATH=$(pwd)/node_modules/node-rdkafka/build/deps/
export AUTH_URL=http://auth:5000
export KAFKA_HOSTS=kafka:9092
export DATA_BROKER_URL=http://data-broker
```

# Installing

Just run:
```
npm install
```

if you checked out the repository and you are good to go. Don't forget to set
the LD_LIBRARY_PATH (if you are using Linux) to properly locate librdkafka:

```
export LD_LIBRARY_PATH=$(pwd)/node_modules/node-rdkafka/build/deps/
```

Also, you could install it by executing:

```
npm install @giovannicuriel/dojot-snoop
```

and things might work.

