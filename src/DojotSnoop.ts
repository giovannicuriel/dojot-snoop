import { Messenger } from "@dojot/dojot-module";
import { logger } from "@dojot/dojot-module-logger";
import util = require("util");
import { MetricsRegistry } from "./MetricsRegistry";

const TAG = { filename: "dojot-snoop" };

class DojotSnoop {
    public metricsRegistry: {
        [subject: string]: MetricsRegistry,
    };
    private messenger: Messenger;
    private isInitialized: boolean;

    constructor(config: any) {
        this.isInitialized = false;
        logger.info("Creating new snoop...", TAG);
        this.messenger = new Messenger("dojot-snoop", config);
        logger.info("Initializing Kafka messenger...", TAG);
        this.messenger.init().then(() => {
            logger.info("... Kafka messenger successfully initialized.");
            this.isInitialized = true;
        }).catch((error: any) => {
            logger.error("... Kafka messenger had an error while initializing.");
            logger.error(`Error is: ${util.inspect(error, { depth: null})}`);
        });
        logger.info("... Kafka messenger initialization requested.", TAG);
        logger.info("... snoop was created");
        this.metricsRegistry = {};
    }

    public printMessage(subject: string, tenant: string, data: any) {
        logger.info(`Received message: `);
        logger.info(`${subject}@${tenant}: `);
        logger.info(`>>>> ${data}`);
        this.metricsRegistry[subject].incrMesssage();
    }

    public addSubject(subject: string) {
        if (this.isInitialized == false) {
            logger.warn("Messenger is not yet initialized.");
            return;
        }
        logger.info(`Adding new subject: ${subject}`);
        this.metricsRegistry[subject] = new MetricsRegistry();
        this.messenger.on(subject, "message", (tenant: string, data: any) => {
            this.printMessage(subject, tenant, data);
        });
    }
}

export {
    DojotSnoop,
};
