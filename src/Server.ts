import { logger } from "@dojot/dojot-module";
import bodyParser = require("body-parser");
import express = require("express");
import { MetricsRegistry } from "./MetricsRegistry";

export class Server {
    protected app: express.Application;
    protected metrics: {
        [subject: string]: MetricsRegistry,
    };

    constructor(port: number) {
        this.app = express();
        this.app.use(bodyParser.json());
        this.metrics = {};
        this.registerEndpoints();
        this.app.listen(port, () => {
            logger.info(`Listening on port ${port}.`);
        });
    }

    public registerSubject(subject: string): MetricsRegistry {
        this.metrics[subject] = new MetricsRegistry();
        return this.metrics[subject];
    }

    protected registerEndpoints() {
        this.app.get("/metrics/:subject", (req, res) => {
            if (!(req.params.subject in this.metrics)) {
                return res.status(404).send(`subject ${req.params.subject} not being analyzed`);
            }
            const messageCounter = this.metrics[req.params.subject].messageCounter;
            const accumulated = this.metrics[req.params.subject].accumulated;
            return res.status(200).send({ accumulated, messageCounter });
        });

        this.app.delete("/metrics/:subject", (req, res) => {
            if (!(req.params.subject in this.metrics)) {
                return res.status(404).send("subject not being analyzed");
            }
            this.metrics[req.params.subject].clearMessageCounters();
            return res.status(200).send();
        });

        this.app.put("/metrics/:subject", (req, res) => {
            if (!(req.params.subject in this.metrics)) {
                return res.status(404).send("subject not being analyzed");
            }
            this.metrics[req.params.subject].blockSize = req.body.blockSize;
            return res.status(200).send();
        });

        this.app.get("/mean/:subject", (req, res) => {
            if (!(req.params.subject in this.metrics)) {
                return res.status(404).send("subject not being analyzed");
            }
            let curr = 0;
            const ret = [];
            const subject = req.params.subject;
            const accumulated = this.metrics[subject].accumulated;
            const blockSize = this.metrics[subject].blockSize;
            for (const data of accumulated) {
                const value = (blockSize / (data - curr)) * 1000;
                curr = data;
                ret.push(`${value} msg/s`);
            }
            return res.status(200).send({ ret });
        });
    }
}
