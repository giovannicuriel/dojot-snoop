#!/usr/bin/node
import { logger } from "@dojot/dojot-module-logger";
import { DojotSnoop } from "./DojotSnoop";
import { Server } from "./Server";

logger.transports[0].level = "info";

const config = {
  auth: {
    connectionRetries: 5,
    timeoutSleep: 5,
    url: process.env.AUTH_URL || "http://auth:5000",
  },
  databroker: {
    connectionRetries: 5,
    timeoutSleep: 2,
    url: process.env.DATA_BROKER_URL || "http://data-broker",
  },
  deviceManager: {
    connectionRetries: 3,
    timeoutSleep: 5,
    url: process.env.DEVICE_MANAGER_URL || "http://device-manager:5000",
  },
  dojot: {
    management: {
      tenant: process.env.DOJOT_MANAGEMENT_TENANT || "dojot-management",
      user: process.env.DOJOT_MANAGEMENT_USER || "dojot-management",
    },
    subjects: {
      deviceData: process.env.DOJOT_SUBJECT_DEVICE_DATA || "device-data",
      devices: process.env.DOJOT_SUBJECT_DEVICES || "dojot.device-manager.device",
      tenancy: process.env.DOJOT_SUBJECT_TENANCY || "dojot.tenancy",
    }
  },
  kafka: {
    producer: {
      "batch.num.messages": 1000000,
      "client.id": "kafka",
      "compression.codec": "snappy",
      "dr_cb": false,
      "message.send.max.retries": 10,
      "metadata.broker.list": process.env.KAFKA_HOSTS || "kafka:9092",
      "queue.buffering.max.messages": 100000,
      "queue.buffering.max.ms": 1000,
      "retry.backoff.ms": 200,
      "socket.keepalive.enable": true,
    },

    consumer: {
      "group.id": process.env.KAFKA_GROUP_ID || "dojot-snoop-group",
      "metadata.broker.list": process.env.KAFKA_HOSTS || "kafka:9092",
      "socket.receive.buffer.bytes": 0,
    },
    dojot: {
      connectionRetries: 5,
      subscriptionHoldoff: Number(process.env.DOJOT_SUBSCRIPTION_HOLDOFF) || 2500,
      timeoutSleep: 5,
    },
  },
};

logger.info("Starting dojot snoop...");
const snoop = new DojotSnoop(config);
const server = new Server(10000, snoop);
server.init();
