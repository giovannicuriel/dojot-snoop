#!/usr/bin/node
import { logger, Messenger } from "@dojot/dojot-module";
import { Server } from "./Server";

logger.transports[0].level = "info";

const config = {
  auth: {
    host: process.env.AUTH_URL || "http://auth:5000",
  },
  databroker: {
    host: process.env.DATA_BROKER_URL || "http://data-broker",
  },
  dojot: {
    managementService: process.env.DOJOT_SERVICE_MANAGEMENT || "dojot-management",
    subjects: {
      deviceData: process.env.DOJOT_SUBJECT_DEVICE_DATA || "device-data",
      devices: process.env.DOJOT_SUBJECT_DEVICES || "dojot.device-manager.device",
      tenancy: process.env.DOJOT_SUBJECT_TENANCY || "dojot.tenancy",
    },
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
      "group.id": process.env.KAFKA_GROUP_ID || "data-broker",
      "metadata.broker.list": process.env.KAFKA_HOSTS || "kafka:9092",
      "socket.receive.buffer.bytes": 0,
    },
  },
};

logger.info("Starting dojot messenger...");
const messenger = new Messenger("dojot-snoop", config);
logger.info("... dojot messenger was started.");

const server = new Server(10000);
const deviceDataMetrics = server.registerSubject("device-data");
const devicesMetrics = server.registerSubject("dojot.device-manager.device");
const tenancyMetrics = server.registerSubject("dojot.tenancy");

messenger.on("device-data", "message", (tenant: string, msg: any) => {
  logger.info(`Client: Received message in device-data subject.`, {filename: "dojot-snoop"});
  logger.info(`Client: Tenant is: ${tenant}`, {filename: "dojot-snoop"});
  logger.info(`Client: Message is: ${msg}`, {filename: "dojot-snoop"});
  deviceDataMetrics.incrMesssage();
});

messenger.on("dojot.device-manager.device", "message", (tenant: string, msg: any) => {
  logger.info(`Client: Received message in dojot.device-manager.device subject.`, {filename: "dojot-snoop"});
  logger.info(`Client: Tenant is: ${tenant}`, {filename: "dojot-snoop"});
  logger.info(`Client: Message is: ${msg}`, {filename: "dojot-snoop"});
  devicesMetrics.incrMesssage();
});

messenger.on("dojot.tenancy", "new-tenant", (newtenant: string) => {
  logger.info(`Client: Received message in tenancy subject.`, {filename: "dojot-snoop"});
  logger.info(`Client: Tenant is: ${newtenant}`, {filename: "dojot-snoop"});
  tenancyMetrics.incrMesssage();
});
